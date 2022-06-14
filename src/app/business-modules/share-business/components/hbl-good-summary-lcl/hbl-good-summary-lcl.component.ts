import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Params, ActivatedRoute } from '@angular/router';

import { ShareBussinessShipmentGoodSummaryComponent } from '../shipment-good-summary/shipment-good-summary.component';
import { Container } from 'src/app/shared/models/document/container.model';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { ShareBussinessGoodsListPopupComponent } from '../goods-list/goods-list.popup';
import { Unit, HouseBill } from 'src/app/shared/models';

import _groupBy from 'lodash/groupBy';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, skip, takeUntil } from 'rxjs/operators';

import * as fromStore from '../../store';
import { SortService } from '@services';


@Component({
    selector: 'hbl-goods-summary-lcl',
    templateUrl: './hbl-good-summary-lcl.component.html'
})

export class ShareBussinessHBLGoodSummaryLCLComponent extends ShareBussinessShipmentGoodSummaryComponent implements OnInit {

    @ViewChild(ShareBussinessGoodsListPopupComponent) goodsImportPopup: ShareBussinessGoodsListPopupComponent;
    @Output() onSelectQty: EventEmitter<any> = new EventEmitter<any>();
    @Input() type: string = 'import';

    packageQty: number = null;



    containerDescription: string = '';

    packages: Unit[] = [];
    selectedPackage: any;
    selectedPackageName: string = '';
    isExport: boolean = false;

    constructor(
        protected _actionStoreSubject: ActionsSubject,
        protected _store: Store<fromStore.IContainerState>,
        private _catalogueRepo: CatalogueRepo,
        protected _activedRoute: ActivatedRoute,
        private sortService: SortService

    ) {
        super(_actionStoreSubject, _store, _activedRoute);

        this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE })
            .pipe(catchError(this.catchError))
            .subscribe(
                (units: Unit[]) => { this.packages = units || []; }
            );
    }

    ngOnInit(): void {
        this._activedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            (p: Params) => {
                if (p['hblId'] !== null) {
                    this.hblid = p['hblId'];
                    this.mblid = null;
                } else {
                    this.mblid = p['jobId'];
                    this.hblid = null;
                }
            }
        );
        this.isLocked = this._store.select(fromStore.getTransactionLocked);

        this._store.select(fromStore.getDetailHBlState)
            .pipe(skip(1))
            .subscribe(
                (res: HouseBill) => {
                    if (!!res) {
                        this.totalCBM = res.cbm;
                        this.netWeight = res.netWeight;
                        this.totalChargeWeight = res.chargeWeight;
                        this.grossWeight = res.grossWeight;
                        this.containerDetail = res.packageContainer;
                        this.commodities = res.commodity;
                        this.description = res.desOfGoods;
                        this.selectedPackage = !!this.packages.length ? [this.packages.find(p => p.id === res.packageType)] : null;
                        this.packageQty = res.packageQty;
                        this.selectedPackage = res.packageType;
                        this.containerDescription = res.contSealNo;
                    }
                }
            );
    }

    openContainerListPopup() {
        if (!!this.hblid && !this.isSave) {
            this._store.dispatch(new fromStore.GetContainerAction({ hblId: this.hblid }));
        } else {

            if (!!this.mblid && !this.isSave) {
                this._store.dispatch(new fromStore.GetContainerAction({ mblid: this.mblid }));
            }

        }

        this.goodsImportPopup.show();

    }

    onChangeContainer(containers: Container[]) {
        this.isSave = true;
        this.containers = containers;
        this.updateData(containers);
    }

    onChangePackge() {
        if ((this.containers == null || this.containers.length === 0) && !!this.packageQty && !!this.selectedPackage) {
            const packageObj = this.packages.find(x => x.id == this.selectedPackage);
            this.onSelectQty.emit({ 'package': packageObj.code, 'quantity': this.packageQty });
        } else if ((this.containers == null || this.containers.length === 0) && this.packageQty == null && !!this.selectedPackage) {
            this.onSelectQty.emit({ 'package': null, 'quantity': null });
        }
    }

    updateData(containers: Container[] | any) {
        // * Description, Commondity.
        if (!this.description) {
            this.description = (containers || []).filter((c: Container) => Boolean(c.description)).reduce((acc: string, curr: Container) => acc += curr.description + "\n", '');
        }

        const comoditiesName: string[] = containers.map((c: Container) => c.commodityName);

        if (!this.commodities) {
            this.commodities = comoditiesName
                .filter((item: string, index: number) => Boolean(item) && comoditiesName.indexOf(item) === index)
                .reduce((acc: string, curr: any) => acc += curr + "\n", '');
        }

        // * GW, Nw, CW, CBM
        if (!!containers.length) {
            this.grossWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.gw, 0);
            this.totalCBM = (containers || []).reduce((acc: string, curr: Container) => acc += curr.cbm, 0);
            this.packageQty = (containers || []).reduce((acc: string, curr: Container) => acc += curr.packageQuantity, 0);

            this.grossWeight = +this.grossWeight.toFixed(3);
            this.totalCBM = +this.totalCBM.toFixed(3);
        }

        if (!!containers.length && !this.selectedPackage || containers.length === 1 && !this.selectedPackage) {
            if (!!containers[0].packageTypeId) {
                const data: any = this.packages.find((unit: Unit) => unit.id === containers[0].packageTypeId);
                if (!!data) {
                    this.selectedPackage = data.id;
                }
            }
        }
        // * Container
        this.containerDetail = '';
        this.containerDescription = '';
        if (!!containers) {
            if (this.type === 'export') {
                const containerLst = this.sortService.sort(containers.map((item: any) => new Container(item)), 'containerNo', true);
                containerLst.forEach((c: Container) => {
                    this.containerDescription += this.handleStringContSeal(c.containerNo || '', c.containerTypeName || '', c.sealNo || '');
                });
            } else {
                containers.forEach((c: Container) => {
                    this.containerDescription += this.handleStringContSeal(c.containerNo, c.containerTypeName, c.sealNo);
                });
            }
        }

        const contObject: any[] = (containers || []).map((container: Container | any) => ({
            cont: container.description || '',
            quantity: container.quantity
        }));

        const contData = [];
        for (const item of Object.keys(_groupBy(contObject, 'cont'))) {
            contData.push({
                cont: item,
                quantity: _groupBy(contObject, 'cont')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b)
            });
        }

        // for (const item of contData) {
        //     this.containerDetail += this.handleStringCont(item);
        // }
        this.containerDetail = 'A PART OF CONTAINER S.T.C';

    }

    initContainer() {
        this._store.dispatch(new fromStore.InitContainerAction([]));
    }

    handleStringCont(contOb: { cont: string, quantity: number }) {
        return `${contOb.quantity}x${!!contOb.cont ? contOb.cont : ''}, `;
    }

    handleStringContSeal(contNo: string = '', contType: string = '', sealNo: string = '') {
        return `${!!contNo ? contNo : '_'}/${!!contType ? contType : '_'}/${!!sealNo ? sealNo : '_'} \n`;
    }
}
