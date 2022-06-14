import { Component, ViewChild, Input } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';

import { AppForm } from 'src/app/app.form';
import { Container } from 'src/app/shared/models/document/container.model';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ShareBussinessContainerListPopupComponent } from '../container-list/container-list.popup';

import _uniqBy from 'lodash/uniqBy';
import _groupBy from 'lodash/groupBy';
import { takeUntil, skip } from 'rxjs/operators';

import * as fromStore from './../../store';
import { GetContainerAction } from './../../store';
import { CsTransaction } from '@models';

@Component({
    selector: 'shipment-good-summary',
    templateUrl: './shipment-good-summary.component.html',
})
export class ShareBussinessShipmentGoodSummaryComponent extends AppForm {

    @ViewChild(ShareBussinessContainerListPopupComponent) containerPopup: ShareBussinessContainerListPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmRefresh: ConfirmPopupComponent;
    @Input() type: string = 'import';

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

    shipment: CsTransaction = new CsTransaction();

    constructor(
        protected _actionStoreSubject: ActionsSubject,
        protected _store: Store<fromStore.IContainerState>,
        protected _activedRoute: ActivatedRoute

    ) {
        super();
    }
    ngOnInit(): void {
        this._activedRoute.params
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                (p: Params) => {
                    this.hblid = p['hblId'];
                    this.mblid = p['jobId'];
                }
            );

        this._actionStoreSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (action: fromStore.ContainerAction) => {
                    if (action.type === fromStore.ContainerActionTypes.SAVE_CONTAINER) {
                        this.isSave = true;
                        this.containers = action.payload;
                        this.updateData(action.payload);
                    }
                }
            );

        this._store.select(fromStore.getTransactionDetailCsTransactionState)
            .pipe(skip(1), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: CsTransaction) => {
                    console.log(res);
                    if (!!res) {
                        this.shipment = new CsTransaction(res);
                        this.containerDetail = res.packageContainer;
                        this.commodities = res.commodity;
                        this.description = res.desOfGoods;
                        this.grossWeight = res.grossWeight;
                        this.netWeight = res.netWeight;
                        this.totalChargeWeight = res.chargeWeight;
                        this.totalCBM = res.cbm;
                    }
                }
            );

        this.isLocked = this._store.select(fromStore.getTransactionLocked);
    }

    handleStringCont(contOb: { cont: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.cont + ', ';
    }

    handleStringPackage(contOb: { package: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.package + ', ';
    }

    initContainer() {
        this._store.dispatch(new fromStore.InitContainerAction([]));
    }

    openContainerListPopup() {
        this.containerPopup.mblid = this.mblid;
        this.containerPopup.hblid = this.hblid;

        if ((!!this.mblid && !!this.hblid) && !this.isSave) {
            this._store.dispatch(new GetContainerAction({ mblid: this.mblid }));
        }

        if ((!!this.hblid && !!this.mblid) && !this.isSave) {
            this._store.dispatch(new GetContainerAction({ hblId: this.hblid }));
        }

        this.containerPopup.show();
    }

    refresh() {
        this.confirmRefresh.show();
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

        this.grossWeight = +this.grossWeight.toFixed(3);
        this.netWeight = +this.netWeight.toFixed(3);
        this.totalChargeWeight = +this.totalChargeWeight.toFixed(3);
        this.totalCBM = +this.totalCBM.toFixed(3);

        // * Container, Package.
        this.containerDetail = '';

        const contObject: any[] = (containers || []).map((container: Container | any) => ({
            cont: container.containerTypeName,
            quantity: container.quantity
        }));

        const contData = [];
        for (const item of Object.keys(_groupBy(contObject, 'cont'))) {
            contData.push({
                cont: item,
                quantity: _groupBy(contObject, 'cont')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b)
            });
        }

        for (const item of contData) {
            this.containerDetail += this.handleStringCont(item);
        }
        this.containerDetail = this.containerDetail.trim().replace(/\,$/, "");
    }

    onRefresh() {
        this.confirmRefresh.hide();

        this.description = '';
        this.commodities = '';
        this.updateData(this.containers);
    }

}
