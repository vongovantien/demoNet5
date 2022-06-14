import { Component, OnInit, ChangeDetectorRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { ShareBussinessContainerListPopupComponent } from '../container-list/container-list.popup';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { DataService, SortService } from 'src/app/shared/services';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';

import * as fromStore from '../../store';
import { ShareGoodsImportComponent } from '../goods-import/goods-import.component';
import { Container } from '@models';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'goods-list-popup',
    templateUrl: './goods-list.popup.html',
    styleUrls: ['./../container-list/container-list.popup.scss']
})

export class ShareBussinessGoodsListPopupComponent extends ShareBussinessContainerListPopupComponent implements OnInit {

    @ViewChild(ShareGoodsImportComponent) goodsImportPopup: ShareGoodsImportComponent;
    @ViewChild('confirmCancel') confirmCancelPopup: ConfirmPopupComponent;
    @Output() onChange: EventEmitter<Container[]> = new EventEmitter<Container[]>();

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _store: Store<fromStore.IContainerState>,
        protected cdRef: ChangeDetectorRef,
        protected _dataService: DataService,
        protected _sortService: SortService,
        protected _toastService: ToastrService
    ) {
        super(_catalogueRepo, _store, cdRef, _sortService, _toastService);
        this.requestSort = this.sortHBLGoods;
    }

    configHeader() {
        this.headers = [
            //1
            { title: 'Cont Type', field: 'containerTypeId', sortable: true },
            //2
            { title: 'Cont Quantity', field: 'quantity', sortable: true },
            //7
            { title: 'Container No', field: 'containerNo', sortable: true, },
            //8
            { title: 'Seal No', field: 'sealNo', sortable: true, },
            //6
            { title: 'Package Quantity', field: 'packageQuantity', sortable: true, required: true, width: 175 },
            //5
            { title: 'Package Type', field: 'packageTypeId', sortable: true, required: true },
            //3
            { title: 'G.W', field: 'gw', sortable: true, required: true },
            //4
            { title: 'CBM', field: 'cbm', sortable: true, required: true },
            //9
            { title: 'Mark No', field: 'markNo', sortable: true, },
            //10
            { title: 'Commodity', field: 'commodityId', sortable: true, width: 175 },
            //11
            { title: 'Description', field: 'description', sortable: true, },
        ];
    }

    //  * Override check validate.
    checkValidateContainer() {
        let valid: boolean = true;
        for (const container of this.initContainers) {
            if (
                (!!container.containerNo || !!container.sealNo || !!container.markNo) && !container.quantity
                || !container.packageTypeId
                || !container.gw
                || !container.cbm
                || !container.packageQuantity

            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    onSubmitCancel() {
        this.isSubmitted = false;
        this.initContainers = cloneDeep(this.containers);
        this.confirmCancelPopup.hide();
        this.hide();
    }

    onCancel() {
        this.isSubmitted = false;

        this.confirmCancelPopup.hide();
        // this.closePopup();
    }

    showImportPopup() {
        this.goodsImportPopup.mblid = this.mblid;
        this.goodsImportPopup.hblid = this.hblid;
        this.goodsImportPopup.data = [];
        this.goodsImportPopup.getData();
        this.goodsImportPopup.show();
    }

    sortHBLGoods() {
        this.initContainers = this._sortService.sort(this.initContainers, this.sortField, this.order)
    }



    onSaveContainerList() {
        this.isSubmitted = true;
        if (this.checkValidateContainer()) {
            // * DISPATCH SAVE ACTION
            if (this.checkDuplicate()) {

                this.containers = cloneDeep(this.initContainers);
                console.log(this.containers);
                for (const container of this.containers) {
                    container.commodityName = this.getCommodityName(container.commodityId);
                    container.containerTypeName = this.getContainerTypeName(container.containerTypeId);
                    container.packageTypeName = this.getPackageTypeName(container.packageTypeId);
                    container.description = this.getDescriptionName(container.containerTypeId);
                    if (!!container.containerNo || !!container.markNo || !!container.sealNo) {
                        container.quantity = 1;
                    }
                }
                this._store.dispatch(new fromStore.SaveContainerAction(this.containers));
                this.onChange.emit(this.containers);

                this.isSubmitted = false;
                this.hide();
            }
        } else {
            this.checkDuplicate();
        }
    }

}
