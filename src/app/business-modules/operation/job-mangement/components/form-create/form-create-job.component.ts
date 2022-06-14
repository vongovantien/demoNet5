import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CatalogueRepo, DocumentationRepo, SystemRepo } from '@repositories';
import { CommodityGroup, Customer, PortIndex, User, LinkAirSeaModel } from '@models';
import { IShareBussinessState } from '@share-bussiness';
import { GetCataloguePortAction, getCataloguePortState, GetCatalogueCarrierAction, GetCatalogueAgentAction, getCatalogueCarrierState, getCatalogueAgentState, GetCatalogueCommodityGroupAction, getCatalogueCommodityGroupState, getCurrentUserState } from '@store';
import { CommonEnum } from '@enums';
import { ComboGridVirtualScrollComponent, InfoPopupComponent } from '@common';
import { ChargeConstants, JobConstants, SystemConstants } from '@constants';
import { FormValidators } from '@validators';
import { AppForm } from '@app';

import { Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
    selector: 'job-mangement-form-create',
    templateUrl: './form-create-job.component.html'
})

export class JobManagementFormCreateComponent extends AppForm implements OnInit {
    @ViewChild('comfirmCusAgreement') infoPopup: InfoPopupComponent;
    @ViewChild('comboGridCustomerCpn') comboGridCustomerCpn: ComboGridVirtualScrollComponent;

    formCreate: FormGroup;

    hwbno: AbstractControl;
    mblno: AbstractControl;
    serviceDate: AbstractControl;
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
    shipmentType: AbstractControl;
    salemansId: AbstractControl;

    productServices: string[] = JobConstants.COMMON_DATA.PRODUCTSERVICE;
    serviceModes: string[] = JobConstants.COMMON_DATA.SERVICEMODES;
    shipmentModes: string[] = JobConstants.COMMON_DATA.SHIPMENTMODES;
    shipmentTypes: string[] = JobConstants.COMMON_DATA.SHIPMENTTYPES;
    commodityGroups: Observable<CommodityGroup[]>;

    customers: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    users: Observable<User[]>;
    salesmans: User[]; // * Load động theo Partner được chọn.

    jobLinkAirSeaNo: string = '';
    jobLinkAirSeaInfo: LinkAirSeaModel;

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name Abbr' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    displayFieldSalesman: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameEn', label: 'Full Name' }
    ];

    userLogged: User;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        protected _documentRepo: DocumentationRepo,
        private _store: Store<IShareBussinessState>,
        private _fb: FormBuilder,
        private _toaster: ToastrService,
    ) {
        super();
    }

    ngOnInit() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));


        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port }));
        this._store.dispatch(new GetCatalogueCarrierAction());
        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueCommodityGroupAction());

        this.ports = this._store.select(getCataloguePortState);
        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.commodityGroups = this._store.select(getCatalogueCommodityGroupState);
        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        // this.salesmans = this._systemRepo.getSystemUsers({ active: true });
        this.users = this._systemRepo.getListSystemUser();

        this.initForm();
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
                this._documentRepo.validateCheckPointContractPartner(data.id, '', 'CL', null, 1)
                    .pipe(
                        switchMap(
                            (res: CommonInterface.IResult) => {
                                if (res.status) {
                                    this.customerId.setValue(data.id);
                                    return this._catalogueRepo.getListSalemanByPartner(data.id, ChargeConstants.CL_CODE);
                                }
                                this.customerId.setValue(null);
                                this._toaster.warning(res.message);
                                return of(false);
                            }
                        )
                    )
                    .subscribe(
                        (res: any) => {
                            if (!!res) {
                                this.salesmans = res || [];
                                if (!!this.salesmans.length) {
                                    this.salemansId.setValue(res[0].id);
                                } else {
                                    this.infoPopup.body = `${data.shortName} not have any agreement for service in this office <br/> please check again!`;
                                    this.infoPopup.show();
                                    this.salemansId.setValue(null);
                                }
                            } else {
                                this.salesmans = [];
                                this.salemansId.setValue(null);
                            }
                        }
                    )
                break;
            case 'salesman':
                this.salemansId.setValue(data.id);
                break;
            default:
                break;
        }
    }

    initForm() {
        this.formCreate = this._fb.group({
            hwbno: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            mblno: [null, Validators.compose([
                FormValidators.required,
                FormValidators.validateSpecialChar
            ])],
            flightVessel: [],
            purchaseOrderNo: [],

            serviceDate: [null, Validators.required],

            productService: [null, Validators.required],
            serviceMode: [null, Validators.required],
            shipmentMode: [null, Validators.required],
            commodityGroupId: [],
            shipmentType: [this.shipmentTypes[0], Validators.required],

            customerId: [null, Validators.required],
            pol: [],
            pod: [],
            supplierId: [null, Validators.required],
            agentId: [],
            billingOpsId: [this.userLogged.id, Validators.required],
            salemansId: [null, Validators.required],
            isReplicate: [false]

        }, { validator: FormValidators.comparePort });

        this.hwbno = this.formCreate.controls['hwbno'];
        this.mblno = this.formCreate.controls['mblno'];
        this.serviceDate = this.formCreate.controls['serviceDate'];
        this.productService = this.formCreate.controls['productService'];
        this.serviceMode = this.formCreate.controls['serviceMode'];
        this.shipmentMode = this.formCreate.controls['shipmentMode'];
        this.commodityGroupId = this.formCreate.controls['commodityGroupId'];
        this.customerId = this.formCreate.controls['customerId'];
        this.pol = this.formCreate.controls['pol'];
        this.pod = this.formCreate.controls['pod'];
        this.supplierId = this.formCreate.controls['supplierId'];
        this.agentId = this.formCreate.controls['agentId'];
        this.billingOpsId = this.formCreate.controls['billingOpsId'];
        this.shipmentType = this.formCreate.controls['shipmentType'];
        this.salemansId = this.formCreate.controls['salemansId'];

    }

    getASInfoToLink() {
        if (!this.hwbno.value || !this.mblno.value) {
            this._toaster.warning("MBL No and HBL No is empty. Please complete first!");
            return;
        }
        if (!this.productService.value || !this.serviceMode.value
            || (this.productService.value.indexOf('Sea') < 0 && this.productService.value !== 'Air')) {
            this._toaster.warning("Service's not valid to link. Please select another!");
        } else {
            this._documentRepo.getASTransactionInfo(null, this.mblno.value, this.hwbno.value, this.productService.value, this.serviceMode.value)
                .pipe(catchError(this.catchError))
                .subscribe((res: LinkAirSeaModel) => {
                    if (!!res?.jobNo) {
                        this.jobLinkAirSeaNo = res.jobNo;
                        this.jobLinkAirSeaInfo = res;
                        if (!this.customerId.value && !!res.customerId) {
                            this.customerId.setValue(res.customerId);
                        }
                        if (!this.salemansId.value && !!res.salemanId) {
                            this.salemansId.setValue(res.salemanId);
                        }
                        if (!this.serviceDate.value?.startDate && !!res.serviceDate) {
                            this.serviceDate.setValue({ startDate: new Date(res.serviceDate), endDate: new Date(res.serviceDate) });
                        }
                    }
                    else {
                        this.jobLinkAirSeaNo = null;
                        this._toaster.warning("There's no valid Air/Sea Shipment to display. Please check again!");
                    }
                });
        }
    }
}
