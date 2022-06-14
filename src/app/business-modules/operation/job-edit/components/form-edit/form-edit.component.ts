import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { AppForm } from '@app';
import { ShareBussinessContainerListPopupComponent, IShareBussinessState, GetContainerSuccessAction, getContainerSaveState } from '@share-bussiness';
import { OpsTransaction, Customer, PortIndex, Warehouse, User, CommodityGroup, Unit, Container } from '@models';
import { CatalogueRepo, DocumentationRepo, SystemRepo } from '@repositories';
import { Store } from '@ngrx/store';
import { getCataloguePortState, getCatalogueCarrierState, getCatalogueAgentState, GetCataloguePortAction, GetCatalogueCarrierAction, GetCatalogueAgentAction, getCatalogueWarehouseState, GetCatalogueWarehouseAction, getCatalogueCommodityGroupState, GetCatalogueCommodityGroupAction } from '@store';
import { CommonEnum } from '@enums';
import { FormValidators } from '@validators';
import { ChargeConstants, JobConstants, SystemConstants } from '@constants';
import { InfoPopupComponent } from '@common';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { InjectViewContainerRefDirective } from '@directives';
@Component({
    selector: 'job-mangement-form-edit',
    templateUrl: './form-edit.component.html'
})
export class JobManagementFormEditComponent extends AppForm implements OnInit {

