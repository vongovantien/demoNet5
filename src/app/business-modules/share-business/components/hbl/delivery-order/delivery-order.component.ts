import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';

import { AppForm } from '@app';
import { DeliveryOrder, User, CsTransaction } from '@models';
import { DocumentationRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { SystemConstants, ChargeConstants } from '@constants';
import { IAppState } from '@store';
import { DataService } from '@services';

import { catchError, takeUntil, switchMap, finalize, map, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as fromShare from './../../../store';

@Component({
    selector: 'hbl-delivery-order',
    templateUrl: './delivery-order.component.html'
})

export class ShareBusinessDeliveryOrderComponent extends AppForm {
    @Input() isAir: boolean = false;
    @Input() set type(t: string) { this._type = t; }

    get type() { return this._type; }

    private _type: string = ChargeConstants.SFI_CODE; // ? SLI

    deliveryOrder: DeliveryOrder = new DeliveryOrder();
    userLogged: User;
    hblid: string;

    constructor(
        private _documentRepo: DocumentationRepo,
        private _store: Store<IAppState>,
        private _ngProgress: NgProgress,
        private _dataService: DataService,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute
    ) {
        super();
        this._progressRef = this._ngProgress.ref();

    }

    ngOnInit() {
        // * Get User logged.
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    if (p.hblId) {
                        this.hblid = p.hblId;
                    } else {
                        this.hblid = SystemConstants.EMPTY_GUID;
                    }
                    return of(this.hblid);
                }),
                // * Get data delivery order
                switchMap((p) => {
                    return this._documentRepo.getDeliveryOrder(this.hblid, this.utility.getTransationType(this._type));
                }),
                concatMap((data: DeliveryOrder) => {
                    // * Update deliveryOrder model from dataDefault.
                    this.deliveryOrder.dofooter = data.dofooter;
                    this.deliveryOrder.doheader2 = data.doheader2;
                    this.deliveryOrder.doheader1 = data.doheader1;

                    if (!data.deliveryOrderNo) {
                        return this._store.select(fromShare.getTransactionDetailCsTransactionState).pipe(takeUntil(this.ngUnsubscribe));
                    } else {
                        this.deliveryOrder.deliveryOrderNo = data.deliveryOrderNo;
                        this.deliveryOrder.deliveryOrderPrintedDate = {
                            startDate: new Date(data.deliveryOrderPrintedDate),
                            endDate: new Date(data.deliveryOrderPrintedDate),
                        };

                        return of(this.deliveryOrder);
                    }
                }),
                map((res: CsTransaction | DeliveryOrder | any) => {
                    // * If res are DeliveryOrder object
                    if (res.hasOwnProperty("doheader1")) {
                        return res;
                    }

                    // * Update field from shipment
                    if (!this.deliveryOrder.doheader1) {
                        this.deliveryOrder.doheader1 = this.generateDoHeader(res, this.isAir);
                    }
                    this.deliveryOrder.deliveryOrderNo = res.jobNo + "-" + this.generateDeliveryOrderNo(this.isAir);
                    this.deliveryOrder.deliveryOrderPrintedDate = {
                        startDate: new Date(),
                        endDate: new Date()
                    };

                    if (this.isAir) {
                        this.deliveryOrder.subAbbr = !!res.warehousePOD ? res.warehousePOD.nameAbbr : null;
                    }

                    return new DeliveryOrder(this.deliveryOrder);
                })
            )
            .subscribe((res) => { console.log("subscribe", res); });

        // *? Subscribe dataService to get podName from HBL.
        this._dataService.currentMessage
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: { [key: string]: any }) => {
                    if (res.podName) {
                        this.deliveryOrder.doheader1 = res.podName;
                    }
                }
            );

        this.isLocked = this._store.select(fromShare.getTransactionLocked);
    }

    setDefaultHeadeFooter() {
        const body: IDefaultHeaderFooter = {
            type: this.utility.getTransationType(this._type),
            userDefault: this.userLogged.id,
            doheader1: this.deliveryOrder.doheader1,
            doheader2: this.deliveryOrder.doheader2,
            dofooter: this.deliveryOrder.dofooter,
            subAbbr: this.deliveryOrder.subAbbr
        };
        this._progressRef.start();
        this._documentRepo.setDefaultHeaderFooterDeliveryOrder(body)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    saveDeliveryOrder() {
        this._progressRef.start();
        const printedDate = {
            deliveryOrderPrintedDate: !!this.deliveryOrder.deliveryOrderPrintedDate && !!this.deliveryOrder.deliveryOrderPrintedDate.startDate ? formatDate(this.deliveryOrder.deliveryOrderPrintedDate.startDate, 'yyyy-MM-dd', 'en') : null,
        };

        this.deliveryOrder.hblid = this.hblid;
        this._documentRepo.updateDeliveryOrderInfo(Object.assign({}, this.deliveryOrder, printedDate))
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * Dispatch for detail HBL to update HBL state.
                        this._store.dispatch(new fromShare.GetDetailHBLAction(this.hblid));
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    generateDeliveryOrderNo(isAir: boolean) {
        if (isAir) {
            return "AL01";
        }
        return "D01";
    }

    generateDoHeader(shipment: CsTransaction, isAir: boolean) {
        if (isAir) {
            return shipment.warehousePOD ? shipment.warehousePOD.nameVn : null;
        }
        return shipment.podName;
    }
}


interface IDefaultHeaderFooter {
    type: CommonEnum.TransactionTypeEnum;
    userDefault: string;
    doheader1: string;
    doheader2: string;
    dofooter: string;
    subAbbr: string;
}

