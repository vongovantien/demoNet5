import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { Store } from '@ngrx/store';
import { IAppState, getCataloguePortState, GetCataloguePortAction } from '@store';
import { getTransactionLocked, getTransactionPermission, GetShipmentOtherChargeSuccessAction, GetDimensionSuccessAction } from '@share-bussiness';
import { FormGroup, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { CommonEnum } from '@enums';
import { CatalogueRepo, DocumentationRepo, ExportRepo } from '@repositories';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Customer, PortIndex, Warehouse, DIM, CsOtherCharge, AirwayBill, CsTransaction, Currency } from '@models';
import { formatDate, formatCurrency } from '@angular/common';
import { InfoPopupComponent, ReportPreviewComponent, } from '@common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { ShareAirExportOtherChargePopupComponent, IDataOtherCharge } from '../../share/other-charge/air-export-other-charge.popup';
import { JobConstants, RoutingConstants, SystemConstants } from '@constants';

import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { Observable, of, merge } from 'rxjs';
import { map, takeUntil, catchError, finalize, switchMap, concatMap, distinctUntilChanged } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { ShareAirServiceDIMVolumePopupComponent } from '../../../share-air/components/dim/dim-volume.popup';
import { HttpResponse, HttpResponseBase } from '@angular/common/http';

@Component({
    selector: 'app-air-export-mawb',
    templateUrl: './air-export-mawb.component.html',
    styleUrls: ['./air-export-mawb.component.scss']
})

