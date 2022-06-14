import { Component, ChangeDetectorRef, ViewChild, Input, forwardRef, EventEmitter, Output } from '@angular/core';
import { CatalogueRepo, DocumentationRepo } from '@repositories';
import { Store } from '@ngrx/store';
import { SortService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { ConfirmPopupComponent } from '@common';
import { Unit, Commodity, Container } from '@models';
import { CommonEnum } from '@enums';
import { NgxSpinnerService } from 'ngx-spinner';

import { DeleteContainerAction, SaveContainerAction, getHBLContainersState, IContainerState } from '../../store';
import { PopupBase } from 'src/app/popup.base';
import { SystemConstants } from 'src/constants/system.const';

import cloneDeep from 'lodash/cloneDeep';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ShareContainerImportComponent } from '../container-import/container-import.component';

@Component({
    selector: 'hbl-fcl-container-popup',
    templateUrl: './hbl-fcl-container.popup.html',
    styleUrls: ['./../container-list/container-list.popup.scss']

})
export class ShareBussinessHBLFCLContainerPopupComponent extends PopupBase {

    @ViewChild(forwardRef(() => ShareContainerImportComponent)) private containerImportPopup: ShareContainerImportComponent;
    @ViewChild('confirmDeleteContainerPopup') confirmDeleteContainerPopup: ConfirmPopupComponent;

    @Input() type: string = 'import';
    @Output() onChange: EventEmitter<Container[]> = new EventEmitter<Container[]>();

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
    spinnerContainer: string = 'spinnerContainer';
    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _store: Store<IContainerState>,
        protected cdRef: ChangeDetectorRef,
        protected _sortService: SortService,
        protected _toastService: ToastrService,
        protected _documentRepo: DocumentationRepo,
        protected _spinner: NgxSpinnerService
    ) {
        super();

        this.requestSort = this.sortContainer;
    }

    ngOnInit(): void {
        this.configHeader();
        this.cdRef.detectChanges(); // * tell ChangeDetect update view in app-table-header (field required).
        this.getMasterData();

        // * GET DATA CONTAINER FROM STORE.
        this._store.select(getHBLContainersState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: IContainerState | any) => {
                    console.log(res);
                    this.containers = res;
                    this.initContainers = cloneDeep(res);
                }
            );
    }

    configHeader() {
        this.headers = [
            //1
            { title: 'Cont Type', field: 'containerTypeId', sortable: true, required: true, width: 200 },
            //2
            { title: 'Cont Quantity', field: 'quantity', required: true, sortable: true },
            //8
            { title: 'Container No', field: 'containerNo', sortable: true, },
            //9
            { title: 'Seal No', field: 'sealNo', sortable: true, },
            //6
            { title: 'Package Quantity', field: 'packageQuantity', sortable: true, },
            //7
            { title: 'Package Type', field: 'packageTypeId', sortable: true, },
            //3
            { title: 'G.W', field: 'gw', sortable: true, },
            //4
            { title: 'C.W', field: 'chargeAbleWeight', sortable: true, },
            //5
            { title: 'CBM', field: 'cbm', sortable: true, },
            //15
            { title: 'Unit', field: 'unitOfMeasureId', sortable: true, },
            //10
            { title: 'A Part', field: '', sortable: true, },
            //11
            { title: 'Mark No', field: 'markNo', sortable: true, },
            //12
            { title: 'Commodity', field: 'commodityId', sortable: true, width: 200 },
            //13
            { title: 'Description', field: 'description', sortable: true, },
            //14
            { title: 'N.W', field: 'nw', sortable: true, },

        ];
    }

    addNewContainer() {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;

        this.initContainers = [...this.initContainers, new Container({ nw: null, cbm: null, chargeAbleWeight: null, gw: null, unitOfMeasureId: !!this.defaultWeightUnit ? this.defaultWeightUnit.id : null, unitOfMeasureName: !!this.defaultWeightUnit ? this.defaultWeightUnit.unitNameEn : null })];

    }

    duplicate(index: number) {
        this.isSubmitted = false;
        this.isDuplicateContPakage = false;

        const duplicatedContainer = cloneDeep(this.initContainers[index]);
        duplicatedContainer.id = SystemConstants.EMPTY_GUID;

        this.initContainers = [...this.initContainers, duplicatedContainer];

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
            // this._store.dispatch(new DeleteContainerAction(this.selectedIndexContainer)); // * DISPATCH DELETE ACTION
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
                    this.commodities = res[3];

                    const kgs: Unit = this.weightUnits.find(w => w.code === 'kgs' || w.code === 'KGS');
                    if (!!kgs) {
                        this.defaultWeightUnit = kgs;
                    }
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
                    container.description = this.getDescriptionName(container.containerTypeId);
                    container.packageTypeName = this.getPackageTypeName(container.packageTypeId);
                    /* update rule detail package & package */
                    // if (!!container.containerNo || !!container.markNo || !!container.sealNo) {
                    //     container.quantity = 1;
                    // }
                }
                this._store.dispatch(new SaveContainerAction(this.containers));
                this.onChange.emit(this.containers);

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

        if (this.type === 'import') {
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
        } else {
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

    syncShipment() {
        if (!!this.mblid) {
            this._spinner.show(this.spinnerContainer);
            this._documentRepo.getListContainersOfJob({ mblid: this.mblid })
                .pipe(finalize(() => this._spinner.hide(this.spinnerContainer)))
                .subscribe(
                    (res: Container[]) => {
                        this.initContainers.length = 0;
                        this.initContainers = [...res];
                    }
                );

        } else {
            console.error("not found mblId");
        }
    }
}