    @ViewChild(ShareBussinessContainerListPopupComponent) containerPopup: ShareBussinessContainerListPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) confirmContainerRef: InjectViewContainerRefDirective;

    opsTransaction: OpsTransaction = null;

    formEdit: FormGroup;
    jobNo: AbstractControl;
    hwbno: AbstractControl;
    mblno: AbstractControl;
    serviceDate: AbstractControl;
    finishDate: AbstractControl;
    productService: AbstractControl;
    serviceMode: AbstractControl;
    shipmentMode: AbstractControl;
    customerId: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    supplierId: AbstractControl;
    flightVessel: AbstractControl;
    agentId: AbstractControl;
    purchaseOrderNo: AbstractControl;
    billingOpsId: AbstractControl;
    commodityGroupId: AbstractControl;
    warehouseId: AbstractControl;
    invoiceNo: AbstractControl;
    salemansId: AbstractControl;
    fieldOpsId: AbstractControl;
    clearanceLocation: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    sumGrossWeight: AbstractControl;
    sumNetWeight: AbstractControl;
    sumContainers: AbstractControl;
    sumPackages: AbstractControl;
    sumCbm: AbstractControl;
    containerDescription: AbstractControl;
    packageTypeId: AbstractControl;
    shipmentType: AbstractControl;
    note: AbstractControl;

    productServices: string[] = JobConstants.COMMON_DATA.PRODUCTSERVICE;
    serviceModes: string[] = JobConstants.COMMON_DATA.SERVICEMODES;
    shipmentModes: string[] = JobConstants.COMMON_DATA.SHIPMENTMODES;
    shipmentTypes: string[] = JobConstants.COMMON_DATA.SHIPMENTTYPES;

    customers: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    warehouses: Observable<Warehouse[]>;
    salesmans: User[];
    users: Observable<User[]>;
    commodityGroups: Observable<CommodityGroup[]>;
    packageTypes: Observable<Unit[]>;

    shipmentNo: string = null;
    shipmentInfo: string = '';
    customerName: string = '';

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;

    displayFieldWarehouse: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Code' },
        { field: 'nameEn', label: 'Warehouse Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];
    displayFieldSalesman: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameEn', label: 'Full Name' }
    ];
    isJobCopy: boolean = false;
    userLogged: any;

    containers: Observable<any>;
    salesmanName: string = null;

    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        protected _documentRepo: DocumentationRepo,
        private _store: Store<IShareBussinessState>,
        private _systemRepo: SystemRepo,
        private _toaster: ToastrService) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port }));
        this._store.dispatch(new GetCatalogueCarrierAction());
        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueWarehouseAction({ placeType: CommonEnum.PlaceTypeEnum.Warehouse }));
        this._store.dispatch(new GetCatalogueCommodityGroupAction());

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        // this.customers = this._store.select(getCurrentUserState)
        //     .pipe(
        //         filter(c => !!c.userName),
        //         switchMap((currentUser: SystemInterface.IClaimUser | any) => {
        //             if (!!currentUser.userName) {
        //                 return this._catalogueRepo.getPartnerByGroups(
        //                     [CommonEnum.PartnerGroupEnum.CUSTOMER],
        //                     true,
        //                     'CL',
        //                     currentUser?.officeId
        //                 ).pipe(startWith([]))
        //             }
        //         }),
        //         takeUntil(this.ngUnsubscribe),
        //     ) as any;
        this.users = this._systemRepo.getSystemUsers();
        this.ports = this._store.select(getCataloguePortState);
        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.warehouses = this._store.select(getCatalogueWarehouseState);
        this.commodityGroups = this._store.select(getCatalogueCommodityGroupState);
        this.packageTypes = this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE });

        this.containers = this._store.select(getContainerSaveState);

        this.initForm();
    }

    setFormValue() {
        this.formEdit.patchValue({
            jobNo: this.isJobCopy ? null : this.opsTransaction.jobNo,
            hwbno: this.isJobCopy ? null : this.opsTransaction.hwbno,
            mblno: this.isJobCopy ? null : this.opsTransaction.mblno,
            flightVessel: this.opsTransaction.flightVessel,
            purchaseOrderNo: this.opsTransaction.purchaseOrderNo,
            serviceDate: !!this.opsTransaction.serviceDate ? { startDate: new Date(this.opsTransaction.serviceDate), endDate: new Date(this.opsTransaction.serviceDate) } : null,
            finishDate: !!this.opsTransaction.finishDate ? { startDate: new Date(this.opsTransaction.finishDate), endDate: new Date(this.opsTransaction.finishDate) } : null,
            customerId: this.opsTransaction.customerId,
            pol: this.opsTransaction.pol,
            pod: this.opsTransaction.pod,
            supplierId: this.opsTransaction.supplierId,
            agentId: this.opsTransaction.agentId,
            salemansId: this.opsTransaction.salemanId,
            warehouseId: this.opsTransaction.warehouseId,
            invoiceNo: this.opsTransaction.invoiceNo,
            fieldOpsId: this.opsTransaction.fieldOpsId,
            billingOpsId: this.opsTransaction.billingOpsId,
            clearanceLocation: this.opsTransaction.clearanceLocation,
            shipper: this.opsTransaction.shipper,
            consignee: this.opsTransaction.consignee,
            sumGrossWeight: this.opsTransaction.sumGrossWeight,
            sumNetWeight: this.opsTransaction.sumNetWeight,
            sumContainers: this.opsTransaction.sumContainers,
            sumPackages: this.opsTransaction.sumPackages,
            sumCbm: this.opsTransaction.sumCbm,
            containerDescription: this.opsTransaction.containerDescription,
            productService: this.opsTransaction.productService,
            serviceMode: this.opsTransaction.serviceMode,
            shipmentMode: this.opsTransaction.shipmentMode,
            commodityGroupId: this.opsTransaction.commodityGroupId,
            packageTypeId: this.opsTransaction.packageTypeId,
            shipmentType: this.opsTransaction.shipmentType,
            note: this.opsTransaction.note
        });

        this.customerName = this.opsTransaction.customerName;
        this.shipmentInfo = this.opsTransaction.serviceNo;
        this.currentFormValue = this.formEdit.getRawValue(); // * for candeactivate.
        this.salesmanName = this.opsTransaction.salesmanName;

        if (this.opsTransaction.isAllowChangeSaleman) {
            this._catalogueRepo.getListSalemanByPartner(this.opsTransaction.customerId, ChargeConstants.CL_CODE)
                .subscribe((salesmans: any) => {
                    this.salesmans = salesmans;
                })
        }

    }

    initForm() {
        this.formEdit = this._fb.group({
            jobNo: [null],
            hwbno: [null, Validators.compose([
                FormValidators.validateSpecialChar,
            ])],

            mblno: [null, Validators.compose([
                FormValidators.validateSpecialChar,
            ])],
            flightVessel: [],
            purchaseOrderNo: [],

            serviceDate: [null, Validators.required],
            finishDate: [null],

            productService: [],
            serviceMode: [],
            shipmentMode: [],
            commodityGroupId: [],

            customerId: [null, Validators.required],
            pol: [],
            pod: [],
            supplierId: [null, Validators.required],
            agentId: [],
            salemansId: [null, Validators.required],
            warehouseId: [],
            invoiceNo: [null],
            fieldOpsId: [null],
            billingOpsId: [null, Validators.required],
            clearanceLocation: [null],
            shipper: [null],
            consignee: [null],
            shipmentType: [null, Validators.required],
            sumGrossWeight: [null],
            sumNetWeight: [null],
            sumContainers: [null],
            sumPackages: [null],
            sumCbm: [null],
            containerDescription: [null],
            packageTypeId: [null],
            note: [null],
        }, { validator: FormValidators.comparePort });

        this.jobNo = this.formEdit.controls['jobNo'];
        this.serviceDate = this.formEdit.controls['serviceDate'];
        this.finishDate = this.formEdit.controls['finishDate'];
        this.productService = this.formEdit.controls['productService'];
        this.serviceMode = this.formEdit.controls['serviceMode'];
        this.shipmentMode = this.formEdit.controls['shipmentMode'];
        this.hwbno = this.formEdit.controls['hwbno'];
        this.mblno = this.formEdit.controls['mblno'];
        this.customerId = this.formEdit.controls['customerId'];
        this.pol = this.formEdit.controls['pol'];
        this.pod = this.formEdit.controls['pod'];
        this.supplierId = this.formEdit.controls['supplierId'];
        this.flightVessel = this.formEdit.controls['flightVessel'];
        this.warehouseId = this.formEdit.controls['warehouseId'];
        this.agentId = this.formEdit.controls['agentId'];
        this.invoiceNo = this.formEdit.controls['invoiceNo'];
        this.purchaseOrderNo = this.formEdit.controls['purchaseOrderNo'];
        this.salemansId = this.formEdit.controls['salemansId'];
        this.fieldOpsId = this.formEdit.controls['fieldOpsId'];
        this.billingOpsId = this.formEdit.controls['billingOpsId'];
        this.clearanceLocation = this.formEdit.controls['clearanceLocation'];
        this.shipper = this.formEdit.controls['shipper'];
        this.consignee = this.formEdit.controls['consignee'];
        this.sumGrossWeight = this.formEdit.controls['sumGrossWeight'];
        this.sumNetWeight = this.formEdit.controls['sumNetWeight'];
        this.sumContainers = this.formEdit.controls['sumContainers'];
        this.sumPackages = this.formEdit.controls['sumPackages'];
        this.sumCbm = this.formEdit.controls['sumCbm'];
        this.containerDescription = this.formEdit.controls['containerDescription'];
        this.packageTypeId = this.formEdit.controls['packageTypeId'];
        this.commodityGroupId = this.formEdit.controls['commodityGroupId'];
        this.shipmentType = this.formEdit.controls['shipmentType'];
        this.note = this.formEdit.controls['note'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'supplier':
                this.supplierId.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'agent':
                this.agentId.setValue(data.id);
                break;
            case 'customer':
                this._toaster.clear();
                this.customerId.setValue(data.id);
                this.customerName = data.shortName;
                const comboGridSalesman = this.comboGrids.find(x => x.name === 'salemansId');

                if (!this.opsTransaction.isAllowChangeSaleman) {
                    this.salesmanName = SystemConstants.ITL_BOD;

                    return;
                }

                this._catalogueRepo.getListSalemanByPartner(data.id, ChargeConstants.CL_CODE)
                    .subscribe(
                        (res: any) => {
                            if (!!res) {
                                this.salesmans = res || [];
                                if (!!this.salesmans.length) {
                                    this.salemansId.setValue(res[0].id);
                                    this.salesmanName = res[0].username;
                                } else {
                                    this.salemansId.setValue(null);
                                    this.salesmanName = null;
                                    this.showPopupDynamicRender(InfoPopupComponent, this.confirmContainerRef.viewContainerRef, {
                                        body: `<strong>${data.shortName}</strong> not have any agreement for service in this office <br/> please check again!`
                                    })

                                }
                            } else {
                                this.salesmans = [];
                                this.customerName = this.salesmanName = null;
                                comboGridSalesman.displayStringValue = null;
                                this.salemansId.setValue(null);
                            }
                        }
                    )
                break;
            case 'warehouse':
                this.warehouseId.setValue(data.id);
                break;
            case 'salesman':
                this.salemansId.setValue(data.id);
                this.salesmanName = data.username;
                break;
            case 'fieldOps':
                this.fieldOpsId.setValue(data.id);
                break;
            case 'billingOps':
                this.billingOpsId.setValue(data.id);
                break;
            case 'clearance':
                this.clearanceLocation.setValue(data.id);
                break;
            default:
                break;
        }
    }

    showListContainer() {
        this.containerPopup.mblid = this.opsTransaction.id;
        this.containerPopup.show();
    }

    getASInfoToLink() {
        if (!this.hwbno.value || !this.mblno.value) {
            this._toaster.warning("MBL No and HBL No is empty. Please complete first!");
            return;
        }

        if (!this.productService.value || !this.serviceMode.value || (this.productService.value.indexOf('Sea') < 0 && this.productService.value !== 'Air')) {
            this._toaster.warning("Service's not valid to link. Please select another!");
        } else {
            this._documentRepo.getASTransactionInfo(this.jobNo.value, this.mblno.value, this.hwbno.value, this.productService.value, this.serviceMode.value)
                .pipe(catchError(this.catchError))
                .subscribe((res: ILinkAirSeaInfoModel) => {
                    if (!!res?.jobNo) {
                        this.shipmentNo = res.jobNo;
                        this.shipmentInfo = res.jobNo;
                        this.formEdit.patchValue({
                            sumGrossWeight: res.gw,
                            sumCbm: res.cw,
                            sumPackages: res.packageQty
                        });

                        if (res.containers) {
                            res.containers.forEach(c => {
                                c.id = SystemConstants.EMPTY_GUID;
                            })
                            this._store.dispatch(new GetContainerSuccessAction(res.containers));
                        }
                    } else {
                        this.shipmentInfo = null;
                        this._toaster.warning("There's no valid Air/Sea Shipment to display. Please check again!");
                    }
                });
        }
    }

    getBillingOpsId() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.billingOpsId.setValue(this.userLogged.id);
    }
}
export interface ILinkAirSeaInfoModel {
    hblId: string;
    jobId: string;
    jobNo: string;
    gw: number;
    cw: number;
    packageQty: number;
    containers: Container[];
}
