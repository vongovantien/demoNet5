import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Customer, User, PortIndex, CsTransaction, HouseBill, Warehouse, CountryModel, Unit, Incoterm } from '@models';
import { CatalogueRepo, DocumentationRepo, SystemRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { FormValidators } from '@validators';
import { getCataloguePortState, getCataloguePortLoadingState, GetCataloguePortAction, GetCatalogueWarehouseAction, getCatalogueWarehouseState, getCatalogueUnitState, GetCatalogueUnitAction, getCurrentUserState } from '@store';
import { AppForm } from '@app';
import { IShareBussinessState, getTransactionDetailCsTransactionState, getDetailHBlState } from '@share-bussiness';
import { JobConstants, SystemConstants, ChargeConstants } from '@constants';
import { DataService } from '@services';
import { InfoPopupComponent } from '@common';

import { takeUntil, catchError, skip, tap, mergeMap, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import _merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';
import { InjectViewContainerRefDirective } from '@directives';

@Component({
    selector: 'air-import-hbl-form-create',
    templateUrl: './form-create-house-bill-air-import.component.html',
    styles: [
        `
         .eta-date-picker .daterange-rtl .md-drppicker {
            left: -105px !important;
        }
        `
    ]
})
export class AirImportHBLFormCreateComponent extends AppForm implements OnInit {
    @Input() isUpdate: boolean = false;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    formCreate: FormGroup;
    customerId: AbstractControl;
    saleManId: AbstractControl;
    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    notifyPartyId: AbstractControl;
    warehouseId: AbstractControl;
    forwardingAgentId: AbstractControl;
    hbltype: AbstractControl;
    arrivaldate: AbstractControl;
    eta: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    flightDate: AbstractControl;
    flightNo: AbstractControl;
    flightNoOrigin: AbstractControl;
    finalPod: AbstractControl;
    packageQty: AbstractControl;
    incotermId:AbstractControl;
    freightPayment: AbstractControl;

    currencyId: AbstractControl;
    wTorVALPayment: AbstractControl;
    otherPayment: AbstractControl;
    originBlnumber: AbstractControl;
    issueHbldate: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    notifyPartyDescription: AbstractControl;
    mawb: AbstractControl;
    hwbno: AbstractControl;
    flightDateOrigin: AbstractControl;

    route: AbstractControl;
    packageType: AbstractControl;
    issueHBLDate: AbstractControl;
    desOfGoods: AbstractControl;
    wareHouseAnDate: AbstractControl;
    // forwardingAgentDescription: AbstractControl;

    customers: Observable<Customer[]>;
    saleMans: User[];
    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    notifies: Observable<Customer[]>;
    countries: Observable<CountryModel[]>;
    ports: Observable<PortIndex[]>;
    agents: Observable<Customer[]>;
    currencies: Observable<any[]>;
    warehouses: Observable<Warehouse[]>;
    ngDataUnit: Observable<Unit[]>;
    incoterms: Observable<Incoterm[]>;

    isLoadingPort: Observable<boolean>;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameVn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    displayFieldsCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;

    billTypes: string[] = ['Copy', 'Original', 'Surrendered'];
    termTypes: string[] = ['Prepaid', 'Collect', 'Sea - Air Difference'];
    wts: string[] = ['PP', 'CLL'];
    numberOBLs: CommonInterface.INg2Select[] = [
        { id: '0', text: 'Zero (0)' },
        { id: '1', text: 'One (1)' },
        { id: '2', text: 'Two (2)' },
        { id: '3', text: 'Three (3)' }
    ];

    jobId: string = SystemConstants.EMPTY_GUID;
    hblId: string = SystemConstants.EMPTY_GUID;
    shipmentDetail: CsTransaction;

    dateTimeCreated: string;
    dateTimeModified: string;
    userCreated: string;
    userModified: string;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _documentationRepo: DocumentationRepo,
        private _fb: FormBuilder,
        private _store: Store<IShareBussinessState>,
        private _dataService: DataService,
        private _toaster: ToastrService
    ) {
        super();
    }

    ngOnInit(): void {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
        this._store.dispatch(new GetCatalogueUnitAction({ active: true }));
        this._store.dispatch(new GetCatalogueWarehouseAction());

        this.initForm();
        this.getMasterData();
        this.incoterms = this._catalogueRepo.getIncoterm({ service: ['AI'] });

        if (!this.isUpdate) {
            this.getShipmentAndSetDefault();
        } else {
            this.getDetailHBLState();
        }
    }

    getShipmentAndSetDefault() {
        // * get detail shipment from store.
        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1),
                tap((shipment: CsTransaction) => {
                    this.shipmentDetail = new CsTransaction(shipment);

                    // * set default value for controls from shipment detail.
                    if (shipment && shipment.id !== SystemConstants.EMPTY_GUID) {
                        this.jobId = shipment.id;
                        this.formCreate.patchValue({
                            mawb: shipment.mawb,
                            pod: shipment.pod,
                            pol: shipment.pol,
                            arrivaldate: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                            eta: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                            flightDate: !!shipment.flightDate ? { startDate: new Date(shipment.flightDate), endDate: new Date(shipment.flightDate) } : null,
                            flightNo: shipment.flightVesselName,
                            forwardingAgentId: shipment.agentId,
                            arrivalDate: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                            warehouseId: shipment.warehouseId,
                            route: shipment.route,
                            packageQty: shipment.packageQty,
                            grossWeight: shipment.grossWeight,
                            chargeWeight: shipment.chargeWeight,
                            packageType: +shipment.packageType,
                            incontermId: shipment.incotermId,
                        });
                    }
                }),
                mergeMap(
                    () => this._documentationRepo.generateHBLNo(CommonEnum.TransactionTypeEnum.AirExport)
                )
            )
            .subscribe(
                (hawbNoGenerate: any) => {
                    if (this.shipmentDetail.isHawb) {
                        this.hwbno.setValue('N/H');
                    } else {
                        this.hwbno.setValue(hawbNoGenerate.hblNo);
                    }
                }
            );
    }

    getDetailHBLState() {
        this._store.select(getDetailHBlState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbl: HouseBill) => {
                    if (!!hbl && hbl.id !== SystemConstants.EMPTY_GUID && hbl.id !== undefined) {
                        this.jobId = hbl.jobId;
                        this.hblId = hbl.id;
                        this.dateTimeCreated = hbl.datetimeCreated;
                        this.dateTimeModified = hbl.datetimeModified;
                        this.userCreated = hbl.userNameCreated;
                        this.userModified = hbl.userNameModified;

                        this.updateFormValue(hbl);
                    }
                }
            );
    }

    getMasterData() {
        this.warehouses = this._store.select(getCatalogueWarehouseState);
        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        // this.saleMans = this._systemRepo.getListSystemUser();
        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.ports = this._store.select(getCataloguePortState).pipe(shareReplay());
        this.isLoadingPort = this._store.select(getCataloguePortLoadingState);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.notifies = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);
        this.ngDataUnit = this._store.select(getCatalogueUnitState);
    }

    initForm() {
        this.formCreate = this._fb.group({
            mawb: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            hwbno: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            consigneeDescription: [],
            notifyPartyDescription: [],
            shipperDescription: [],
            flightNo: [],
            flightNoOrigin: [],
            issuranceAmount: [],
            chgs: [],
            dclrca: ['NVD'],
            dclrcus: ['NCV'],
            handingInformation: [],

            issueHblplace: [],
            warehouseId: [],
            route: [],
            packageQty: [],
            desOfGoods: ['AS PER BILL'],
            poinvoiceNo: [],

            // * Combogrid
            customerId: [null, Validators.required],
            saleManId: [null, Validators.required],
            shipperId: [],
            consigneeId: [null, Validators.required],
            notifyPartyId: [],
            forwardingAgentId: [null, Validators.required],
            pol: [],
            pod: [null, Validators.required],
            finalPod: [],
            grossWeight: [],
            chargeWeight: [],

            // * Select
            hbltype: [],
            freightPayment: [],
            currencyId: [],
            originBlnumber: [],
            wTorVALPayment: [],
            otherPayment: [],
            packageType: [],

            // * Date
            arrivalDate: [],
            flightDate: [],
            issueHBLDate: [{ startDate: new Date(), endDate: new Date() }],
            flightDateOrigin: [],
            eta: [],
            incotermId: [null, Validators.required],
            wareHouseAnDate:[]

        },
            { validator: FormValidators.compareGW_CW }
        );

        this.mawb = this.formCreate.controls["mawb"];
        this.hwbno = this.formCreate.controls["hwbno"];

        this.customerId = this.formCreate.controls["customerId"];
        this.saleManId = this.formCreate.controls["saleManId"];
        this.shipperId = this.formCreate.controls["shipperId"];
        this.consigneeId = this.formCreate.controls["consigneeId"];
        this.notifyPartyId = this.formCreate.controls["notifyPartyId"];
        this.forwardingAgentId = this.formCreate.controls["forwardingAgentId"];
        this.pol = this.formCreate.controls["pol"];
        this.pod = this.formCreate.controls["pod"];
        this.finalPod = this.formCreate.controls['finalPod'];
        this.hbltype = this.formCreate.controls["hbltype"];
        this.freightPayment = this.formCreate.controls["freightPayment"];
        this.packageType = this.formCreate.controls["packageType"];

        this.arrivaldate = this.formCreate.controls["arrivaldate"];
        this.eta = this.formCreate.controls["eta"];

        this.flightDate = this.formCreate.controls["flightDate"];
        this.shipperDescription = this.formCreate.controls["shipperDescription"];
        this.consigneeDescription = this.formCreate.controls["consigneeDescription"];
        this.issueHBLDate = this.formCreate.controls['issueHBLDate'];
        this.desOfGoods = this.formCreate.controls['desOfGoods'];
        this.notifyPartyDescription = this.formCreate.controls['notifyPartyDescription'];
        this.flightDateOrigin = this.formCreate.controls['flightDateOrigin'];
        this.wareHouseAnDate = this.formCreate.controls['wareHouseAnDate'];
        this.incotermId = this.formCreate.controls['incotermId'];

    }

    onSelectDataFormInfo(data: any, type: string) {
        console.log(data)
        switch (type) {
            case 'customer':
                this._toaster.clear();
                this.customerId.setValue(data.id);
                if (!this.consigneeId.value) {
                    this.consigneeId.setValue(data.id);
                    this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }
                this._catalogueRepo.getListSalemanByPartner(data.id, ChargeConstants.AI_CODE)
                    .subscribe((res: any) => {
                        if (!!res) {
                            this.saleMans = res || [];
                            if (!!this.saleMans.length) {
                                this.saleManId.setValue(res[0].id);
                            } else {
                                this.saleManId.setValue(null);
                                this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                    body: `<strong>${data.shortName}</strong> not have any agreement for service in this office <br/> please check again!`
                                })
                            }
                        } else {
                            this.saleMans = [];
                            this.saleManId.setValue(null);
                        }
                    });

                break;
            case 'shipper':
                this.shipperId.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'notify':
                this.notifyPartyId.setValue(data.id);
                this.notifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;

            case 'consignee':
                this.consigneeId.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'agent':
                this.forwardingAgentId.setValue(data.id);
                break;
            case 'packageType':
                this.packageType.setValue(data.id);

                break;
            case 'sale':
                this.saleManId.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);

                break;
            case 'pod':
                this.pod.setValue(data.id);

                // * Update default value for sentTo delivery order.
                this._dataService.setDataService("podName", data.warehouseNameVn || "");
                break;
            case 'final':
                this.finalPod.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getDescription(fullName: string, address: string, tel: string, fax: string) {
        let strDescription: string = '';
        if (!!fullName) {
            strDescription += fullName;
        }
        if (!!address) {
            strDescription = strDescription + "\n" + address;
        }
        if (!!tel) {
            strDescription = strDescription + "\nTel No:" + tel;
        }
        if (!!fax) {
            strDescription = strDescription + "\nFax No:" + fax;
        }
        return strDescription;
    }

    updateFormValue(data: HouseBill) {
        const formValue = {
            issueHBLDate: !!data.issueHbldate ? { startDate: new Date(data.issueHbldate), endDate: new Date(data.issueHbldate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : null,
            arrivalDate: !!data.arrivalDate ? { startDate: new Date(data.arrivalDate), endDate: new Date(data.arrivalDate) } : null,
            wareHouseAnDate: !!data.wareHouseAnDate ? { startDate: new Date(data.wareHouseAnDate), endDate: new Date(data.wareHouseAnDate) } : null,

            hbltype: data.hbltype,
            freightPayment: data.freightPayment,
            packageType: data.packageType
        };

        this.formCreate.patchValue(_merge(cloneDeep(data), formValue));

        this._catalogueRepo.getListSalemanByPartner(data.customerId, ChargeConstants.AI_CODE)
            .subscribe((salesmans: any) => {
                this.saleMans = salesmans;
            })
    }
}
