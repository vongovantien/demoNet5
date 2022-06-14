import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { formatCurrency, formatDate } from '@angular/common';

import { Customer, User, PortIndex, Currency, CsTransaction, DIM, HouseBill, Warehouse, CsOtherCharge, AirwayBill, CountryModel, Incoterm } from '@models';
import { CatalogueRepo, SystemRepo, DocumentationRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { JobConstants, SystemConstants, ChargeConstants } from '@constants';
import { DataService } from '@services';
import { AppForm } from '@app';
import {
    IShareBussinessState,
    getTransactionDetailCsTransactionState,
    getDetailHBlState,
    getDimensionVolumesState,
    InitShipmentOtherChargeAction
} from '@share-bussiness';
import { getCataloguePortLoadingState, GetCatalogueWarehouseAction, getCatalogueWarehouseState, getCurrentUserState } from '@store';
import { InfoPopupComponent } from '@common';
import { FormValidators } from '@validators';

import { ShareAirExportOtherChargePopupComponent } from '../../../../share/other-charge/air-export-other-charge.popup';

import { map, tap, takeUntil, catchError, skip, debounceTime, distinctUntilChanged, mergeMap, startWith, filter, switchMap, shareReplay } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';
import { InjectViewContainerRefDirective } from '@directives';


@Component({
    selector: 'air-export-hbl-form-create',
    templateUrl: './form-create-house-bill-air-export.component.html',
    styleUrls: ['./form-create-house-bill-air-export.component.scss']
})
export class AirExportHBLFormCreateComponent extends AppForm implements OnInit {
    @Input() isUpdate: boolean = false;
    @ViewChild(ShareAirExportOtherChargePopupComponent) otherChargePopup: ShareAirExportOtherChargePopupComponent;
    // @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    formCreate: FormGroup;
    customerId: AbstractControl;
    saleManId: AbstractControl;
    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    forwardingAgentId: AbstractControl;
    hbltype: AbstractControl;
    shipmenttype: AbstractControl;
    rclass: AbstractControl;
    asArranged: AbstractControl;
    etd: AbstractControl;
    eta: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    flightDate: AbstractControl;
    freightPayment: AbstractControl;
    currencyId: AbstractControl;
    wtorValpayment: AbstractControl;
    otherPayment: AbstractControl;
    originBlnumber: AbstractControl;
    issueHbldate: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    forwardingAgentDescription: AbstractControl;
    dimensionDetails: FormArray;
    hwbno: AbstractControl;
    mawb: AbstractControl;
    issueHblplace: AbstractControl;
    warehouseId: AbstractControl;
    rateCharge: AbstractControl;
    handingInformation: AbstractControl;
    incotermId:AbstractControl;

    customers: Observable<Customer[]>;
    saleMans: User[];
    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    countries: Observable<CountryModel[]>;
    ports: Observable<PortIndex[]>;
    agents: Observable<Customer[]>;
    warehouses: Observable<Warehouse[]>;
    currencies: Observable<Currency[]>;
    incoterms: Observable<Incoterm[]>;

    airwayBill: AirwayBill;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    displayFieldsCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;

    billTypes: string[] = ['Copy', 'Original', 'Surrendered'];
    termTypes: string[] = ['Prepaid', 'Collect', 'Sea - Air Difference'];
    shipmentTypes: string[] = JobConstants.COMMON_DATA.SHIPMENTTYPES;
    wts: string[] = JobConstants.COMMON_DATA.WT;
    numberOBLs: CommonInterface.INg2Select[] = JobConstants.COMMON_DATA.BLNUMBERS;
    rClasses: string[] = JobConstants.COMMON_DATA.RCLASS;

    selectedIndexDIM: number = -1;

    selectedPrepaid: boolean = false;
    selectedCollect: boolean = false;

    jobId: string = SystemConstants.EMPTY_GUID;
    hblId: string = SystemConstants.EMPTY_GUID;

    hwconstant: number = null;
    totalHeightWeight: number = null;
    totalCBM: number = null;

    shipmentDetail: CsTransaction;
    customerName: string;

    AA: string = 'As Arranged';

    dims: DIM[] = []; // * Dimension details.
    otherCharges: CsOtherCharge[] = [];

    // tslint:disable-next-line:no-any
    isLoadingPort: any;
    isSeparate: boolean = false;
    isCollapsed: boolean = false;
    isUpdateOtherCharge: boolean = false;

    dateTimeCreated: string;
    dateTimeModified: string;
    userCreated: string;
    userModified: string;


    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _documentationRepo: DocumentationRepo,
        private _store: Store<IShareBussinessState>,
        private _dataService: DataService,
        private _toast: ToastrService
    ) {
        super();
    }

    ngOnInit(): void {
        this._store.dispatch(new GetCatalogueWarehouseAction());

        this.initForm();
        this.loadMasterData();
        this.incoterms = this._catalogueRepo.getIncoterm({ service: ['AE'] });
        if (this.isUpdate) {
            this.getDetailHBLState();
            this.getDimensionState();
        } else {
            this.getDetailShipmentAndSetDefault();
        }
    }

    getDetailShipmentAndSetDefault() {
        const claim = localStorage.getItem(SystemConstants.USER_CLAIMS);
        const currenctUser = JSON.parse(claim)["officeId"];

        // * get detail shipment from store.
        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1),
                tap(
                    (shipment: CsTransaction) => {
                        // * set default value for controls from shipment detail.
                        if (shipment && shipment.id !== SystemConstants.EMPTY_GUID) {

                            this.shipmentDetail = new CsTransaction(shipment);
                            this.jobId = this.shipmentDetail.id;
                            this.hwconstant = this.shipmentDetail.hwConstant;

                            this.formCreate.patchValue({
                                mawb: shipment.mawb,
                                pod: shipment.pod,
                                pol: shipment.pol,
                                etd: !!shipment.etd ? { startDate: new Date(shipment.etd), endDate: new Date(shipment.etd) } : null,
                                eta: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                                flightDate: !!shipment.flightDate ? { startDate: new Date(shipment.flightDate), endDate: new Date(shipment.flightDate) } : null,
                                flightNo: shipment.flightVesselName,
                                warehouseId: shipment.warehouseId,
                                firstCarrierBy: shipment.flightVesselName,
                                freightPayment: shipment.paymentTerm,
                                kgIb: 'K',
                                handingInformation: this.setDefaultHandlingInformation(shipment),
                                incotermId: shipment.incotermId
                            });

                            // *  CR 14501
                            if (shipment.isHawb) {
                                const valueDefaultFromShipment = {
                                    grossWeight: shipment.grossWeight,
                                    chargeWeight: shipment.chargeWeight,
                                    hw: shipment.hw,
                                    packageQty: shipment.packageQty,
                                };
                                this.totalHeightWeight = valueDefaultFromShipment.hw;
                                this.formCreate.patchValue(valueDefaultFromShipment);
                            }
                            this.customerName = this.shipmentDetail.customerName;
                        }
                    }
                ),
                mergeMap(
                    () => forkJoin([
                        this._documentationRepo.getAirwayBill(this.jobId),
                        this._systemRepo.getLocationOfficeById(currenctUser),
                        this._documentationRepo.generateHBLNo(CommonEnum.TransactionTypeEnum.AirExport)
                    ])
                ))
            .subscribe(
                ([airwaybill, fesponseOfficeLocation, hawbNoGenerate]) => {
                    if (!!airwaybill) {
                        this.airwayBill = airwaybill;
                        this.forwardingAgentId.setValue(this.airwayBill.consigneeId);
                        this.formCreate.controls['transitPlaceTo1'].setValue(this.airwayBill.transitPlaceTo1);
                        this.formCreate.controls['transitPlaceTo1'].setValue(this.airwayBill.transitPlaceTo1);
                        this.formCreate.controls['firstCarrierTo'].setValue(this.airwayBill.firstCarrierTo);
                        this.formCreate.controls['transitPlaceBy1'].setValue(this.airwayBill.transitPlaceBy1);
                        this.formCreate.controls['transitPlaceTo2'].setValue(this.airwayBill.transitPlaceTo2);
                        this.formCreate.controls['transitPlaceBy2'].setValue(this.airwayBill.transitPlaceBy2);
                        this.formCreate.controls['forwardingAgentDescription'].setValue(this.airwayBill.consigneeDescription);
                    }
                    if (fesponseOfficeLocation.status) {
                        this.issueHblplace.setValue(fesponseOfficeLocation.data);
                    }

                    // * CR 15222
                    if (this.shipmentDetail.isHawb) {
                        this.hwbno.setValue('N/H');
                    } else {
                        this.hwbno.setValue(hawbNoGenerate.hblNo);
                    }

                }
            );
    }

    loadMasterData() {
        // this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        this.customers = this._store.select(getCurrentUserState)
            .pipe(
                filter(c => !!c.userName),
                tap((c) => this.currentUser = c),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getPartnerByGroups(
                            [CommonEnum.PartnerGroupEnum.CUSTOMER],
                            true,
                            'AE',
                            currentUser?.officeId
                        ).pipe(startWith([]))
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            ) as any;

        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);
        this.ports = this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }).pipe(shareReplay());;
        this.warehouses = this._store.select(getCatalogueWarehouseState);
        // this.saleMans = this._systemRepo.getListSystemUser();
        this.isLoadingPort = this._store.select(getCataloguePortLoadingState);
        this.currencies = this._catalogueRepo.getCurrencyBy({ active: true });

    }
    getDimensionState() {
        this._store.select(getDimensionVolumesState)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((dims: DIM[]) => dims.map(d => new DIM(d))),
            )
            .subscribe(
                (dims: DIM[]) => {
                    this.dims = dims;
                    // * Update dimension Form Array.
                    this.formCreate.setControl('dimensionDetails', this.setDimensionDetails(this.dims));

                    this.updateHeightWeight(this.dims);
                    this.formCreate.get('dimensionDetails')
                        .valueChanges
                        .subscribe(changes => {
                            this.updateHeightWeight(changes);
                        });
                });
    }

    getDetailHBLState() {
        this._store.select(getDetailHBlState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbl: HouseBill) => {
                    if (!!hbl && hbl.id && hbl.id !== SystemConstants.EMPTY_GUID) {
                        this.jobId = hbl.jobId;
                        this.hblId = hbl.id;
                        this.hwconstant = hbl.hwConstant;
                        this.dateTimeCreated = hbl.datetimeCreated;
                        this.dateTimeModified = hbl.datetimeModified;
                        this.userCreated = hbl.userNameCreated;
                        this.userModified = hbl.userNameModified;
                        this.updateFormValue(hbl);
                    }
                });
    }

    setDefaultHandlingInformation(shipment: CsTransaction) {
        if ((shipment.mawb || "").substring(0, 3) === "235") {
            return JobConstants.DEFAULT_HANDLING_TURKISH_CARGO;
        }
        return null;
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
            shipperDescription: [null, Validators.required],
            forwardingAgentDescription: [],
            pickupPlace: [],
            firstCarrierBy: [],
            firstCarrierTo: [],
            transitPlaceTo1: [],
            transitPlaceBy1: [],
            transitPlaceTo2: [],
            transitPlaceBy2: [],
            flightNo: [],
            issuranceAmount: [],
            chgs: [],
            dclrca: ['NVD'],
            dclrcus: ['NCV'],
            handingInformation: [],
            notify: [],
            issueHblplace: [],
            wtpp: [],
            valpp: [],
            taxpp: [],
            dueAgentPp: [],
            dueCarrierPp: [],
            totalPp: [],
            wtcll: [],
            valcll: [],
            taxcll: [],
            dueAgentCll: [],
            dueCarrierCll: [],
            totalCll: [],
            shippingMark: [],
            issuedBy: [null],
            sci: [],
            currConvertRate: [],
            ccchargeInDrc: [],
            desOfGoods: ['CONSOLIDATED CARGO AS PER ATTACHED MANIFEST'],
            otherCharge: [],
            packageQty: [],
            grossWeight: [],
            kgIb: [],
            rclass: ['Q'],
            comItemNo: [],
            chargeWeight: [],
            rateCharge: [],
            total: [{ value: null, disabled: true }],
            seaAir: [],
            route: [],
            min: [false],
            asArranged: [true],
            showDim: [true],
            // * Combogrid
            customerId: [null, Validators.required],
            saleManId: [null, Validators.required],
            shipperId: [],
            consigneeId: [],
            forwardingAgentId: [],
            pol: [],
            pod: [],
            warehouseId: [],

            // * Select
            hbltype: [],
            freightPayment: [null, Validators.required],
            currencyId: ['USD'],
            originBlnumber: [],
            wtorValpayment: [this.wts[0]],
            otherPayment: [this.wts[0]],
            shipmenttype: ['Freehand'],
            // * Date
            etd: [],
            eta: [],
            flightDate: [],
            issueHbldate: [{ startDate: new Date(), endDate: new Date() }, Validators.required],

            // * Array
            dimensionDetails: this._fb.array([]),
            incotermId: [null, Validators.required]

        },
            { validator: FormValidators.compareGW_CW }
        );

        this.hwbno = this.formCreate.controls["hwbno"];
        this.mawb = this.formCreate.controls["mawb"];
        this.customerId = this.formCreate.controls["customerId"];
        this.saleManId = this.formCreate.controls["saleManId"];
        this.shipperId = this.formCreate.controls["shipperId"];
        this.consigneeId = this.formCreate.controls["consigneeId"];
        this.forwardingAgentId = this.formCreate.controls["forwardingAgentId"];
        this.pol = this.formCreate.controls["pol"];
        this.pod = this.formCreate.controls["pod"];
        this.hbltype = this.formCreate.controls["hbltype"];
        this.shipmenttype = this.formCreate.controls["shipmenttype"];
        this.asArranged = this.formCreate.controls["asArranged"];
        this.freightPayment = this.formCreate.controls["freightPayment"];
        this.currencyId = this.formCreate.controls["currencyId"];
        this.originBlnumber = this.formCreate.controls["originBlnumber"];
        this.wtorValpayment = this.formCreate.controls["wtorValpayment"];
        this.otherPayment = this.formCreate.controls["otherPayment"];
        this.etd = this.formCreate.controls["etd"];
        this.eta = this.formCreate.controls["eta"];
        this.flightDate = this.formCreate.controls["flightDate"];
        this.issueHbldate = this.formCreate.controls["issueHbldate"];
        this.shipperDescription = this.formCreate.controls["shipperDescription"];
        this.consigneeDescription = this.formCreate.controls["consigneeDescription"];
        this.forwardingAgentDescription = this.formCreate.controls["forwardingAgentDescription"];
        this.dimensionDetails = <FormArray>this.formCreate.controls["dimensionDetails"];
        this.issueHblplace = this.formCreate.controls["issueHblplace"];
        this.rclass = this.formCreate.controls["rclass"];
        this.rateCharge = this.formCreate.controls["rateCharge"];
        this.handingInformation = this.formCreate.controls["handingInformation"];
        this.incotermId = this.formCreate.controls["incotermId"];

        this.formCreate.get('dimensionDetails')
            .valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
            )
            .subscribe(changes => {
                this.updateHeightWeight(changes);
            });

        this.freightPayment.valueChanges.subscribe(
            (c: string) => {
                if (!!c) {
                    if (c === "Prepaid") {
                        this.wtorValpayment.setValue(this.wts[0]);
                    } else if (c === "Collect") {
                        this.wtorValpayment.setValue(this.wts[1]);
                    } else {
                        this.wtorValpayment.setValue(this.wts[0]);
                    }
                }
            }
        );
        this.onWTVALChange();
        this.otherPaymentChange();
        this.onRateChargeChange();
        this.onChargeWeightChange();
        this.onSeaAirChange();
        this.onChangeAsArranged();

        this.hwbno.valueChanges
            .pipe(startWith(this.hwbno.value))
            .subscribe((hwbno: string) => {
                const etdDate = (this.etd !== null && this.etd.value !== null && this.etd.value.startDate !== null ? formatDate(this.etd.value.startDate, 'dd/MM/yyyy', 'en') : null);
                this._dataService.setData('formHBLData', { hblNo: hwbno, etd: etdDate, eta: null });
            });
        this.etd.valueChanges.pipe(startWith(this.etd.value)).subscribe((d: any) => {
            const etdDate = (d !== null && d.startDate !== null ? formatDate(d.startDate, 'dd/MM/yyyy', 'en') : null);
            this._dataService.setData('formHBLData', { hblNo: this.hwbno.value, etd: etdDate, eta: null });
        });
    }

    updateFormValue(data: HouseBill, isImport: boolean = false) {
        const formValue = {
            issueHbldate: !!data.issueHbldate ? { startDate: new Date(data.issueHbldate), endDate: new Date(data.issueHbldate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : new Date(),
            hwbno: !!data.hwbno ? data.hwbno : null,
            shipmenttype: data.shipmentType,
            hbltype: data.hbltype,
            freightPayment: data.freightPayment,
            originBlnumber: data.originBlnumber,
            wtorValpayment: data.wtorValpayment,
            otherPayment: data.otherPayment,
            currencyId: data.currencyId,
            flightNo: data.flightNo,
            rclass: data.rclass,

            dimensionDetails: []
        };
        if (isImport) {
            formValue.issueHbldate = { startDate: new Date(), endDate: new Date() };
        }
        this.formCreate.patchValue(_merge(_cloneDeep(data), formValue));

        this.totalHeightWeight = data.hw;

        this._catalogueRepo.getListSalemanByPartner(data.customerId, ChargeConstants.AE_CODE)
            .subscribe((salesmans: any) => {
                this.saleMans = salesmans;
            });
    }

    setDimensionDetails(dims: DIM[]): FormArray {
        const formArray: FormArray = new FormArray([]);
        dims.forEach((d: DIM) => {
            formArray.push(this._fb.group(d));
        });
        return formArray;
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this._toast.clear();
                this.customerId.setValue(data.id);
                if (!this.shipperId.value) {
                    this.shipperId.setValue(data.id);
                    this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }
                this._catalogueRepo.getListSalemanByPartner(data.id, ChargeConstants.AE_CODE)
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
                this.customerName = data.shortName;
                this.shipperId.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'consignee':
                this.consigneeId.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'agent':
                this.forwardingAgentId.setValue(data.id);
                this.forwardingAgentDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                this.handingInformation.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));

                break;
            case 'sale':
                this.saleManId.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
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

    createDIMItem(): FormGroup {
        return this._fb.group(new DIM({
            height: [null, Validators.min(0)],
            width: [null, Validators.min(0)],
            length: [null, Validators.min(0)],
            package: [null, Validators.min(0)],
            hblId: [this.hblId],
        }));
    }

    addDIM() {
        this.selectedIndexDIM = -1;
        (this.formCreate.controls.dimensionDetails as FormArray).push(this.createDIMItem());
    }

    deleteDIM(index: number) {
        (this.formCreate.get('dimensionDetails') as FormArray).removeAt(index);
        this.calculateHWDimension(this.formCreate.get('dimensionDetails').value || []);
    }

    selectDIM(index: number) {
        this.selectedIndexDIM = index;
    }

    updateHeightWeight(dims: DIM[] = []) {
        if (!!dims.length) {
            dims.forEach(dimItem => {
                dimItem.hw = this.utility.calculateHeightWeight(dimItem.width || 0, dimItem.height || 0, dimItem.length || 0, dimItem.package || 0, this.hwconstant || 6000);
                dimItem.cbm = this.utility.calculateCBM(dimItem.width || 0, dimItem.height || 0, dimItem.length || 0, dimItem.package || 0, this.hwconstant || 6000);
            });
            // this.totalHeightWeight = this.updateTotalHeightWeight(dims);
            this.totalCBM = this.updateCBM(dims);
        }
    }

    calculateHWDimension(dims: DIM[]) {
        if (!!dims.length) {
            this.updateHeightWeight(dims);
        } else {
            this.totalCBM = this.totalHeightWeight = 0;
        }
    }

    updateTotalHeightWeight(dims: DIM[]) {
        return +dims.reduce((acc: number, curr: DIM) => acc += curr.hw, 0).toFixed(3);
    }

    updateCBM(dims: DIM[]) {
        return +dims.reduce((acc: number, curr: DIM) => acc += curr.cbm, 0).toFixed(3);
    }

    onWTVALChange() {
        this.wtorValpayment.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: string) => {
                    if (!!value) {
                        switch (value) {
                            case 'PP':
                                if (!this.formCreate.controls["wtpp"].value) {
                                    this.formCreate.controls["wtpp"].setValue(this.AA);
                                    this.formCreate.controls["wtcll"].setValue(null);

                                    this.formCreate.controls["totalPp"].setValue(this.AA);
                                    this.formCreate.controls["totalCll"].setValue(null);

                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["wtcll"].value) {
                                    this.formCreate.controls["wtcll"].setValue(this.AA);
                                    this.formCreate.controls["wtpp"].setValue(null);

                                    this.formCreate.controls["totalCll"].setValue(this.AA);
                                    this.formCreate.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {

                        this.formCreate.controls["wtpp"].setValue(null);
                        this.formCreate.controls["wtcll"].setValue(null);
                    }
                }
            );
    }

    otherPaymentChange() {
        this.otherPayment.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: string) => {
                    if (!!value) {
                        switch (value) {
                            case 'PP':
                                if (!this.formCreate.controls["dueAgentPp"].value) {
                                    this.formCreate.controls["dueAgentPp"].setValue(this.AA);
                                    this.formCreate.controls["dueAgentCll"].setValue(null);

                                    this.formCreate.controls["totalPp"].setValue(this.AA);
                                    this.formCreate.controls["totalCll"].setValue(null);
                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["dueAgentCll"].value) {
                                    this.formCreate.controls["dueAgentCll"].setValue(this.AA);
                                    this.formCreate.controls["dueAgentPp"].setValue(null);

                                    this.formCreate.controls["totalCll"].setValue(this.AA);
                                    this.formCreate.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {
                        this.formCreate.controls["dueAgentPp"].setValue(null);
                        this.formCreate.controls["dueAgentCll"].setValue(null);
                    }
                }
            );
    }

    onRateChargeChange() {
        this.formCreate.controls['rateCharge'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    if (this.formCreate.controls["rateCharge"].value == Number(this.formCreate.controls["rateCharge"].value)) {
                        this.formCreate.controls['total'].setValue(value * this.formCreate.controls['chargeWeight'].value - this.formCreate.controls['seaAir'].value);
                    }
                }
            );
    }

    onChargeWeightChange() {
        this.formCreate.controls['chargeWeight'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    if (this.formCreate.controls["rateCharge"].value == Number(this.formCreate.controls["rateCharge"].value)) {
                        this.formCreate.controls['total'].setValue(value * this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
                    }
                });

    }

    onSeaAirChange() {
        this.formCreate.controls['seaAir'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    if (!this.formCreate.controls['min'].value) {
                        this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value * this.formCreate.controls['chargeWeight'].value - value);
                    } else {
                        this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
                    }
                });

    }

    onChangeAsArranged() {
        this.formCreate.controls['asArranged'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe), startWith(this.asArranged.value))
            .subscribe((value: boolean) => {
                if (value) {
                    this.formCreate.controls['rateCharge'].setValue(null);
                    this.rateCharge.disable();
                    this.formCreate.controls['total'].setValue('As Arranged');
                } else {
                    if (this.isUpdate) {
                        this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value * this.formCreate.controls['chargeWeight'].value - this.formCreate.controls['seaAir'].value);
                    }
                    this.rateCharge.enable();
                }
            });
    }

    onChangeMin(value: any) {
        if (value.target.checked) {
            this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
        } else {
            this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value * this.formCreate.controls['chargeWeight'].value - this.formCreate.controls['seaAir'].value);
        }
    }

    showOtherChargePopup() {
        if (!this.isUpdate && !this.isUpdateOtherCharge) {
            this._store.dispatch(new InitShipmentOtherChargeAction([new CsOtherCharge(), new CsOtherCharge(), new CsOtherCharge()]));  // * default = 3
        }
        this.otherChargePopup.show();
    }

    updateOtherCharge(data: { charges: CsOtherCharge[], totalAmountAgent: number, totalAmountCarrier: number }) {

        this.isUpdateOtherCharge = true;
        let text: string = '';
        data.charges.forEach((i: CsOtherCharge) => {
            text += `${i.chargeName}: ${formatCurrency(i.amount, 'en', '')} \n`;
        });

        this.formCreate.controls["otherCharge"].setValue(text);
        this.otherCharges = data.charges;
    }

}
