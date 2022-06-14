import { Component, ChangeDetectorRef, ViewChild, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { PopupBase } from 'src/app/popup.base';
import { Container } from 'src/app/shared/models/document/container.model';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { Unit } from 'src/app/shared/models';
import { Commodity } from 'src/app/shared/models/catalogue/commodity.model';
import { SortService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { ShareContainerImportComponent } from '../container-import/container-import.component';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';

import { catchError, takeUntil } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import * as fromStore from '../../store';

import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'container-list-popup',
    templateUrl: './container-list.popup.html',
    styleUrls: ['./container-list.popup.scss']
})
export class ShareBussinessContainerListPopupComponent extends PopupBase implements OnInit {

    @ViewChild(ShareContainerImportComponent) containerImportPopup: ShareContainerImportComponent;
    @ViewChild('confirmDeleteContainerPopup') confirmDeleteContainerPopup: ConfirmPopupComponent;

    @Input() type: string = 'import';

    mblid: string = null;
    hblid: string = null;

    containers: Container[] = [];
    initContainers: Container[] = [];

    headers: CommonInterface.IHeaderTable[] = [];

    containerUnits: Unit[] = new Array<Unit>();
    packageUnits: Unit[] = new Array<Unit>();
    weightUnits: Unit[] = new Array<Unit>();
    commodities: any[] = new Array<any>();

    isSubmitted: boolean = false;
    isAdd: boolean = false;
    isDuplicateContPakage: boolean = false;

    selectedIndexContainer: number = -1;

