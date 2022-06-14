import { Component, ViewChild, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { CatalogueRepo } from '@repositories';
import { AppForm } from '@app';
import { DataService } from '@services';
import { JobConstants } from '@constants';
import { CsTransactionDetail, PortIndex, CsTransaction, ProviceModel, Customer, Incoterm } from '@models';
import { CommonEnum } from '@enums';
import { InfoPopupComponent } from '@common';
import { getCataloguePortState, getCataloguePortLoadingState, GetCataloguePortAction, getCurrentUserState } from '@store';

import * as fromShareBussiness from './../../../../share-business/store';

import { Observable } from 'rxjs';
import { filter, startWith, switchMap, takeUntil, tap, shareReplay } from 'rxjs/operators';
import { FormValidators } from '@validators';
import { ToastrService } from 'ngx-toastr';
import { InjectViewContainerRefDirective } from '@directives';

@Component({
    selector: 'app-form-create-hbl-sea-import',
    templateUrl: './form-create-hbl-sea-import.component.html'
})
export class ShareSeaServiceFormCreateHouseBillSeaImportComponent extends AppForm {
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    @Input() isUpdate: boolean = false;
    @Input() type: string = null;

    formGroup: FormGroup;
    customer: AbstractControl;
    saleMan: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    notifyParty: AbstractControl;
    alsoNotifyParty: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    supplier: AbstractControl;
    placeOfIssues: AbstractControl;
    mtBill: AbstractControl;
    hwbno: AbstractControl;
    hbltype: AbstractControl;
    servicetype: AbstractControl;
    etd: AbstractControl;
    eta: AbstractControl;
    pickupPlace: AbstractControl;
    finalDestinationPlace: AbstractControl;
    localVessel: AbstractControl;
    localVoyNo: AbstractControl;
    oceanVessel: AbstractControl;
    documentDate: AbstractControl;
    documentNo: AbstractControl;
    etawarehouse: AbstractControl;
    inWord: AbstractControl;

    shippingMark: AbstractControl;
    remark: AbstractControl;
    issueHBLDate: AbstractControl;
    originBLNumber: AbstractControl;
    referenceNo: AbstractControl;
    consigneeDescription: AbstractControl;
    shipperDescription: AbstractControl;
    notifyPartyDescription: AbstractControl;
    alsonotifyPartyDescription: AbstractControl;
    incotermId: AbstractControl;
    receivedBillTime: AbstractControl;


    oceanVoyNo: AbstractControl;
    configSaleman: CommonInterface.IComboGirdConfig | any = {};
    configPlaceOfIssued: CommonInterface.IComboGirdConfig | any = {};
    configPartner: CommonInterface.IComboGirdConfig | any = {};
    configPort: CommonInterface.IComboGirdConfig | any = {};

    saleMans: any = [];

    serviceTypesString: string[] = JobConstants.COMMON_DATA.SERVICETYPES;
    hbOfladingTypesString: string[] = JobConstants.COMMON_DATA.BILLOFLADINGS;
    numberOfOrigins: CommonInterface.ICommonTitleValue[] = [
        { title: 'One(1)', value: 1 },
        { title: 'Two(2)', value: 2 },
        { title: 'Three(3)', value: 3 }
    ];

    jobId: string = '';

    shipmentDetail: CsTransaction;
    ports: Observable<PortIndex[]>;
    provinces: Observable<ProviceModel[]>;
    suppliers: Observable<Customer[]>;
    shippers: Observable<Customer[]>;
    customers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    consigneesAndCustomers: Observable<Customer[]>;
    incoterms: Observable<Incoterm[]>;

    isLoading: boolean = false;
    isLoadingPort: Observable<boolean>;
    isSubmited: boolean = false;

    dateTimeCreated: string;
    dateTimeModified: string;
    userCreated: string;
    userModified: string;

    hblId: string = '';

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        protected _store: Store<fromShareBussiness.ITransactionState>,
        private _toast: ToastrService

    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));

        this.getMasterData();
        this.getConfigComboGrid();

        this.initForm();

        this.incoterms = this._catalogueRepo.getIncoterm({ service: [this.type] });

        this._store.select(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: CsTransaction) => {
                    this.shipmentDetail = res;
                    this.jobId = this.shipmentDetail.id;
                    this.dateTimeCreated = res.datetimeCreated;
                    this.dateTimeModified = res.datetimeModified;
                    this.userCreated = res.userNameCreated;
                    this.userModified = res.userNameModified;
                    if (!this.isUpdate) {
                        const formData = {
                            masterBill: this.shipmentDetail.mawb,
                            servicetype: this.shipmentDetail.typeOfService,
                            documentDate: { startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) },
                            supplier: this.shipmentDetail.coloaderId,
                            issueHBLDate: { startDate: new Date(), endDate: new Date() },
                            pol: this.shipmentDetail.pol,
                            pod: this.shipmentDetail.pod,
                            localVessel: this.shipmentDetail.flightVesselName,
                            localVoyNo: this.shipmentDetail.voyNo,
                            finalDestination: this.shipmentDetail.podName,
                            eta: !!this.shipmentDetail.eta ? { startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) } : null,
                            etd: !!this.shipmentDetail.etd ? { startDate: new Date(this.shipmentDetail.etd), endDate: new Date(this.shipmentDetail.etd) } : null,
                            arrivalVessel: this.shipmentDetail.flightVesselName,
                            arrivalVoyage: this.shipmentDetail.voyNo,
                            incotermId: this.shipmentDetail.incotermId

                        };
                        this.formGroup.patchValue(formData);
                    }
                }
            );
    }

    getConfigComboGrid() {
        this.configPartner = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'shortName', label: 'Name ABBR' },
                { field: 'partnerNameEn', label: 'Name EN' },
                { field: 'taxCode', label: 'Tax Code' },

            ],
        }, { selectedDisplayFields: ['shortName'], });

        this.configPort = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'code', label: 'Port Code' },
                { field: 'nameEn', label: 'Port Name' },
                { field: 'countryNameEN', label: 'Country' },
            ],
        }, { selectedDisplayFields: ['nameEn'], });

        this.configSaleman = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'username', label: 'Username' },
            ],
        }, { selectedDisplayFields: ['username'], });

        this.configPlaceOfIssued = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'name_VN', label: 'Name Vn' },
                { field: 'name_EN', label: 'Name ABBR' },
                { field: 'Name EN', label: 'Name EN' },
                { field: 'code', label: 'Code' }
            ],
        }, { selectedDisplayFields: ['name_EN'], });
    }

    getMasterData() {
        // this.saleMans = this._systemRepo.getListSystemUser();
        this.ports = this._store.select(getCataloguePortState).pipe(shareReplay());
        this.isLoadingPort = this._store.select(getCataloguePortLoadingState);
        this.provinces = this._catalogueRepo.getAllProvinces();
        this.suppliers = this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.CARRIER, active: true });
        this.shippers = this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.SHIPPER, active: true });
        //this.customers = this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.CUSTOMER, active: true });
        this.customers = this._store.select(getCurrentUserState)
            .pipe(
                filter(c => !!c.userName),
                tap((c) => this.currentUser = c),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getPartnerByGroups(
                            [CommonEnum.PartnerGroupEnum.CUSTOMER],
                            true,
                            this.type,
                            currentUser?.officeId
                        ).pipe(startWith([]))
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            ) as any;
        this.consignees = this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.CONSIGNEE, active: true });
        this.consigneesAndCustomers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
    }

    initForm() {
        this.formGroup = this._fb.group({
            customer: [null, Validators.required],
            saleMan: [null, Validators.required],
            shipper: [],
            consignee: [null, Validators.required],
            notifyParty: [],
            alsoNotifyParty: [],
            pol: [null, Validators.required],
            pod: [null, Validators.required],
            supplier: [],
            placeOfIssues: [],
            masterBill: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            hbOfladingNo: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            hbOfladingType: [null,
                Validators.required],
            finalDestination: [

            ],
            placeofReceipt: [
            ],
            feederVessel1: [
            ],
            arrivalVessel: [
            ],
            arrivalVoyage: [
            ],
            receivedBillTime:[],
            documentNo: [],
            referenceNo: [],
            inWord: [],
            shippingMark: [],
            documnentDate: [],
            remark: [],
            feederVoyageNo: [
            ],
            originBLNumber: [this.numberOfOrigins[0].value],
            etawarehouse: [],
            dateOfIssued: [],
            etd: [],
            eta: [null, Validators.required],
            shipperDescription: [],
            consigneeDescription: [],
            notifyPartyDescription: [],
            alsonotifyPartyDescription: [],
            incotermId: [null,Validators.required],
            serviceType: [null,
                Validators.required]
        }, { validator: [FormValidators.comparePort] });

        this.customer = this.formGroup.controls["customer"];
        this.saleMan = this.formGroup.controls["saleMan"];
        this.shipper = this.formGroup.controls["shipper"];
        this.consignee = this.formGroup.controls["consignee"];
        this.notifyParty = this.formGroup.controls['notifyParty'];
        this.alsoNotifyParty = this.formGroup.controls['alsoNotifyParty'];
        this.pol = this.formGroup.controls['pol'];
        this.pod = this.formGroup.controls['pod'];
        this.supplier = this.formGroup.controls['supplier'];
        this.placeOfIssues = this.formGroup.controls['placeOfIssues'];
        this.mtBill = this.formGroup.controls['masterBill'];
        this.hwbno = this.formGroup.controls['hbOfladingNo'];
        this.hbltype = this.formGroup.controls['hbOfladingType'];
        this.servicetype = this.formGroup.controls['serviceType'];
        this.etd = this.formGroup.controls['etd'];
        this.eta = this.formGroup.controls['eta'];
        this.pickupPlace = this.formGroup.controls['placeofReceipt'];
        this.finalDestinationPlace = this.formGroup.controls['finalDestination'];
        this.localVessel = this.formGroup.controls['arrivalVessel'];
        this.localVoyNo = this.formGroup.controls['arrivalVoyage'];
        this.oceanVessel = this.formGroup.controls['feederVessel1'];
        this.oceanVoyNo = this.formGroup.controls['feederVoyageNo'];
        this.documentDate = this.formGroup.controls['documnentDate'];
        this.documentNo = this.formGroup.controls['documentNo'];
        this.etawarehouse = this.formGroup.controls['etawarehouse'];
        this.inWord = this.formGroup.controls["inWord"];
        this.shippingMark = this.formGroup.controls['shippingMark'];
        this.remark = this.formGroup.controls['remark'];
        this.issueHBLDate = this.formGroup.controls['dateOfIssued'];
        this.originBLNumber = this.formGroup.controls['originBLNumber'];
        this.referenceNo = this.formGroup.controls['referenceNo'];
        this.consigneeDescription = this.formGroup.controls['consigneeDescription'];
        this.shipperDescription = this.formGroup.controls['shipperDescription'];
        this.notifyPartyDescription = this.formGroup.controls['notifyPartyDescription'];
        this.alsonotifyPartyDescription = this.formGroup.controls['alsonotifyPartyDescription'];
        this.incotermId = this.formGroup.controls['incotermId'];
        this.receivedBillTime = this.formGroup.controls['receivedBillTime'];
    }

    onUpdateDataToImport(data: CsTransactionDetail) {
        this.formGroup.patchValue({
            mawb: data.mawb,
            shipperDescription: data.shipperDescription,
            notifyPartyDescription: data.notifyPartyDescription,
            localVessel: data.localVessel,
            localVoyNo: data.localVoyNo,
            oceanVessel: data.oceanVessel,
            oceanVoyNo: data.oceanVoyNo,
            originBlnumber: data.originBlnumber,
            alsonotifyPartyDescription: data.alsoNotifyPartyDescription,
            customer: data.customerId,
            saleMan: data.saleManId,
            shipper: data.shipperId,
            consignee: data.consigneeId,
            consigneeDescription: data.consigneeDescription,
            notifyParty: data.notifyPartyId,
            pol: data.pol,
            pod: data.pod,
            alsoNotifyParty: data.alsoNotifyPartyId,
            hbltype: data.hbltype,
            supplier: data.coloaderId,
            pickupPlace: data.pickupPlace,
            finalDestinationPlace: data.finalDestinationPlace,
            shippingMark: data.shippingMark,
            remark: data.remark,
            inWord: data.inWord,
            serviceType: data.serviceType,
            receivedBillTime:data.receivedBillTime
        });
    }

    updateDataToForm(res: CsTransactionDetail) {
        this.formGroup.setValue({
            etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null, // * Date;,
            eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null, // * Date;
            etawarehouse: !!res.etawarehouse ? { startDate: new Date(res.etawarehouse), endDate: new Date(res.etawarehouse) } : null, // * Date;
            dateOfIssued: !!res.issueHbldate ? { startDate: new Date(res.issueHbldate), endDate: new Date(res.issueHbldate) } : null, // * Date;
            documnentDate: !!res.documentDate ? { startDate: new Date(res.documentDate), endDate: new Date(res.documentDate) } : null,
            receivedBillTime: !!res.receivedBillTime ? { startDate: new Date(res.receivedBillTime), endDate: new Date(res.receivedBillTime) } : null,

            masterBill: res.mawb,
            shipperDescription: res.shipperDescription,
            consigneeDescription: res.consigneeDescription,
            notifyPartyDescription: res.notifyPartyDescription,
            alsonotifyPartyDescription: res.alsoNotifyPartyDescription,
            hbOfladingNo: res.hwbno,
            placeofReceipt: res.pickupPlace,
            finalDestination: res.finalDestinationPlace,
            shipper: res.shipperId,
            feederVessel1: res.oceanVessel,
            feederVoyageNo: res.oceanVoyNo,
            arrivalVoyage: res.localVoyNo,
            arrivalVessel: res.localVessel,
            documentNo: res.documentNo,
            inWord: res.inWord,
            shippingMark: res.shippingMark,
            remark: res.remark,
            referenceNo: res.referenceNo,
            originBLNumber: res.originBlnumber,
            saleMan: res.saleManId,
            customer: res.customerId,
            consignee: res.consigneeId,
            notifyParty: res.notifyPartyId,
            alsoNotifyParty: res.alsoNotifyPartyId,
            pol: res.pol,
            pod: res.pod,
            supplier: res.coloaderId,
            placeOfIssues: res.issueHblplace,
            serviceType: res.serviceType,
            hbOfladingType: res.hbltype,
            incotermId: res.incotermId
        });

        this._catalogueRepo.getListSalemanByPartner(res.customerId, this.type)
            .subscribe((data) => {
                this.saleMans = data || [];
            });
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'saleman':
                this.saleMan.setValue(data.id);
                break;
            case 'Customer':
                this._toast.clear();

                this.customer.setValue(data.id);
                if (!this.consignee.value) {
                    this.consignee.setValue(data.id);
                    this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }

                this._catalogueRepo.getListSalemanByPartner(data.id, this.type)
                    .subscribe((res: any) => {
                        if (!!res) {
                            this.saleMans = res || [];
                            if (!!this.saleMans.length) {
                                this.saleMan.setValue(res[0].id);
                            } else {
                                this.saleMan.setValue(null);
                                this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                    body: `<strong>${data.shortName}</strong> not have any agreement for service in this office <br/> please check again!`
                                })
                            }
                        } else {
                            this.saleMans = [];
                            this.saleMan.setValue(null);
                        }
                    });
                break;
            case 'Shipper':
                this.shipper.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'Consignee':
                this.consignee.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'NotifyParty':
                this.notifyParty.setValue(data.id);
                this.notifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'AlsoNotifyParty':
                this.alsoNotifyParty.setValue(data.id);
                this.alsonotifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'PortOfLoading':
                this.pol.setValue(data.id);
                break;
            case 'PortOfDischarge':
                this.pod.setValue(data.id);
                this.finalDestinationPlace.setValue(data.nameEn);

                // * Update default value for sentTo delivery order.
                this._dataService.setData("podName", data.nameVn || "");
                break;
            case 'Supplier':
                this.supplier.setValue(data.id);
                break;
            case 'PlaceOfIssued':
                this.placeOfIssues.setValue(data.id);
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

    selectedHblType($event: string) {
        const selectedHblType = $event;
        if (selectedHblType === "Original") {
            this.originBLNumber.setValue(this.numberOfOrigins[2].value);
        } else {
            this.originBLNumber.setValue(this.numberOfOrigins[0].value);
        }
    }
}
