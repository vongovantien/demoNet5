import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { formatDate } from '@angular/common';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params } from '@angular/router';

import { AppList } from '@app';
import { ArrivalFreightCharge, User, CsTransaction, HBLArrivalNote } from '@models';
import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { SystemConstants, ChargeConstants } from '@system-constants';
import { CommonEnum } from '@enums';

import { catchError, finalize, takeUntil, switchMap, map, concatMap } from 'rxjs/operators';

import * as fromShareBussiness from './../../../store';
import { getSellingSurChargeState, getTransactionDetailCsTransactionState } from './../../../store';
import { of } from 'rxjs';


@Component({
    selector: 'hbl-arrival-note-sea',
    templateUrl: './arrival-note.component.html',
    styleUrls: ['./arrival-note.component.scss'],
})

export class ShareBusinessArrivalNoteComponent extends AppList {
    @Input() set type(t: string) {
        this._transationType = t;
    }

    get type() {
        return this._transationType;
    }

    private _transationType: string = ChargeConstants.SFI_CODE;

    headers: CommonInterface.IHeaderTable[] = [
        { title: 'Charge', field: 'chargeId', sortable: true, width: 250 },
        { title: 'Quantity', field: 'quantity', sortable: true, width: 150 },
        { title: 'Unit', field: 'unitId', sortable: true },
        { title: 'Unit Price', field: 'unitPrice', sortable: true },
        { title: 'Currency', field: 'currencyId', sortable: true },
        { title: 'VAT', field: 'vatrate', sortable: true },
        { title: 'Total Amount', field: 'total', sortable: true },
        { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
        { title: 'Note', field: 'notes', sortable: true },
        { title: 'Show', field: 'isShow', sortable: true },
        { title: 'Full', field: 'isFull', sortable: true },
        { title: 'Tick', field: 'isTick', sortable: true },
    ];

    hblArrivalNote: HBLArrivalNote = new HBLArrivalNote();

    userLogged: User = new User();

    selectedIndexFreightCharge: number = -1;

    isSubmitted: boolean = false;
    hblid: string;

    constructor(
        private _store: Store<any>,
        private _documentRepo: DocumentationRepo,
        private _sortService: SortService,
        private _ngProgress: NgProgress,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute
    ) {
        super();

        this._progressRef = this._ngProgress.ref();

        this.requestSort = this.sortFreightCharge;

        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

    }

    ngOnInit() {
        this.subscription = this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    console.log(p);
                    if (p.hblId) {
                        this.hblid = p.hblId;
                    } else {
                        this.hblid = SystemConstants.EMPTY_GUID;
                    }
                    return of(this.hblid);
                }),
                // * Get data delivery order
                switchMap((p) => {
                    return this._documentRepo.getArrivalInfo(this.hblid, this.utility.getTransationType(this._transationType));
                }),
                concatMap((data: HBLArrivalNote) => {
                    // * Update HBL ArrivalNote model from dataDefault.
                    this.hblArrivalNote.arrivalHeader = data.arrivalHeader;
                    this.hblArrivalNote.arrivalFooter = data.arrivalFooter;
                    this.hblArrivalNote.csArrivalFrieghtCharges = data.csArrivalFrieghtCharges || [];

                    if (!data.arrivalNo) {
                        return this._store.select(getTransactionDetailCsTransactionState).pipe(takeUntil(this.ngUnsubscribe));
                    } else {
                        this.hblArrivalNote.arrivalNo = data.arrivalNo;
                        this.hblArrivalNote.arrivalFirstNotice = !!data.arrivalFirstNotice ? {
                            startDate: new Date(data.arrivalFirstNotice),
                            endDate: new Date(data.arrivalFirstNotice),
                        } : null;
                        this.hblArrivalNote.arrivalSecondNotice = !!data.arrivalSecondNotice ? {
                            startDate: new Date(data.arrivalSecondNotice),
                            endDate: new Date(data.arrivalSecondNotice),
                        } : null;

                        return of(this.hblArrivalNote);
                    }
                }),
                map((res: CsTransaction | HBLArrivalNote | any) => {
                    // If res are DeliveryOrder object
                    if (res.hasOwnProperty("arrivalHeader")) {
                        return res;
                    }

                    // * Update field from shipment
                    this.hblArrivalNote.arrivalNo = res.jobNo + "-" + "A01";
                    this.hblArrivalNote.arrivalFirstNotice = {
                        startDate: new Date(),
                        endDate: new Date()
                    };
                    if (!this.hblArrivalNote.arrivalHeader) {
                        this.hblArrivalNote.arrivalHeader = `
                    <p><strong>The following documents are requested against the Delivery Order (Thủ tục y&ecirc;u cầu khi nhận D/O)</strong><br>☑☐&nbsp; &nbsp;Giấy giới thiệu<br>Pls pick-up DO after vessel&#39;s arrival 1 day. Thks! ( Vui l&ograve;ng nhận DO sau ng&agrave;y t&agrave;u
                    cập 1 ng&agrave;y)<br><u><strong>PLS PICK-UP DO AT (Li&ecirc;n hệ nhận D/O:)</strong></u><br><strong><em>C&ocirc;ng ty cổ phần giao nhận v&agrave; vận chuyển In Do Trần<br>52 - 54 - 56 Trường Sơn,
                    Phường 2, Quận T&acirc;n B&igrave;nh, TP. HCM, Việt Nam</em></strong><br><u><strong>Giờ l&agrave;m việc:<br></strong></u><strong>S&aacute;ng: 8.00 - 12.00/Chiều: 13.30 -
                    17.30</strong></p><p><br></p>
                    `;
                    }

                    return new HBLArrivalNote(this.hblArrivalNote);
                })
            )
            .subscribe((res) => { console.log("subscribe", res); });

        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);

        // * Get selling charge for sync.
        this._store.dispatch(new fromShareBussiness.GetSellingSurchargeAction({ type: 'SELL', hblId: this.hblid }));
    }

    sortFreightCharge() {
        this.hblArrivalNote.csArrivalFrieghtCharges = this._sortService.sort(this.hblArrivalNote.csArrivalFrieghtCharges, this.sort, this.order);
    }

    saveArrivalNote() {
        this._progressRef.start();

        const dateNotice = {
            arrivalFirstNotice: !!this.hblArrivalNote.arrivalFirstNotice && !!this.hblArrivalNote.arrivalFirstNotice.startDate ? formatDate(this.hblArrivalNote.arrivalFirstNotice.startDate, 'yyyy-MM-dd', 'en') : null,
            arrivalSecondNotice: !!this.hblArrivalNote.arrivalSecondNotice && <any>!!this.hblArrivalNote.arrivalSecondNotice.startDate ? formatDate(this.hblArrivalNote.arrivalSecondNotice.startDate, 'yyyy-MM-dd', 'en') : null,
        };
        this.hblArrivalNote.hblid = this.hblid;
        this._documentRepo.updateArrivalInfo(Object.assign({}, this.hblArrivalNote, dateNotice))
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * Dispatch for detail HBL to update HBL state.
                        this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblArrivalNote.hblid));
                    }
                }
            );
    }

    setDefaultHeadeFooter() {
        const body: IArrivalDefault = {
            transactionType: this.utility.getTransationType(this._transationType),
            userDefault: this.userLogged.id,
            arrivalFooter: this.hblArrivalNote.arrivalFooter,
            arrivalHeader: this.hblArrivalNote.arrivalHeader,
            type: this.utility.getTransationType(this._transationType),
        };

        this._progressRef.start();

        this._documentRepo.setArrivalHeaderFooterDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
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

    setDefaultFreightCharge() {
        const body: IArrivalFreightChargeDefault = {
            userDefault: this.userLogged.id,
            transactionType: CommonEnum.TransactionTypeEnum.SeaFCLImport,
            csArrivalFrieghtChargeDefaults: this.hblArrivalNote.csArrivalFrieghtCharges,
            type: this.utility.getTransationType(this._transationType),

        };

        this._progressRef.start();

        this._documentRepo.setArrivalFreightChargeDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
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

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.hblArrivalNote.csArrivalFrieghtCharges) {
            if (
                !charge.chargeId
                || charge.unitPrice < 0
                || charge.vatrate > 100
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    syncSellingCharge() {
        this._store.select(getSellingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (sellingCharges: any[]) => {
                    if (!!sellingCharges && !!sellingCharges.length) {
                        sellingCharges.forEach(c => {
                            c.chargeName = c.chargeNameEn;
                            c.unitName = c.unit;
                        });

                        this.hblArrivalNote.csArrivalFrieghtCharges.length = 0;
                        this.hblArrivalNote.csArrivalFrieghtCharges = [...sellingCharges];

                        // * Update show,full,tick.
                        this.hblArrivalNote.csArrivalFrieghtCharges.forEach(c => {
                            c.isShow = true;
                            c.isFull = true;
                            c.isTick = true;
                        });
                    } else {
                        this._toastService.warning("Not found selling charge!");
                    }
                }
            )
    }
}


export interface IArrivalDefault {
    userDefault: string;
    arrivalHeader: string;
    arrivalFooter: string;
    transactionType: number;
    type: any;
}

export interface IArrivalFreightChargeDefault {
    transactionType: number;
    userDefault: string;
    csArrivalFrieghtChargeDefaults: ArrivalFreightCharge[];
    type: any;
    hblId?: string;
}
