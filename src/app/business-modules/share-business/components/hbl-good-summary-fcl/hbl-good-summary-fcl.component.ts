import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Params, ActivatedRoute } from '@angular/router';

import { Container } from 'src/app/shared/models/document/container.model';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { Unit } from 'src/app/shared/models';

import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, takeUntil } from 'rxjs/operators';
import _groupBy from 'lodash/groupBy';

import * as fromStore from '../../store';

import { AppPage } from 'src/app/app.base';
import { ConfirmPopupComponent } from '@common';
import { ShareBussinessHBLFCLContainerPopupComponent } from '../hbl-fcl-container/hbl-fcl-container.popup';
import { SortService } from '@services';


@Component({
    selector: 'hbl-goods-summary-fcl',
    templateUrl: './hbl-good-summary-fcl.component.html'
})

export class ShareBussinessHBLGoodSummaryFCLComponent extends AppPage implements OnInit {

    @ViewChild(ShareBussinessHBLFCLContainerPopupComponent) containerPopup: ShareBussinessHBLFCLContainerPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmRefresh: ConfirmPopupComponent;
    @Input() type: string = 'import';

    packageQty: number = null;
    containerDescription: string = '';

    packages: Unit[];
    selectedPackage: number;

    mblid: string = null;
    hblid: string = null;
    description: string = 'AS PER BILL OF LADING';
    commodities: string = null;
    containerDetail: string = '';

    grossWeight: number = null;
    netWeight: number = null;
    totalChargeWeight: number = null;
    totalCBM: number = null;

    containers: Container[] = [];

    isSave: boolean = false;

    jobId: string;
    isExport: boolean = false;

    constructor(
        protected _actionStoreSubject: ActionsSubject,
        protected _store: Store<fromStore.IContainerState>,
        private _catalogueRepo: CatalogueRepo,
        private _activedRoute: ActivatedRoute,
        private sortService: SortService
    ) {
        super();

        this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE })
            .pipe(catchError(this.catchError))
            .subscribe(
                (units: Unit[]) => { this.packages = units || []; }
            );
    }

    ngOnInit() {
        this._activedRoute.params.subscribe(
            (p: Params) => {
                if (p.jobId) {
                    this.mblid = p['jobId'];
                }
                if (p.hblId) {
                    this.hblid = p['hblId'];
                }
            }
        );

        this.isLocked = this._store.select(fromStore.getTransactionLocked);

        if (!!this.hblid) {
            this._store.select(fromStore.getDetailHBlState)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (res: any) => {
                        if (!!res.id) {
                            this.totalCBM = res.cbm;
                            this.netWeight = res.netWeight;
                            this.totalChargeWeight = res.chargeWeight;
                            this.grossWeight = res.grossWeight;
                            this.containerDetail = res.packageContainer;
                            this.commodities = res.commodity;
                            this.description = res.desOfGoods;
                            this.selectedPackage = res.packageType;
                            this.packageQty = res.packageQty;
                            this.containerDescription = res.contSealNo;
                        }
                    }
                );
        }
    }

    mapObjectData(containers: Container[]) {
        const contObject = (containers || []).map((container: Container) => ({
            cont: container.containerTypeName || '',
            quantity: container.quantity,
        }));
        return contObject;
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
        this.grossWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.gw, 0);
        this.netWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.nw, 0);
        this.totalChargeWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.chargeAbleWeight, 0);
        this.totalCBM = (containers || []).reduce((acc: string, curr: Container) => acc += curr.cbm, 0);
        this.packageQty = (containers || []).reduce((acc: string, curr: Container) => acc += curr.packageQuantity, 0);

        this.grossWeight = +this.grossWeight.toFixed(3);
        this.netWeight = +this.netWeight.toFixed(3);
        this.totalChargeWeight = +this.totalChargeWeight.toFixed(3);
        this.totalCBM = +this.totalCBM.toFixed(3);
        this.packageQty = +this.packageQty.toFixed(3);

        if (!!containers.length && !this.selectedPackage || containers.length === 1) {
            if (!!containers[0].packageTypeId) {
                this.selectedPackage = this.packages.find((unit: Unit) => unit.id === containers[0].packageTypeId).id;
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
            }else{
                containers.forEach((c: Container) => {
                    this.containerDescription += this.handleStringContSeal(c.containerNo, c.containerTypeName, c.sealNo);
                });
            }
        }

        const objApartOf = containers.filter(x => x.isPartOfContainer === true);
        const contObject1 = this.mapObjectData(objApartOf);
        const objNotApartOf = containers.filter(x => x.isPartOfContainer === false);
        const contObject2 = this.mapObjectData(objNotApartOf);
        const contDataNotAprtOf = [];
        for (const item of Object.keys(_groupBy(contObject2, 'cont'))) {
            contDataNotAprtOf.push({
                cont: item,
                quantity: _groupBy(contObject2, 'cont')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b),
            });
        }

        for (const item of contDataNotAprtOf) {
            this.containerDetail += this.handleStringCont(item);
        }

        for (const item of contObject1) {
            this.containerDetail += "A Part Of ";
            this.containerDetail += this.handleStringCont(item);
        }

        this.containerDetail = this.containerDetail.trim().replace(/\,$/, "");
    }

    initContainer() {
        this._store.dispatch(new fromStore.InitContainerAction([]));
    }

    handleStringCont(contOb: { cont: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.cont + ', ';
    }

    handleStringPackage(contOb: { package: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.package + ', ';
    }

    openContainerListPopup() {
        this.containerPopup.mblid = this.mblid;
        this.containerPopup.hblid = this.hblid;

        this.containerPopup.show();
    }

    refresh() {
        this.confirmRefresh.show();
    }

    handleStringContSeal(contNo: string = '', contType: string = '', sealNo: string = '') {
        return `${!!contNo ? contNo + '/' : ''}${!!contType ? contType : ''}${!!sealNo ? '/' : ''}${!!sealNo ? sealNo : ''}\n`;
    }

    onRefresh() {
        this.confirmRefresh.hide();

        this.description = '';
        this.commodities = '';
        this.updateData(this.containers);
    }

    onChangeContainer(container: Container[]) {
        this.isSave = true;
        this.containers = container;
        this.updateData(container);
    }
}