export class AirExportMAWBFormComponent extends AppForm implements OnInit {
    @ViewChild(ShareAirServiceDIMVolumePopupComponent) dimVolumePopup: ShareAirServiceDIMVolumePopupComponent;
    @ViewChild(ShareAirExportOtherChargePopupComponent) otherChargePopup: ShareAirExportOtherChargePopupComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ReportPreviewComponent) reportPopup: ReportPreviewComponent;

    formMAWB: FormGroup;

    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    forwardingAgentId: AbstractControl;
    eta: AbstractControl;
    etd: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    flightDate: AbstractControl;
    freightPayment: AbstractControl;
    currencyId: AbstractControl;
    wtorValpayment: AbstractControl;
    otherPayment: AbstractControl;
    originBlnumber: AbstractControl;
    issuedDate: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    forwardingAgentDescription: AbstractControl;
    hwbno: AbstractControl;
    mawb: AbstractControl;
    issuedPlace: AbstractControl;
    warehouseId: AbstractControl;
    mblno1: AbstractControl;
    mblno2: AbstractControl;
    mblno3: AbstractControl;
    rclass: AbstractControl;
    wtpp: AbstractControl;
    wtcll: AbstractControl;
    total: AbstractControl; // * TOTAL WITH C.W * RATE - SEAAIR OR EQUAL ASARRANGE.
    dueAgentPp: AbstractControl;
    dueAgentCll: AbstractControl;
    dueCarrierPp: AbstractControl;
    dueCarrierCll: AbstractControl;
    totalPp: AbstractControl;
    totalCll: AbstractControl;
    rateCharge: AbstractControl;
    chargeWeight: AbstractControl;
    seaAir: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;
    displayFieldWarehouse: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;

    termTypes: string[] = ['Collect', 'Prepaid', 'Sea - Air Difference'];

    wts: string[] = JobConstants.COMMON_DATA.WT;
    numberOBLs: CommonInterface.INg2Select[] = JobConstants.COMMON_DATA.BLNUMBERS;
    rClasses: string[] = JobConstants.COMMON_DATA.RCLASS;

    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    currencies: Observable<Currency>;
    warehouses: Observable<Warehouse[]>;

    dimensionDetails: DIM[] = [];
    otherCharges: CsOtherCharge[] = [];
    otherChargedata: IDataOtherCharge = {
        charges: [],
        totalAmountAgent: null,
        totalAmountCarrier: null
    };

    isLoadingPort: any;
    isUpdateDIM: boolean = false;
    isUpdateOtherCharge: boolean = false;
    isUpdate: boolean = false;

    selectedPrepaid: boolean = false;
    selectedCollect: boolean = false;

    AA: string = 'As Arranged';
    totalHW: number = 0;
    totalCbm: number = 0;

    jobId: string = '';
    airwaybillId: string = '';

    constructor(
        private _store: Store<IAppState>,
        private _catalogueRepo: CatalogueRepo,
        private _fb: FormBuilder,
        private _activedRoute: ActivatedRoute,
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _exportRepo: ExportRepo
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.isLocked = this._store.select(getTransactionLocked);
        this.permissionShipments = this._store.select(getTransactionPermission);
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
        this.initForm();

        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER, CommonEnum.PartnerGroupEnum.AGENT]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);
        this.ports = this._store.select(getCataloguePortState);
        this.warehouses = this._catalogueRepo.getPlace({ active: true, placeType: CommonEnum.PlaceTypeEnum.Warehouse });
        this.currencies = this._catalogueRepo.getCurrencyBy({ active: true });

        this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((params: Params) => {
                    if (params.jobId && isUUID(params.jobId)) {
                        this.jobId = params.jobId;
                        return this.jobId;
                    }
                    return new Error("Not found jobId");
                }),
                switchMap((jobId: string) => {
                    return this._documentationRepo.getAirwayBill(this.jobId);
                }),
                concatMap((csAirwayBill: AirwayBill) => {
                    if (!csAirwayBill) {
                        return this._documentationRepo.getDetailTransaction(this.jobId);
                    }
                    return of(csAirwayBill);

                }),
                map((data: AirwayBill | CsTransaction | any) => {
                    if (data.hasOwnProperty("mblno1")) {
                        console.log("update csAirwaybill");

                        this.isShowUpdate = true;
                        this.airwaybillId = data.id;
                        this.isUpdate = true;
                        this.otherCharges = data.otherCharges;
                        this.dimensionDetails = data.dimensionDetails;
                        this.totalCbm = data.cbm;
                        this.totalHW = data.hw;
                        this.dimVolumePopup.jobId = data.jobId;

                        this._store.dispatch(new GetShipmentOtherChargeSuccessAction(this.otherCharges));
                        this._store.dispatch(new GetDimensionSuccessAction(this.dimensionDetails));

                        this.updateFormValue(data);
                        return data;
                    } else {
                        console.log("created csAirwaybill");

                        this.isUpdate = false;
                        this.formMAWB.patchValue({
                            pod: data.pod,
                            pol: data.pol,
                            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
                            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
                            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : null,
                            flightNo: data.flightVesselName,
                            freightPayment: data.paymentTerm,
                            route: data.route,
                            warehouseId: data.warehouseId,
                            issuedBy: data.issuedBy,
                            mblno1: !!data.mawb ? data.mawb.slice(0, 3) : null,
                            mblno2: data.polCode,
                            mblno3: !!data.mawb ? data.mawb.slice(-8) : null,
                            rclass: 'Q',
                            consigneeId: data.agentId,
                            consigneeDescription: this.setDefaultAgentData(data),
                            shipperDescription: this.setDefaultShipperWithOffice(data),
                            firstCarrierBy: data.supplierName,
                            wtorValpayment: this.setDefaultWTVal(data),
                            otherPayment: this.setDefaultWTVal(data),
                            kgIb: 'K',
                            handingInformation: this.setDefaultHandlingInformation(data)
                        });
                    }
                    return data;
                }
                )
            )
            .subscribe(
                (res: AirwayBill) => {
                    this.handleObserver();
                },
                (err) => {
                    this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}`]);
                });
    }

    setDefaultShipperWithOffice(shipment: CsTransaction) {
        if (!!shipment.creatorOffice) {
            return this.getDescription(shipment.creatorOffice.nameEn, shipment.creatorOffice.addressEn, shipment.creatorOffice.tel, shipment.creatorOffice.fax, shipment.creatorOffice.email);
        }
        return null;
    }

    setDefaultWTVal(shipment: CsTransaction) {
        if (shipment.paymentTerm) {
            if (shipment.paymentTerm === 'Prepaid') {
                return this.wts[0];
            }
            return this.wts[1];
        }
        return this.wts[0];

    }

    setDefaultAgentData(shipment: CsTransaction) {
        if (!!shipment.agentData) {
            return this.getDescription(shipment.agentData.nameEn, shipment.agentData.address, shipment.agentData.tel, shipment.agentData.fax);
        }
        return null;
    }

    setDefaultHandlingInformation(shipment: CsTransaction) {
        if ((shipment.mawb || "").substring(0, 3) === "235") {
            return JobConstants.DEFAULT_HANDLING_TURKISH_CARGO;
        }
        return null;
    }

    updateFormValue(data: AirwayBill) {
        const formValue = {
            issuedDate: !!data.issuedDate ? { startDate: new Date(data.issuedDate), endDate: new Date(data.issuedDate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : null,
            dimensionDetails: [],


            total: data.total != null ? parseFloat('' + data.total).toFixed(2) : null

        };
        this.formMAWB.patchValue(_merge(_cloneDeep(data), formValue));
    }

    initForm() {
        this.formMAWB = this._fb.group({
            mblno1: [null, Validators.required],
            mblno2: [null, Validators.required],
            mblno3: [null, Validators.required],
            consigneeDescription: [],
            shipperDescription: [],
            forwardingAgentDescription: [],
            pickupPlace: [],
            firstCarrierBy: [],
            firstCarrierTo: [],
            transitPlaceTo1: [],
            transitPlaceBy1: [],
            transitPlaceTo2: [],
            transitPlaceBy2: [],
            flightNo: [],
            issuranceAmount: ['NIL'],
            chgs: [],
            dclrca: ['NVD'],
            dclrcus: ['NCV'],
            handingInformation: [],
            notify: [],
            issuedPlace: [],
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
            issuedBy: [{ value: null }],
            sci: [],
            currConvertRate: [],
            ccchargeInDrc: [],
            desOfGoods: ['CONSOLIDATED CARGO AS PER ATTACHED MANIFEST'],
            otherCharge: [],
            packageQty: [],
            grossWeight: [],
            kgIb: [],
            rclass: [],
            // comItemNo: [],
            chargeWeight: [],
            rateCharge: [],
            total: [{ value: null, disabled: true }],
            seaAir: [],
            route: [],
            min: [false],
            showDim: [true],
            volumeField: [],

            // * Combogrid

            shipperId: [],
            consigneeId: [],
            forwardingAgentId: [],
            pol: [],
            pod: [],
            warehouseId: [],

            // * Select
            freightPayment: [],
            currencyId: ['USD'],
            originBlnumber: [],
            wtorValpayment: [],
            otherPayment: [],

            // * Date
            etd: [],
            eta: [],
            flightDate: [],
            issuedDate: [{ startDate: new Date(), endDate: new Date() }],
        });

        this.mblno1 = this.formMAWB.controls["mblno1"];
        this.mblno2 = this.formMAWB.controls["mblno2"];
        this.mblno3 = this.formMAWB.controls["mblno3"];
        this.shipperDescription = this.formMAWB.controls["shipperDescription"];
        this.consigneeDescription = this.formMAWB.controls["consigneeDescription"];
        this.forwardingAgentDescription = this.formMAWB.controls["forwardingAgentDescription"];
        this.shipperId = this.formMAWB.controls["shipperId"];
        this.consigneeId = this.formMAWB.controls["consigneeId"];
        this.forwardingAgentId = this.formMAWB.controls["forwardingAgentId"];
        this.eta = this.formMAWB.controls["eta"];
        this.etd = this.formMAWB.controls["etd"];
        this.pol = this.formMAWB.controls["pol"];
        this.pod = this.formMAWB.controls["pod"];
        this.warehouseId = this.formMAWB.controls["warehouseId"];
        this.freightPayment = this.formMAWB.controls["freightPayment"];
        this.currencyId = this.formMAWB.controls["currencyId"];
        this.originBlnumber = this.formMAWB.controls["originBlnumber"];
        this.wtorValpayment = this.formMAWB.controls["wtorValpayment"];
        this.otherPayment = this.formMAWB.controls["otherPayment"];
        this.etd = this.formMAWB.controls["etd"];
        this.eta = this.formMAWB.controls["eta"];
        this.flightDate = this.formMAWB.controls["flightDate"];
        this.issuedDate = this.formMAWB.controls["issuedDate"];
        this.rclass = this.formMAWB.controls["rclass"];

        this.wtpp = this.formMAWB.controls["wtpp"];
        this.wtcll = this.formMAWB.controls["wtcll"];
        this.total = this.formMAWB.controls["total"];

        this.dueAgentPp = this.formMAWB.controls["dueAgentPp"];
        this.dueAgentCll = this.formMAWB.controls["dueAgentCll"];
        this.dueCarrierPp = this.formMAWB.controls["dueCarrierPp"];
        this.dueCarrierCll = this.formMAWB.controls["dueCarrierCll"];

        this.totalPp = this.formMAWB.controls["totalPp"];
        this.totalCll = this.formMAWB.controls["totalCll"];

        this.rateCharge = this.formMAWB.controls["rateCharge"];
        this.chargeWeight = this.formMAWB.controls["chargeWeight"];
        this.seaAir = this.formMAWB.controls["seaAir"];

        const formControlValueChanges = Object.keys(this.formMAWB.value).map((key) =>
            this.formMAWB.get(key).valueChanges.pipe(map((value) => ({ key, value })))
        );
        merge(...formControlValueChanges).pipe(
            distinctUntilChanged(),
            takeUntil(this.ngUnsubscribe)
        )
            .subscribe(({ key, value }) => {
                if (key === 'rateCharge') {
                    if (this.total.value !== this.AA) {
                        this.total.setValue(this.updateTotalAmount(value, this.chargeWeight.value, this.seaAir.value, this.formMAWB.controls['min'].value));
                        this.updateWtWithTotal(this.total.value);
                    }
                }
                if (key === 'chargeWeight') {
                    if (this.total.value !== this.AA) {
                        this.total.setValue(this.updateTotalAmount(this.rateCharge.value, value, this.seaAir.value, this.formMAWB.controls['min'].value));
                        this.updateWtWithTotal(this.total.value);
                    }
                }
                if (key === 'seaAir') {
                    if (this.total.value !== this.AA) {
                        if (!this.formMAWB.controls['min'].value) {
                            this.total.setValue(this.updateTotalAmount(this.rateCharge.value, this.chargeWeight.value, value));
                            this.updateWtWithTotal(this.total.value);
                        } else {
                            this.total.setValue(this.updateTotalAmount(this.rateCharge.value, this.chargeWeight.value, value, this.formMAWB.controls['min'].value));
                            this.updateWtWithTotal(this.total.value);
                        }
                    }
                }

                if (key === 'wtorValpayment') {
                    if (!!value) {
                        switch (value) {
                            case 'PP':
                                if (!this.wtpp.value) {
                                    this.updateWtWithTotal(this.total.value);
                                    this.wtcll.setValue(null);
                                }
                                break;
                            case 'CLL':
                                if (!this.wtcll.value) {
                                    this.updateWtWithTotal(this.total.value);
                                    this.wtpp.setValue(null);
                                }
                                break;
                        }
                        this.updateTotalPrepaidCollect();

                    } else {
                        this.wtpp.setValue(null);
                        this.wtcll.setValue(null);
                    }
                }
                if (key === 'otherPayment') {
                    if (!!value) {
                        switch (value) {
                            case 'PP':
                                this.updateDueAgentCarrierWithTotalAgent(this.dueAgentCll.value, this.dueCarrierCll.value);
                                break;
                            case 'CLL':
                                this.updateDueAgentCarrierWithTotalAgent(this.dueAgentPp.value, this.dueCarrierPp.value);
                                break;
                        }
                        this.updateTotalPrepaidCollect();

                    } else {
                        this.dueAgentPp.setValue(null);
                        this.dueAgentCll.setValue(null);
                    }
                }
                if (key === 'etd') {
                    if (!!value.startDate) {
                        this.flightDate.setValue(value);
                    }
                }
                if (key === 'freightPayment') {
                    if (!!value) {
                        if (value === "Prepaid") {
                            this.wtorValpayment.setValue([this.wts[0]]);
                        } else if (value === "Collect") {
                            this.wtorValpayment.setValue([this.wts[1]]);
                        } else {
                            this.wtorValpayment.setValue([this.wts[0]]);
                        }
                    }
                }
            });
    }

    getDataForm() {
        const form: any = this.formMAWB.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            issuedDate: !!form.issuedDate && !!form.issuedDate.startDate ? formatDate(form.issuedDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,

            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            forwardingAgentId: form.forwardingAgent,

            cbm: this.totalCbm,
            hw: this.totalHW,
            min: form.min,
        };

        const houseBill = new AirwayBill(_merge(form, formData));
        return houseBill;
    }

    checkValidateForm() {
        let valid: boolean = true;

        if (!this.formMAWB.valid
            || (!!this.etd.value && !this.etd.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }

    onSaveMAWB() {
        this.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const airwaybill: AirwayBill = this.getDataForm();
        airwaybill.jobId = this.jobId;

        airwaybill.otherCharges = this.otherCharges;
        airwaybill.otherCharges.forEach((c: CsOtherCharge) => {
            c.jobId = this.jobId;
            c.hblId = SystemConstants.EMPTY_GUID;
        });

        const dims: DIM[] = _cloneDeep(this.dimensionDetails);
        dims.forEach((d: DIM) => {
            d.airWayBillId = this.airwaybillId || SystemConstants.EMPTY_GUID;
            d.mblid = SystemConstants.EMPTY_GUID;
        });

        airwaybill.dimensionDetails = dims;

        if (!!this.isUpdate) {
            this.saveMAWB(airwaybill);
        } else {
            this.createMAWB(airwaybill);
        }

    }

    saveMAWB(body: AirwayBill) {
        body.id = this.airwaybillId;

        this._progressRef.start();
        this._documentationRepo.updateAirwayBill(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
                concatMap(() => this._documentationRepo.syncShipmentByAirWayBill(this.jobId, this.getSyncMAWBShipmentModel()))
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    getSyncMAWBShipmentModel() {
        const airwaybill: AirwayBill = this.getDataForm();

        // * Update mblId;
        const dims: DIM[] = _cloneDeep(this.dimensionDetails);
        dims.forEach((d: DIM) => {
            d.airWayBillId = SystemConstants.EMPTY_GUID;
            d.mblid = this.jobId;
            d.hblid = SystemConstants.EMPTY_GUID;
            d.id = SystemConstants.EMPTY_GUID;
        });
        airwaybill.dimensionDetails = dims;

        return <ISyncMAWBShipment>{
            pol: airwaybill.pol,
            pod: airwaybill.pod,
            etd: airwaybill.etd,
            eta: airwaybill.eta,
            flightDate: airwaybill.flightDate,
            flightNo: airwaybill.flightNo,
            warehouseId: airwaybill.warehouseId,
            chargeWeight: airwaybill.chargeWeight,
            grossWeight: airwaybill.grossWeight,
            dimensionDetails: airwaybill.dimensionDetails,
            issuedBy: airwaybill.issuedBy,
            hw: airwaybill.hw,
            cbm: this.totalCbm,
            packageQty: airwaybill.packageQty,
            mawb: (airwaybill.mblno1 as string).substring(0, 3) + '-' + airwaybill.mblno3
        };
    }

    createMAWB(body: AirwayBill) {
        body.id = SystemConstants.EMPTY_GUID;

        this._progressRef.start();
        this._documentationRepo.createAirwayBill(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
                concatMap(() => this._documentationRepo.syncShipmentByAirWayBill(this.jobId, this.getSyncMAWBShipmentModel()))
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.isShowUpdate = true;
                        this._toastService.success(res.message, '');
                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    onSelectDataFormInfo(data, key: string) {
        switch (key) {
            case 'shipper':
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
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'warehouse':
                this.warehouseId.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getDescription(fullName: string, address: string, tel: string, fax: string, email?: string) {
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
        if (!!email) {
            strDescription = strDescription + "\nEmail:" + email;
        }
        return strDescription;
    }

    onChangeMin(value: Event) {
        if (this.total.value !== this.AA) {
            if ((value.target as HTMLInputElement).checked) {
                this.total.setValue(this.updateTotalAmount(this.rateCharge.value, this.chargeWeight.value, this.seaAir.value, true));
                this.updateWtWithTotal(this.total.value);

            } else {
                this.total.setValue(this.updateTotalAmount(this.rateCharge.value, this.chargeWeight.value, this.seaAir.value));
                this.updateWtWithTotal(this.total.value);
            }
        }
    }

    onChangeAsArranged(value: Event) {
        if ((value.target as HTMLInputElement).checked) {
            this.total.setValue(this.AA);
            this.rateCharge.disable();

            this.updateWtWithTotal(this.AA);
        } else {
            this.resetFormControl(this.total);
            this.rateCharge.enable();

            if (!this.formMAWB.controls['min'].value) {
                this.total.setValue(this.rateCharge.value * this.chargeWeight.value - this.seaAir.value);
            } else {
                this.total.setValue(this.rateCharge.value - this.seaAir.value);
            }
            this.updateWtWithTotal(this.total.value);
        }
    }

    updateWtWithTotal(totalValue: any) {
        if (!!this.wtorValpayment.value) {
            if (this.wtorValpayment.value === 'PP') {
                this.resetFormControl(this.wtcll);
                this.wtpp.setValue(totalValue);
            }
            if (this.wtorValpayment.value === 'CLL') {
                this.resetFormControl(this.wtpp);
                this.wtcll.setValue(totalValue);
            }
        }
        this.updateTotalPrepaidCollect();

    }

    updateDueAgentCarrierWithTotalAgent(totalAgent: number = null, totalCarrier: number = null) {
        if (!!this.otherPayment.value) {
            if (this.otherPayment.value === 'PP') {
                this.resetFormControl(this.dueAgentCll);
                this.resetFormControl(this.dueCarrierCll);

                this.dueAgentPp.setValue(totalAgent);
                this.dueCarrierPp.setValue(totalCarrier);
            }
            if (this.otherPayment.value === 'CLL') {
                this.resetFormControl(this.dueAgentPp);
                this.resetFormControl(this.dueCarrierPp);

                this.dueAgentCll.setValue(totalAgent);
                this.dueCarrierCll.setValue(totalCarrier);
            }
        }
    }

    updateTotalPrepaidCollect() {
        if (typeof +(this.wtpp.value) !== 'number'
            || typeof +(this.dueAgentPp.value) !== 'number'
            || typeof +(this.dueCarrierPp.value) !== 'number') {
            this.totalPp.setValue(this.AA);
        } else {
            const total: number = +this.wtpp.value + +(this.dueAgentPp.value) + +(this.dueCarrierPp.value);
            if (isNaN(total)) {
                this.totalPp.setValue(this.AA);
            } else {
                this.totalPp.setValue(total);
            }
        }

        if (typeof +(this.wtcll.value) !== 'number'
            || typeof +(this.dueCarrierCll.value) !== 'number'
            || typeof +(this.dueCarrierCll.value) !== 'number') {
            this.totalCll.setValue(this.AA);
        } else {
            const total: number = +this.wtcll.value + +(this.dueAgentCll.value) + +(this.dueCarrierCll.value);
            if (isNaN(total)) {
                this.totalCll.setValue(this.AA);
            } else {
                this.totalCll.setValue(total);
            }
        }
    }

    updateTotalAmount(rc: number = 0, cw: number = 0, se: number = 0, isTickMin: boolean = false) {
        let total: number = 0;
        if (isTickMin) {
            total = rc - se;
        } else {
            total = rc * cw - se;
        }

        return total.toFixed(2);
    }

    showOtherChargePopup() {
        this.otherChargePopup.show();
    }

    showVolumePopup() {
        this.dimVolumePopup.show();
    }

    onUpdateDIM(dims: DIM[]) {
        this.isUpdateDIM = true;
        this.dimensionDetails = dims;
        let volumText: string = '';

        if (!!this.dimensionDetails.length) {
            this.totalHW = this.dimensionDetails.reduce((acc: number, item: DIM) => acc += item.hw, 0);
            this.totalCbm = this.dimensionDetails.reduce((acc: number, item: DIM) => acc += item.cbm, 0);
        }

        this.dimensionDetails.forEach(v => {
            volumText += `${v.length}x${v.width}x${v.height}/${v.package}\n`;
        });


        this.formMAWB.controls["volumeField"].setValue(volumText);
    }

    updateOtherCharge(data: { charges: CsOtherCharge[], totalAmountAgent: number, totalAmountCarrier: number }) {
        this.otherChargedata = data;
        this.isUpdateOtherCharge = true;

        // * UPDATE OTHER CHARGE TEXTAREAR.
        let text: string = '';
        this.otherChargedata.charges.forEach((i: CsOtherCharge) => {
            text += `${i.chargeName}: ${formatCurrency(i.amount, 'en', '')} \n`;
        });

        this.formMAWB.controls["otherCharge"].setValue(text);
        this.otherCharges = this.otherChargedata.charges;

        // * UPDATE DUE AGENT -	DUE CARRIER SECTION
        this.updateDueAgentCarrierWithTotalAgent(this.otherChargedata.totalAmountAgent, this.otherChargedata.totalAmountCarrier);
        this.updateTotalPrepaidCollect();

    }

    exportMawb() {
        this._progressRef.start();
        this._exportRepo.exportMawbAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportSCSC() {
        this._progressRef.start();
        this._exportRepo.exportSCSCAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportTCS() {
        this._progressRef.start();
        this._exportRepo.exportTCSAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportACS() {
        this._progressRef.start();
        this._exportRepo.exportACSAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportNCTSALS(){
        this._progressRef.start();
        this._exportRepo.exportNCTSALSAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    preview(reportType: string) {
        this._documentationRepo.previewAirwayBill(this.jobId, reportType)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport.dataSource.length > 0) {
                        setTimeout(() => {
                            this.reportPopup.frm.nativeElement.submit();
                            this.reportPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }
}
interface ISyncMAWBShipment {
    mawb: string;
    etd: string;
    eta: string;
    flightNo: string;
    flightDate: string;
    warehouseId: string;
    pol: string;
    pod: string;
    issuedBy: string;
    cbm: number;
    packageQty: number;

    hw: number;
    chargeWeight: number;
    grossWeight: number;

    dimensionDetails: DIM[];
}