    defaultWeightUnit: Unit = null;

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _store: Store<fromStore.IContainerState>,
        protected cdRef: ChangeDetectorRef,
        protected _sortService: SortService,
        protected _toastService: ToastrService,
    ) {
        super();

        this.requestSort = this.sortContainer;
    }

    ngOnInit(): void {
        this.configHeader();
        this.cdRef.detectChanges(); // * tell ChangeDetect update view in app-table-header (field required).
        this.getMasterData();

        // * GET DATA FROM STORE.
        this._store.select(fromStore.getContainerSaveState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: fromStore.IContainerState | any) => {
                    this.containers = res;
                    this.initContainers = cloneDeep(res);
                }
            );

    }

    configHeader() {
        this.headers = [
            { title: 'Cont Type', field: 'containerTypeId', sortable: true, required: true, width: 200 },
            { title: 'Cont Q`Ty', field: 'quantity', required: true, sortable: true },
            { title: 'Container No', field: 'containerNo', sortable: true, },
            { title: 'Seal No', field: 'sealNo', sortable: true, },
            { title: 'Package Quantity', field: 'packageQuantity', sortable: true, },
            { title: 'Package Type', field: 'packageTypeId', sortable: true, },
            { title: 'G.W', field: 'gw', sortable: true, },
            { title: 'C.W', field: 'chargeAbleWeight', sortable: true, },
            { title: 'CBM', field: 'cbm', sortable: true, },
            { title: 'Unit', field: 'unitOfMeasureId', sortable: true, },
            { title: 'Mark No', field: 'markNo', sortable: true, },
            { title: 'Commodity', field: 'commodityId', sortable: true, width: 200 },
            { title: 'Description', field: 'description', sortable: true, },
            { title: 'N.W', field: 'nw', sortable: true, },

        ];
    }

    addNewContainer() {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;
        this.initContainers = [...this.initContainers, new Container({ nw: null, cbm: null, chargeAbleWeight: null, gw: null, unitOfMeasureId: !!this.defaultWeightUnit ? this.defaultWeightUnit.id : null, unitOfMeasureName: !!this.defaultWeightUnit ? this.defaultWeightUnit.unitNameEn : null })];
        // this._store.dispatch(new fromStore.AddContainerAction(new Container({ nw: null, cbm: null, chargeAbleWeight: null, gw: null, unitOfMeasureId: 119, unitOfMeasureName: 'Kilogram' }))); // * DISPATCH Add ACTION 
    }

    duplicate(index: number) {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;

        const duplicatedContainer = cloneDeep(this.initContainers[index]);
        // * RESET ID.
        duplicatedContainer.id = SystemConstants.EMPTY_GUID;
        this.initContainers = [...this.initContainers, { ...duplicatedContainer, key: Math.random() }];

    }

    deleteContainerItem(index: number, container: Container) {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;

        this.selectedIndexContainer = index;

        if (container.id === SystemConstants.EMPTY_GUID) {
            // this._store.dispatch(new fromStore.DeleteContainerAction(index)); // * DISPATCH DELETE ACTION
            this.initContainers = [...this.initContainers.slice(0, this.selectedIndexContainer), ...this.initContainers.slice(this.selectedIndexContainer + 1)];

        } else {
            this.confirmDeleteContainerPopup.show();
        }
    }

    onDeleteContainer() {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;

        this.confirmDeleteContainerPopup.hide();
        if (this.selectedIndexContainer > -1) {
            this.initContainers = [...this.initContainers.slice(0, this.selectedIndexContainer), ...this.initContainers.slice(this.selectedIndexContainer + 1)];
            // this._store.dispatch(new fromStore.DeleteContainerAction(this.selectedIndexContainer)); // * DISPATCH DELETE ACTION
        }
    }

    getMasterData() {
        forkJoin([
            this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.CONTAINER }),
            this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE }),
            this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.WEIGHT }),
            this._catalogueRepo.getCommondity({ active: true }),
        ])
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any[] = [[], [], [], []]) => {
                    this.containerUnits = res[0];
                    this.packageUnits = res[1];
                    this.weightUnits = res[2];

                    const kgs: Unit = this.weightUnits.find(w => w.code === 'kgs' || w.code === 'KGS');
                    if (!!kgs) {
                        this.defaultWeightUnit = kgs;
                    }
                    this.commodities = res[3];
                }
            );
    }

    onSaveContainerList() {
        this.isSubmitted = true;
        if (this.checkValidateContainer()) {
            // * DISPATCH SAVE ACTION
            if (this.checkDuplicate()) {

                this.containers = cloneDeep(this.initContainers);

                for (const container of this.containers) {
                    container.commodityName = this.getCommodityName(container.commodityId);
                    container.containerTypeName = this.getContainerTypeName(container.containerTypeId);
                    container.packageTypeName = this.getPackageTypeName(container.packageTypeId);
                    if (!!container.containerNo || !!container.markNo || !!container.sealNo) {
                        container.quantity = 1;
                    }
                }
                this._store.dispatch(new fromStore.SaveContainerAction(this.containers));

                this.isSubmitted = false;
                this.hide();
            }
        } else {
            this.checkDuplicate();
        }
    }

    checkValidateContainer() {
        let valid: boolean = true;
        for (const container of this.initContainers) {
            if (
                !container.containerTypeId
                || !container.quantity
                || container.chargeAbleWeight < 0
                || container.gw < 0
                || container.cbm < 0
                || container.nw < 0
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    checkDuplicate() {
        let valid: boolean = true;

        //
        this.utility.checkDuplicateInObjectByKeys(this.initContainers, ['containerNo', 'sealNo'], 2);

        if (
            this.initContainers.filter(e => e.duplicate === true).length >= 1
        ) {
            this.isDuplicateContPakage = true;
            valid = false;
            this._toastService.warning("Container no, Seal no is Duplicated");
            return;
        } else {
            valid = true;
            this.isDuplicateContPakage = false;
        }


        return valid;
    }

    getCommodityName(id: string | number) {
        const commodities: Commodity[] = this.commodities.filter(c => c.id === id);
        if (!!commodities.length) {
            return commodities[0].commodityNameEn;
        } else {
            return null;
        }
    }

    getContainerTypeName(containerId: string | number) {
        const containers: Unit[] = this.containerUnits.filter(c => c.id === containerId);
        if (!!containers.length) {
            return containers[0].unitNameEn;
        } else {
            return null;
        }
    }

    getPackageTypeName(packageId: string | number) {
        const packages: Unit[] = this.packageUnits.filter(c => c.id === packageId);
        if (!!packages.length) {
            return packages[0].unitNameEn;
        } else {
            return null;
        }
    }

    getDescriptionName(containerId: string | number) {
        const containers: Unit[] = this.containerUnits.filter(c => c.id === containerId);
        if (!!containers.length) {
            return containers[0].descriptionEn;
        } else {
            return null;
        }
    }

    closePopup() {
        this.isSubmitted = false;
        this.initContainers = cloneDeep(this.containers);
        this.hide();
    }

    showImportPopup() {
        this.containerImportPopup.mblid = this.mblid;
        this.containerImportPopup.hblid = this.hblid;
        this.containerImportPopup.data = [];
        this.containerImportPopup.getData();
        this.containerImportPopup.show();
    }

    sortContainer(sortField: string) {
        this.initContainers = this._sortService.sort(this.initContainers, sortField, this.order);
    }

    onChangeDataFormTable() {
        this.isDuplicateContPakage = false;
    }

}
