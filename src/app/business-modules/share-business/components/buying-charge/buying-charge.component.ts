import { Component, ViewChild, Input, ViewContainerRef, ViewChildren, QueryList, ComponentRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { CatalogueRepo, DocumentationRepo, AccountingRepo } from '@repositories';
import { Charge, Unit, CsShipmentSurcharge, Currency, Partner, HouseBill, CsTransaction, CatPartnerCharge, Container, OpsTransaction, ChargeGroup, CsTransactionDetail } from '@models';
import { AppList } from 'src/app/app.list';
import { SortService } from '@services';
import { SystemConstants } from '@constants';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { GetBuyingSurchargeAction, GetOBHSurchargeAction, GetSellingSurchargeAction } from './../../store';
import { CommonEnum } from '@enums';

import { Observable } from 'rxjs';
import { catchError, takeUntil, finalize, skip, map, shareReplay } from 'rxjs/operators';

import * as fromStore from './../../store';

import { getCatalogueCurrencyState, GetCatalogueCurrencyAction, getCatalogueUnitState, GetCatalogueUnitAction } from '@store';
import { ChargeConstants } from 'src/constants/charge.const';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppComboGridComponent } from '@common';
import { ActivatedRoute } from '@angular/router';
import { ContextMenuDirective, InjectViewContainerRefDirective } from '@directives';

@Component({
    selector: 'buying-charge',
    templateUrl: './buying-charge.component.html',
    styleUrls: ['./buying-charge.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareBussinessBuyingChargeComponent extends AppList {
    @ViewChild(InjectViewContainerRefDirective) viewContainer: InjectViewContainerRefDirective;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild('confirmCancelPopup') confirmCancelPopup: ConfirmPopupComponent;

    @Input() service: CommonType.SERVICE_TYPE = 'sea';
    @Input() showSyncOtherCharge: boolean = false; // * show/hide sync other charge in getCharge button.
    @Input() showGetCharge: boolean = true; // * show/hide getCharge button
    @Input() allowSaving: boolean = true; // * not allow to save or add Charges without saving the job
    @Input() showGetChargeStandart: boolean = true; // * show/hide getCharge standart button
    @ViewChildren('container', { read: ViewContainerRef }) public widgetTargets: QueryList<ViewContainerRef>;
    @ViewChildren('containerCharge', { read: ViewContainerRef }) public chargeContainerRef: QueryList<ViewContainerRef>;
    @ViewChildren(ContextMenuDirective) queryListMenuContext: QueryList<ContextMenuDirective>;
    @ViewChild('detailLinkFeePopup') detailLinkFeePopup: InfoPopupComponent;

    serviceTypeId: string;
    containers: Container[] = [];
    shipmentContainers: Container[] = [];

    shipment: CsTransaction | OpsTransaction | any;
    hbl: HouseBill;

    headers: CommonInterface.IHeaderTable[] = [];
    headerPartner: CommonInterface.IHeaderTable[] = [];
    charges: CsShipmentSurcharge[] = new Array<CsShipmentSurcharge>();

    listCharges: Charge[];
    listCharges$: Observable<Charge[]>;
    listUnits: Unit[] = [];
    listCurrency: Observable<Currency[]>;
    listPartner: Partner[] = new Array<Partner>();
    listChargeGroup: Observable<ChargeGroup[]>;

    configComboGridCharge: Partial<CommonInterface.IComboGirdConfig> = {};

    quantityHints: CommonInterface.IValueDisplay[];
    selectedQuantityHint: CommonInterface.IValueDisplay = null;

    partnerType: CommonInterface.IValueDisplay[];

    TYPE: CommonEnum.SurchargeTypeEnum.BUYING_RATE = CommonEnum.SurchargeTypeEnum.BUYING_RATE;

    isSubmitted: boolean = false;

    selectedSurcharge: CsShipmentSurcharge;

    selectedIndexCharge: number = -1;
    spinnerpartner: string = 'spinner-partner';
    isShowLoadingPartner: boolean = false;
    selectedIndexFee: number;
    isSelectedChargeDynamicCombogrid: boolean = false;
    isSelectedPartnerDynamicCombogrid: boolean = false;
    userLogged: any;
    selectedCs: CsShipmentSurcharge;
    messageConfirmRevertLinkFee: string = "Do you want to Revert Fee these Jobs ?";

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _store: Store<fromStore.IShareBussinessState>,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _sortService: SortService,
        protected _ngProgressService: NgProgress,
        protected _spinner: NgxSpinnerService,
        protected _accountingRepo: AccountingRepo,
        protected _activedRoute: ActivatedRoute,
        protected _cd: ChangeDetectorRef

    ) {
        super();
        this.requestSort = this.sortSurcharge;
        this._progressRef = this._ngProgressService.ref();


        this.getSurcharge();

        this._activedRoute.data
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (dataParam: CommonInterface.IDataParam) => {
                    this.serviceTypeId = dataParam.serviceId;
                }
            );

        this.isLocked = this._store.select(fromStore.getTransactionLocked);
        this.permissionShipments = this._store.select(fromStore.getTransactionPermission);
    }

    getSurcharge() {
        this._store.select(fromStore.getBuyingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    this.charges.length = 0;
                    this.charges = [...buyings];
                    this._cd.markForCheck();
                }
            );
    }

    ngOnInit(): void {
        this.configHeader();
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.headerPartner = [
            { title: 'Name Abbr', field: 'shortName' },
            { title: 'Name', field: 'partnerNameEn' },
            { title: 'Partner Code', field: 'taxCode' },
        ];

        this.configComboGridCharge = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unit', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });

        this.quantityHints = [
            { displayName: 'G.W', value: CommonEnum.QUANTITY_TYPE.GW },
            { displayName: 'C.W', value: CommonEnum.QUANTITY_TYPE.CW },
            { displayName: 'CBM', value: CommonEnum.QUANTITY_TYPE.CBM },
            { displayName: 'P.K', value: CommonEnum.QUANTITY_TYPE.PACKAGE },
            { displayName: 'Cont', value: CommonEnum.QUANTITY_TYPE.CONT },
            { displayName: 'N.W', value: CommonEnum.QUANTITY_TYPE.NW },
        ];

        this.partnerType = [
            { displayName: 'Customer', value: CommonEnum.PartnerGroupEnum.CUSTOMER, fieldName: 'CUSTOMER' },
            { displayName: 'Carrier', value: CommonEnum.PartnerGroupEnum.CARRIER, fieldName: 'CARRIER' },
            { displayName: 'Agent', value: CommonEnum.PartnerGroupEnum.AGENT, fieldName: 'AGENT' },
        ];

        this.getUnits();
        this.getCurrency();
        this.getDetailHBL();
        this.getPartner();
        this.getCharge();
        this.getShipmentContainer();
        this.getHBLContainer();
        this.getShipmentDetail();
        this.getChargeGroup();

    }

    configHeader() {
        this.headers = [
            { title: 'Partner Name', field: 'partnerShortName', required: true, sortable: true, width: 150 },
            { title: 'Charge Name', field: 'chargeId', required: true, sortable: true, width: 250 },
            { title: 'Quantity', field: 'quantity', required: true, sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', required: true, sortable: true },
            { title: 'Unit Price', field: 'unitPrice', required: true, sortable: true },
            { title: 'Currency', field: 'currencyId', required: true, sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total', field: 'total', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Series No', field: 'seriesNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'VAT Partner', field: 'vatPartnerId', sortable: true },
            { title: 'Fee Type', field: 'chargeGroup', sortable: true },
            { title: 'Exchange Rate Date', field: 'exchangeDate', sortable: true },
            { title: 'Final Exchange Rate', field: 'finalExchangeRate', sortable: true },
            { title: 'KB', field: 'kickBack', sortable: true },
            { title: 'SOA', field: 'soano', sortable: true },
            { title: 'Credit Note', field: 'cdno', sortable: true },
            { title: 'Settle Payment', field: 'settlementCode', sortable: true },
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Voucher ID Date', field: 'voucherIddate', sortable: true },
            { title: 'Net Amount', field: 'netAmount', sortable: true },
        ];
    }

    getUnits() {
        this._store.dispatch(new GetCatalogueUnitAction());

        this._store.select(getCatalogueUnitState)
            .pipe(catchError(this.catchError))
            .subscribe(
                (units: Unit[]) => {
                    this.listUnits = units;
                }
            );
    }

    getChargeGroup() {
        this.listChargeGroup = this._catalogueRepo.getChargeGroup().pipe(shareReplay());
    }

    getCurrency() {
        this._store.dispatch(new GetCatalogueCurrencyAction());
        this.listCurrency = this._store.select(getCatalogueCurrencyState);
    }

    getPartner() {
        this.isShowLoadingPartner = true;
        this._spinner.show(this.spinnerpartner);

        this._catalogueRepo.getListPartner(null, null, { active: true })
            .pipe(
                shareReplay(),
                catchError(this.catchError), finalize(() => {
                    this._spinner.hide(this.spinnerpartner);
                    this.isShowLoadingPartner = false;
                }))
            .subscribe(
                (partners: Partner[]) => {
                    this.listPartner = partners;
                }
            );

    }

    getShipmentContainer() {
        this._store.select(fromStore.getContainerSaveState)
            .pipe(catchError(this.catchError), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (containers: Container[]) => {
                    this.shipmentContainers = containers;
                }
            );
    }

    getHBLContainer() {
        this._store.select(fromStore.getHBLContainersState)
            .pipe(catchError(this.catchError), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (containers: Container[]) => {
                    this.containers = containers;
                }
            );
    }

    getShipmentDetail() {
        this._store.select(fromStore.getTransactionDetailCsTransactionState)
            .pipe(catchError(this.catchError), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (shipment: CsTransaction | OpsTransaction) => {
                    this.shipment = shipment;
                }
            );
    }

    getDetailHBL() {
        this._store.select(fromStore.getDetailHBlState)
            .pipe(catchError(this.catchError), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbl: any) => {
                    this.hbl = hbl;
                    console.log(this.hbl);
                }
            );
    }

    getCharge() {
        this.listCharges$ = this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceTypeId, type: CommonEnum.CHARGE_TYPE.CREDIT })
        // .subscribe(
        //     (charges: Charge[]) => {
        //         this.listCharges = charges;
        //     }
        // );
    }

    sortSurcharge() {
        this.charges = this._sortService.sort(this.charges, this.sort, this.order);
    }

    onSelectDataFormInfo(data: Charge | any, type: string, chargeItem: CsShipmentSurcharge) {
        switch (type) {
            case 'charge':
                chargeItem.duplicateCharge = false;
                chargeItem.chargeId = data.id;
                chargeItem.chargeCode = data.code;
                chargeItem.chargeNameEn = data.chargeNameEn;
                chargeItem.chargeGroup = data.chargeGroup;

                let charges = [];
                this.listChargeGroup.subscribe((res: ChargeGroup[]) => {
                    if (!!res) {
                        charges = res;
                        const chargeGrp = (charges || []).find(x => x.id === chargeItem.chargeGroup);
                        if (chargeGrp && chargeGrp.name === 'Com') {
                            chargeItem.kickBack = true;
                        } else {
                            chargeItem.kickBack = false;
                        }
                    }
                });


                // * Unit, Unit Price had value
                if (!chargeItem.unitId || chargeItem.unitPrice == null) {
                    chargeItem.unitId = this.listUnits.find((u: Unit) => u.id === data.unitId).id;
                    chargeItem.unitPrice = data.unitPrice;
                    this.onChangeDataUpdateTotal(chargeItem);
                }

                // * CR: 14583
                chargeItem.currencyId = data.currencyId || "VND";
                // * CR: 15473
                if (data.vatrate) {
                    chargeItem.vatrate = data.vatrate;
                    this.onChangeDataUpdateTotal(chargeItem);
                }
                break;
            case 'unit':
                chargeItem.unitId = data.id;
                break;
            case 'vat-partner':
                chargeItem.vatPartnerId = data.id;
                break;
            default:
                break;
        }
    }

    addCharge(type: CommonEnum.SurchargeTypeEnum | string) {
        this.isSubmitted = false;

        const newSurCharge: CsShipmentSurcharge = new CsShipmentSurcharge();
        newSurCharge.currencyId = "USD"; // * Set default.
        newSurCharge.exchangeDate = { startDate: new Date(), endDate: new Date() };
        newSurCharge.quantity = 1;
        newSurCharge.quantityType = null;
        newSurCharge.invoiceDate = null;
        newSurCharge.creditNo = null;
        newSurCharge.debitNo = null;
        newSurCharge.settlementCode = null;
        newSurCharge.voucherId = null;
        newSurCharge.voucherIddate = null;
        newSurCharge.voucherIdre = null;
        newSurCharge.voucherIdredate = null;
        newSurCharge.isFromShipment = true;
        newSurCharge.hblno = this.hbl.hwbno || null;
        newSurCharge.mblno = this.getMblNo(this.shipment, this.hbl);
        newSurCharge.jobNo = this.shipment.jobNo || null;
        newSurCharge.linkFee = false;
        newSurCharge.linkChargeId = null;
        newSurCharge.type = type;

        this.addSurcharges(type, newSurCharge);
    }

    duplicate(index: number, type: CommonEnum.SurchargeTypeEnum | string) {
        this.isSubmitted = false;

        const newCharge = this.charges[index];
        const newSurCharge: CsShipmentSurcharge = new CsShipmentSurcharge(newCharge);

        newSurCharge.id = SystemConstants.EMPTY_GUID;
        newSurCharge.creditNo = null;
        newSurCharge.debitNo = null;
        newSurCharge.settlementCode = null;
        newSurCharge.voucherId = null;
        newSurCharge.voucherIddate = null;
        newSurCharge.voucherIdre = null;
        newSurCharge.voucherIdredate = null;
        newSurCharge.isFromShipment = true;
        newSurCharge.soano = null;
        newSurCharge.paySoano = null;
        newSurCharge.finalExchangeRate = null;
        newSurCharge.acctManagementId = null;
        newSurCharge.syncedFrom = null;
        newSurCharge.paySyncFrom = null;

        if (type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
            newSurCharge.invoiceDate = null;
            newSurCharge.invoiceNo = null;
            newSurCharge.seriesNo = null;
        }

        newSurCharge.linkChargeId = null;
        newSurCharge.linkFee = null;

        this.addSurcharges(type, newSurCharge);
    }

    deleteCharge(charge: CsShipmentSurcharge, index: number, type: CommonEnum.SurchargeTypeEnum) {
        this.isSubmitted = false;
        this.selectedIndexCharge = index;

        if (charge.id === SystemConstants.EMPTY_GUID) {
            this.deleteChargeWithType(type, this.selectedIndexCharge);
        } else if (
            !!charge.soano
            || !!charge.creditNo
            || !!charge.debitNo
            || !!charge.settlementCode
            || !!charge.voucherId
            || !!charge.voucherIddate
            || !!charge.voucherIdre
        ) { return; } else {
            this.selectedSurcharge = new CsShipmentSurcharge(charge);
            this.confirmDeletePopup.show();
        }
    }

    onDeleteShipmentSurcharge(type: CommonEnum.SurchargeTypeEnum | string) {
        this.confirmDeletePopup.hide();

        if (!!this.selectedSurcharge && this.selectedSurcharge.id !== SystemConstants.EMPTY_GUID) {
            this._progressRef.start();
            const body = {
                Id: this.selectedSurcharge.id,
                partnerId: this.selectedSurcharge.paymentObjectId,
                office: (!!this.selectedSurcharge ? this.selectedSurcharge.officeId : this.userLogged.officeId),
                service: (!!this.selectedSurcharge.transactionType ? this.selectedSurcharge.transactionType : this.serviceTypeId),
            }
            this._documentRepo.deleteShipmentSurcharge(body)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            if (this.selectedIndexCharge > -1) {

                                // TODO Tính công nợ BE
                                this.deleteChargeWithType(type, this.selectedIndexCharge);

                            }
                            // this.getSurcharges(type);
                            this.getProfit();
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    deleteChargeWithType(type: CommonEnum.SurchargeTypeEnum | any, index: number) {
        switch (type) {
            case CommonEnum.SurchargeTypeEnum.BUYING_RATE:
                this._store.dispatch(new fromStore.DeleteBuyingSurchargeAction(index));
                break;
            case CommonEnum.SurchargeTypeEnum.SELLING_RATE:
                // this.calculatorReceivable([this.selectedSurcharge])
                this._store.dispatch(new fromStore.DeleteSellingSurchargeAction(index));
                break;
            case CommonEnum.SurchargeTypeEnum.OBH:
                // this.calculatorReceivable([this.selectedSurcharge])
                this._store.dispatch(new fromStore.DeleteOBHSurchargeAction(index));
                break;
            default:
                break;
        }
    }

    onChangeDataUpdateTotal(chargeItem: CsShipmentSurcharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(+chargeItem.vatrate || 0, +chargeItem.quantity, +chargeItem.unitPrice);
    }

    updateSurchargeField(type: CommonEnum.SurchargeTypeEnum) {
        for (const charge of this.charges) {
            if (!!charge.exchangeDate && !!charge.exchangeDate.startDate) {
                charge.exchangeDate = formatDate(charge.exchangeDate.startDate, 'yyyy-MM-dd', 'en');
            } else {
                charge.exchangeDate = null;
            }

            if (!!charge.invoiceDate && !!charge.invoiceDate.startDate) {
                charge.invoiceDate = formatDate(charge.invoiceDate.startDate, 'yyyy-MM-dd', 'en');
            } else {
                charge.invoiceDate = null;
            }

            // ! round unitPrice
            // charge.unitPrice = +(+(charge.unitPrice)).toFixed(3);


            // Update HBL ID,Type
            if (!!this.hbl && !!this.hbl.id) {
                charge.hblid = this.hbl.id;
            } else {
                this._toastService.warning("HBL was not found");
                return;
            }
            charge.type = type;
        }
    }

    // isWhiteSpace(input: any) {
    //     if (input != null) {
    //         if (input.trim().length === 0) {
    //             return true;
    //         }
    //     }
    //     if (input === null) {
    //         return true;
    //     }
    //     return false;
    // }

    saveBuyingCharge(type: CommonEnum.SurchargeTypeEnum | string) {
        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }
        // if(this.service!=="logistic"){
        //     for (const charge of this.charges) {
        //         if(!this.isWhiteSpace(charge.invoiceNo) && this.isWhiteSpace(charge.seriesNo)){
        //             this._toastService.warning("Series No Must be fill in");
        //             return;
        //         }
        //         if(this.isWhiteSpace(charge.invoiceNo) && !this.isWhiteSpace(charge.seriesNo)){
        //             this._toastService.warning("Invoice No Must be fill in");
        //             return;
        //         }
        //     }
        // }
        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }
        if (!this.checkDuplicate()) {
            this._toastService.warning("The Charge code and InvoiceNo is duplicated");
            return;
        }
        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
        this._progressRef.start();
        this._documentRepo.addShipmentSurcharges(this.charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this.getProfit();
                        this.getSurcharges(type);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onChangeQuantityHint(hintType: string, chargeItem: CsShipmentSurcharge) {
        switch (hintType) {
            case CommonEnum.QUANTITY_TYPE.GW:
                // * Update UnitPrice to KGS
                chargeItem = this.updateUnitSurcharge(chargeItem, 'KGS');
                if (this.service === 'air') {
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        chargeItem.quantity = this.shipment.grossWeight;
                    } else {
                        chargeItem.quantity = this.hbl.grossWeight;
                    }
                } else if (this.service === 'logistic') {
                    chargeItem.quantity = this.shipment.grossWeight;
                } else {
                    chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.GW) : this.getDataHint(CommonEnum.QUANTITY_TYPE.GW);
                    // chargeItem.quantity = this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.GW);
                }
                break;
            case CommonEnum.QUANTITY_TYPE.NW:
                if (this.service === 'air') {
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        chargeItem.quantity = this.shipment.netWeight;
                    } else {
                        chargeItem.quantity = this.hbl.netWeight;
                    }
                } else if (this.service === 'logistic') {
                    chargeItem.quantity = this.shipment.netWeight;
                } else {
                    chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.NW) : this.getDataHint(CommonEnum.QUANTITY_TYPE.NW);
                    // chargeItem.quantity = this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.NW);
                }
                break;
            case CommonEnum.QUANTITY_TYPE.CBM:
                if (this.service === 'air') {
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        chargeItem.quantity = this.shipment.cbm;
                    } else {
                        chargeItem.quantity = this.hbl.cbm;
                    }
                } else if (this.service === 'logistic') {
                    chargeItem.quantity = this.shipment.cbm;
                } else {
                    chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.CBM) : this.getDataHint(CommonEnum.QUANTITY_TYPE.CBM);
                    // chargeItem.quantity = this.calculateContainer(this.containers, CommonEnum.QUANTITY_TYPE.CBM);
                }

                chargeItem = this.updateUnitSurcharge(chargeItem, 'CBM');
                break;
            case CommonEnum.QUANTITY_TYPE.CONT:
                chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, 'quantity') : this.getDataHint('quantity');
                // chargeItem.quantity = this.calculateContainer(this.containers, 'quantity');
                break;
            case CommonEnum.QUANTITY_TYPE.CW:
                // * Update UnitPrice to KGS

                chargeItem = this.updateUnitSurcharge(chargeItem, 'KGS');

                if (this.service === 'air') {
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        chargeItem.quantity = this.shipment.chargeWeight;
                    } else {
                        chargeItem.quantity = this.hbl.chargeWeight;
                    }
                } else if (this.service === 'logistic') {
                    chargeItem.quantity = this.shipment.chargeWeight;
                } else {
                    chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, 'chargeAbleWeight') : this.getDataHint('chargeAbleWeight');
                }
                break;
            case CommonEnum.QUANTITY_TYPE.PACKAGE:
                if (this.service === 'sea') {
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        chargeItem.quantity = this.shipment.packageQty;
                    } else {
                        chargeItem.quantity = this.hbl.packageQty;
                    }
                } else if (this.service === 'logistic') {
                    chargeItem.quantity = this.shipment.packageQty;
                } else {
                    chargeItem.quantity = !!this.containers.length ? this.calculateContainer(this.containers, 'packageQuantity') : this.getDataHint('packageQuantity');
                    // chargeItem.quantity = this.calculateContainer(this.containers, 'packageQuantity');
                }
                break;
            default:
                break;
        }

        // * Update quantityType, total.
        chargeItem.quantityType = hintType;
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate || 0, chargeItem.quantity, chargeItem.unitPrice);
    }

    calculateContainer(containers: Container[], key: string): number {
        let total: number = 0;
        total = containers.reduce((acc: any, curr: Container) => acc += curr[key], 0);
        return total;
    }

    getDataHint(key: string) {
        let data: number = null;
        switch (key) {
            case 'chargeAbleWeight':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.chargeWeight;
                } else {
                    data = this.hbl.chargeWeight || this.hbl.cw;
                }
                break;
            case 'gw':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.grossWeight;
                } else {
                    data = this.hbl.grossWeight || this.hbl.gw;
                }
                break;
            case 'nw':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.netWeight;
                } else {
                    data = this.hbl.netWeight;
                }
                break;
            case 'cbm':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.cbm;
                } else {
                    data = this.hbl.cbm;
                }
                break;
            case 'packageQuantity':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.packageQty;
                } else {
                    data = this.hbl.packageQty;
                }
                break;
            case 'quantity':
                if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    data = this.shipment.chargeWeight;
                } else {
                    data = this.hbl.chargeWeight;
                }
                break;
            default:
                break;
        }

        return data;
    }

    onSelectPartner(partnerData: Partner, chargeItem: CsShipmentSurcharge) {
        if (!!partnerData && !!chargeItem) {
            if (chargeItem.type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
                this._toastService.clear();

                const transactionType: string = this.service === 'logistic' ? 'CL' : 'DOC';
                this._documentRepo.validateCheckPointContractPartner(partnerData.id, this.hbl.id, transactionType)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                chargeItem = this.mapValueWhenSelectPartnerSuccess(partnerData, chargeItem);

                            } else {
                                this._toastService.warning(res.message);
                                chargeItem.partnerShortName = null;
                                chargeItem.partnerName = null;
                                chargeItem.paymentObjectId = null;
                                chargeItem.objectBePaid = null;
                            }

                            this._cd.markForCheck();
                        }
                    )
            } else {
                chargeItem = this.mapValueWhenSelectPartnerSuccess(partnerData, chargeItem);
            }

        }
    }

    mapValueWhenSelectPartnerSuccess(partnerData: Partner, chargeItem: CsShipmentSurcharge,) {
        chargeItem.partnerShortName = partnerData.shortName;
        chargeItem.partnerName = partnerData.partnerNameEn;
        chargeItem.paymentObjectId = partnerData.id;
        chargeItem.objectBePaid = null;  // nếu chọn customer/agent/carrier

        if (chargeItem.invoiceNo) {
            chargeItem.vatPartnerId = chargeItem.paymentObjectId;
        }

        return chargeItem;
    }

    mapValueWhenSelectPartnerTypeHeader(chargeItem: CsShipmentSurcharge, partnerType: CommonInterface.IValueDisplay) {
        switch (partnerType.value) {
            case CommonEnum.PartnerGroupEnum.CUSTOMER:
                const customer = this.listPartner.find(x => x.id === this.hbl.customerId);
                if (!!customer) {
                    chargeItem.partnerShortName = customer.shortName;
                    chargeItem.paymentObjectId = customer.id;
                } else {
                    chargeItem.partnerShortName = chargeItem.paymentObjectId = null;
                }

                if (chargeItem.invoiceNo) {
                    chargeItem.vatPartnerId = chargeItem.paymentObjectId;
                }
                break;
            case CommonEnum.PartnerGroupEnum.CARRIER:
                const carrier = this.listPartner.find(p => p.id === this.shipment.coloaderId);
                if (!!carrier) {
                    chargeItem.partnerShortName = carrier.shortName;
                    chargeItem.paymentObjectId = this.shipment.coloaderId;
                }
                break;
            case CommonEnum.PartnerGroupEnum.AGENT:
                const agent = this.listPartner.find(p => p.id === this.shipment.agentId);
                if (!!agent) {
                    chargeItem.partnerShortName = agent.shortName;
                    chargeItem.paymentObjectId = this.shipment.agentId;
                }
                break;
        }


        return chargeItem;
    }

    selectPartnerType(partnerType: CommonInterface.IValueDisplay, chargeItem: CsShipmentSurcharge, index: number) {
        chargeItem.objectBePaid = partnerType.fieldName;
        chargeItem.isShowPartnerHeader = false;

        this.selectedIndexCharge = index;
        this.deleteComponentRef(this.selectedIndexCharge, 'partner');

        switch (partnerType.value) {
            case CommonEnum.PartnerGroupEnum.CUSTOMER:
                const transactionType: string = this.service === 'logistic' ? 'CL' : 'DOC';
                if (chargeItem.type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
                    this._documentRepo.validateCheckPointContractPartner(this.hbl.customerId, this.hbl.id, transactionType)
                        .subscribe(
                            (res: CommonInterface.IResult) => {
                                if (res.status) {
                                    chargeItem = this.mapValueWhenSelectPartnerTypeHeader(chargeItem, partnerType);
                                } else {
                                    this._toastService.warning(res.message);
                                }
                                this._cd.markForCheck();
                            }
                        )
                } else {
                    chargeItem = this.mapValueWhenSelectPartnerTypeHeader(chargeItem, partnerType);
                }

                break;
            case CommonEnum.PartnerGroupEnum.CARRIER:
                chargeItem = this.mapValueWhenSelectPartnerTypeHeader(chargeItem, partnerType);
                break;
            case CommonEnum.PartnerGroupEnum.AGENT:
                chargeItem = this.mapValueWhenSelectPartnerTypeHeader(chargeItem, partnerType);
                break;
            default:
                break;
        }
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.charges) {
            // * Reset duplicate flag charge, invoice.
            charge.duplicateCharge = false;
            charge.duplicateInvoice = false;
            if (this.checkSpecialCaseCharge(charge)) {
                valid = true;
                continue;
            }
            if (
                !charge.paymentObjectId
                || !charge.chargeId
                || charge.quantity === null
                || !charge.unitId
                || !charge.partnerShortName
                || charge.unitPrice === null
                || charge.quantity < 0
                // || charge.unitPrice < 0   // ! Cho nhập âm để giảm trên hóa đơn
                || +charge.unitPrice === 0   // ! Nhưng không cho nhập 0
                || charge.currencyId === null
                || charge.vatrate > 100
                // || (charge.invoiceNo !==null && charge.seriesNo===null)
                // || (charge.invoiceNo !==null && charge.seriesNo===null)
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    checkSpecialCaseCharge(charge: CsShipmentSurcharge) {
        return !!charge.soano
            || !!charge.creditNo
            || !!charge.debitNo
            || !!charge.settlementCode
            || !!charge.voucherId
            || !!charge.voucherIddate;
    }

    checkDuplicate() {
        let valid: boolean = true;
        if ((this.TYPE as any) === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
            return true;
        }
        const listChargeToDectect = this.charges.filter(c => !this.checkSpecialCaseCharge(c));
        const chargeInvoiceGrps = listChargeToDectect.map(c => {
            if (!!c.invoiceNo) {
                if (!!c.notes) {
                    return c.chargeId + c.invoiceNo + c.notes;
                }
                return c.chargeId + c.invoiceNo;
            }
            return null;
        }).filter(x => Boolean(x));

        const isDuplicate = new Set(chargeInvoiceGrps).size !== chargeInvoiceGrps.length;

        if (isDuplicate) {
            valid = false;
            const arrayDuplicates = [...new Set(this.utility.findDuplicates(chargeInvoiceGrps))];
            let isDup: boolean = false;

            this.charges.filter(c => !this.checkSpecialCaseCharge(c)).forEach((c: CsShipmentSurcharge) => {
                if (!!c.notes) {
                    isDup = arrayDuplicates.includes(c.chargeId + c.invoiceNo + c.notes);
                } else {
                    isDup = arrayDuplicates.includes(c.chargeId + c.invoiceNo);
                }
                if (isDup) {
                    [c.duplicateCharge, c.duplicateInvoice] = [true, true];
                } else {
                    [c.duplicateCharge, c.duplicateInvoice] = [false, false];
                }
            });
        } else valid = true;

        return valid;
    }

    getSurcharges(type: string) {
        switch (type) {
            case CommonEnum.SurchargeTypeEnum.BUYING_RATE:
                this._store.dispatch(new GetBuyingSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.BUYING_RATE, hblId: this.hbl.id }));
                break;
            case CommonEnum.SurchargeTypeEnum.SELLING_RATE:
                this._store.dispatch(new GetSellingSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.SELLING_RATE, hblId: this.hbl.id }));
                break;
            case CommonEnum.SurchargeTypeEnum.OBH:
                this._store.dispatch(new GetOBHSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.OBH, hblId: this.hbl.id }));
                break;
            default:
                break;
        }
    }

    getProfit() {
        this._store.dispatch(new fromStore.GetProfitHBLAction(this.hbl.id));
    }

    addSurcharges(type: string, newcharge: CsShipmentSurcharge) {
        switch (type) {
            case CommonEnum.SurchargeTypeEnum.BUYING_RATE:
                this._store.dispatch(new fromStore.AddBuyingSurchargeAction(newcharge));
                break;
            case CommonEnum.SurchargeTypeEnum.SELLING_RATE:
                this._store.dispatch(new fromStore.AddSellingSurchargeAction(newcharge));
                break;
            case CommonEnum.SurchargeTypeEnum.OBH:
                this._store.dispatch(new fromStore.AddOBHSurchargeAction(newcharge));
                break;
            default:
                break;
        }
    }

    getStandardCharge(type: CommonEnum.SurchargeTypeEnum | string = CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
        const chargeCodes: string[] = this.detectDefaultCode(this.serviceTypeId, type);

        this._catalogueRepo.getChargeByCodes(chargeCodes)
            .pipe(catchError(this.catchError))
            .subscribe((charges: Charge[]) => {
                if (charges && !!charges.length) {
                    const csShipmentSurcharge: CsShipmentSurcharge[] = this.updateDefaultChargeCode(charges, this.serviceTypeId, type);

                    if (!!csShipmentSurcharge.length) {
                        if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                            csShipmentSurcharge.forEach((c: CsShipmentSurcharge) => {
                                this.onChangeDataUpdateTotal(c);
                                this._store.dispatch(new fromStore.AddBuyingSurchargeAction(c));
                            });
                        } else {
                            csShipmentSurcharge.forEach((c: CsShipmentSurcharge) => {
                                this.onChangeDataUpdateTotal(c);
                                this._store.dispatch(new fromStore.AddSellingSurchargeAction(c));
                            });
                        }
                    }
                } else {
                    this._toastService.warning("Not found default charge");
                }
            });
    }

    detectDefaultCode(serviceTypeId: string, type: CommonEnum.SurchargeTypeEnum | string = CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
        if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
            switch (serviceTypeId) {
                case ChargeConstants.AE_CODE:
                case ChargeConstants.AI_CODE:
                    return ChargeConstants.DEFAULT_AIR;
                case ChargeConstants.SFE_CODE:
                    return ChargeConstants.BUYING_DEFAULT_FCL_EXPORT;
                case ChargeConstants.SLE_CODE:
                    return ChargeConstants.BUYING_DEFAULT_LCL_EXPORT;
                case ChargeConstants.SFI_CODE:
                    return ChargeConstants.BUYING_DEFAULT_FCL_IMPORT;
                case ChargeConstants.SLI_CODE:
                    return ChargeConstants.BUYING_DEFAULT_LCL_IMPORT;
                default:
                    return [];
            }
        } else {
            switch (serviceTypeId) {
                case ChargeConstants.SFE_CODE:
                    return ChargeConstants.SELLING_DEFAULT_FCL_EXPORT;
                case ChargeConstants.SLE_CODE:
                    return ChargeConstants.SELLING_DEFAULT_LCL_EXPORT;
                case ChargeConstants.SFI_CODE:
                    return ChargeConstants.SELLING_DEFAULT_FCL_IMPORT;
                case ChargeConstants.SLI_CODE:
                    return ChargeConstants.SELLING_DEFAULT_LCL_IMPORT;
                default:
                    return [];
            }
        }
    }

    updateDefaultChargeCode(charges: Charge[], serviceTypeId: string, type: CommonEnum.SurchargeTypeEnum | string = CommonEnum.SurchargeTypeEnum.BUYING_RATE): CsShipmentSurcharge[] {
        const shipmentSurcharges: CsShipmentSurcharge[] = this.mapChargeToShipmentSurCharge(charges);

        let coloaderPayer = null;
        let customerPayer = null;
        // * Find partner with Airlines/Coloader's shipment or HBL's customer.
        this.listPartner.forEach(p => {
            if (p.id === this.shipment.coloaderId) {
                coloaderPayer = p;
                if (!!customerPayer) {
                    return false;
                }
            }
            if (p.id === this.hbl.customerId) {
                customerPayer = p;
                if (!!coloaderPayer) {
                    return false;
                }
            }
        });

        switch (serviceTypeId) {
            case ChargeConstants.AE_CODE:
            case ChargeConstants.AI_CODE:
                shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                    c = this.updatePayer(c, coloaderPayer);

                    if (c.chargeCode === ChargeConstants.DEFAULT_AIR[0]) {
                        c = this.updateUnitSurcharge(c, 'KGS');
                        c.quantityType = CommonEnum.QUANTITY_TYPE.CW;
                        c.quantity = this.shipment.chargeWeight;
                    }
                    if (c.chargeCode === ChargeConstants.DEFAULT_AIR[1]) {
                        c = this.updateUnitSurcharge(c, 'KGS');
                        c.quantityType = CommonEnum.QUANTITY_TYPE.GW;
                        c.quantity = this.shipment.grossWeight;
                    }
                    if (c.chargeCode === ChargeConstants.DEFAULT_AIR[2]) {
                        c = this.updateUnitSurcharge(c, 'SET');
                        c.quantity = 1;
                    }
                    if (c.chargeCode === ChargeConstants.DEFAULT_AIR[3]) {
                        c = this.updateUnitSurcharge(c, 'HAWB');
                        c.quantity = 1;
                        c.vatrate = 10;
                        c.currencyId = "VND";
                        c.unitPrice = 250000;
                    }
                });
                break;
            case ChargeConstants.SFE_CODE:
                if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, coloaderPayer);

                        if (c.chargeCode === ChargeConstants.BUYING_DEFAULT_FCL_EXPORT[1]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                } else {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, customerPayer);

                        if (c.chargeCode === ChargeConstants.SELLING_DEFAULT_FCL_EXPORT[1]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                }
                break;
            case ChargeConstants.SLE_CODE:
                if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, coloaderPayer);

                        if (c.chargeCode === ChargeConstants.BUYING_DEFAULT_LCL_EXPORT[1]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                } else {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, customerPayer);

                        if (c.chargeCode === ChargeConstants.SELLING_DEFAULT_LCL_EXPORT[1]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                }
                break;
            case ChargeConstants.SFI_CODE:
                if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, coloaderPayer);

                        if (c.chargeCode === ChargeConstants.BUYING_DEFAULT_FCL_IMPORT[1] || c.chargeCode === ChargeConstants.BUYING_DEFAULT_FCL_IMPORT[4]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                } else {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, customerPayer);

                        if (c.chargeCode === ChargeConstants.SELLING_DEFAULT_FCL_IMPORT[1] || c.chargeCode === ChargeConstants.SELLING_DEFAULT_FCL_IMPORT[4]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                }
                break;
            case ChargeConstants.SLI_CODE:
                if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, coloaderPayer);

                        if (c.chargeCode === ChargeConstants.BUYING_DEFAULT_LCL_IMPORT[1] || c.chargeCode === ChargeConstants.BUYING_DEFAULT_FCL_IMPORT[4]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                } else {
                    shipmentSurcharges.forEach((c: CsShipmentSurcharge) => {
                        c = this.updatePayer(c, customerPayer);

                        if (c.chargeCode === ChargeConstants.SELLING_DEFAULT_LCL_IMPORT[1] || c.chargeCode === ChargeConstants.SELLING_DEFAULT_LCL_IMPORT[4]) {
                            c = this.updateUnitSurcharge(c, 'SHIPT');
                            c.quantity = 1;
                        } else {
                            c = this.updateUnitSurcharge(c, 'CONT');
                            c.quantity = this.calculateContainer(this.shipmentContainers, 'quantity');
                        }
                    });
                }
                break;
            default:
                return [];
        }
        return shipmentSurcharges;
    }

    mapChargeToShipmentSurCharge(charges: Charge[]): CsShipmentSurcharge[] {
        const newCsShipmentSurcharge: CsShipmentSurcharge[] = charges.map((c: Charge) => new CsShipmentSurcharge(
            Object.assign({}, c, {
                chargeCode: c.code,
                type: CommonEnum.SurchargeTypeEnum.BUYING_RATE,
                chargeId: c.id,
                id: SystemConstants.EMPTY_GUID,
                exchangeDate: { startDate: new Date, endDate: new Date() },
                hblno: this.hbl.hwbno || null,
                mblno: this.getMblNo(this.shipment, this.hbl),
                jobNo: this.shipment.jobNo || null,
            })));
        return newCsShipmentSurcharge || [];
    }

    updateUnitSurcharge(charge: CsShipmentSurcharge, code: string) {
        const unit: Unit = this.listUnits.find(u => u.code.toLowerCase() === code.toLowerCase());
        charge.unitId = !!unit ? unit.id : null;
        return charge;
    }

    updatePayer(charge: CsShipmentSurcharge, partner: Partner) {
        charge.paymentObjectId = !!partner ? partner.id : null;
        charge.partnerShortName = !!partner ? partner.shortName : '';
        charge.partnerName = !!partner ? partner.partnerNameEn : '';

        return charge;
    }

    getOtherCharge() {
        if (!!this.shipment) {
            if (!!this.shipment.coloaderId) {
                this._catalogueRepo.getPartnerCharge(this.shipment.coloaderId)
                    .pipe(catchError(this.catchError))
                    .subscribe((partnerCharges: CatPartnerCharge[]) => {
                        if (!partnerCharges || !partnerCharges.length) {
                            this._toastService.warning("Not found charges of AIRLINE/COLOADER");
                        } else {
                            const buyingCharges: CsShipmentSurcharge[] = partnerCharges.map(x => new CsShipmentSurcharge(Object.assign({}, x, { paymentObjectId: x.partnerId })));
                            // * update CsShipmentSurcharge charge to chargeId
                            buyingCharges.forEach(c => {
                                c.id = SystemConstants.EMPTY_GUID;
                                c.type = CommonEnum.SurchargeTypeEnum.BUYING_RATE;
                                c.exchangeDate = { startDate: new Date, endDate: new Date() };
                                c.hblno = this.hbl.hwbno || null;
                                c.mblno = this.getMblNo(this.shipment, this.hbl);
                                c.jobNo = this.shipment.jobNo || null;

                                this.onChangeDataUpdateTotal(c);
                                // * Update Quantity with hint
                                if (!!c.quantityType) {
                                    this.onChangeQuantityHint(c.quantityType, c);
                                }
                                this._store.dispatch(new fromStore.AddBuyingSurchargeAction(c));
                            });
                        }
                    });
            } else {
                this._toastService.warning("Not found Airline/Coloader of shipment");
            }
        }
    }

    getRecentlyChargeOps() {
        const body: IRecentlyCharge = {
            hblId: this.hbl.id,
            jobId: this.shipment.id,
            transactionType: this.utility.getTransationType(this.shipment.transactionType ?? 'CL'),  // ! OpsTransaion do not have TransationType
            coloaderId: this.shipment.coloaderId,
            agentId: this.shipment.agentId,
            chargeType: this.TYPE,
            customerId: this.shipment.customerId,
        };
        this._documentRepo.getRecentlyChargesOps(body)
            .pipe(map((v: any[]) => (v || []).map((i => new CsShipmentSurcharge(i)))))
            .subscribe(
                (charges: CsShipmentSurcharge[]) => {
                    if (!charges.length) {
                        this._toastService.warning("Not found recently charge");
                        return;
                    }
                    if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                        charges.forEach(c => {
                            c.hblno = this.shipment.hwbno || null;
                            c.mblno = this.getMblNo(this.shipment, this.hbl);
                            c.jobNo = this.shipment.jobNo || null;
                            c.exchangeDate = { startDate: new Date, endDate: new Date() };
                            this._store.dispatch(new fromStore.AddBuyingSurchargeAction(c));
                        });
                    }
                    if ((this.TYPE as any) === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
                        charges.forEach(c => {
                            c.hblno = this.shipment.hwbno || null;
                            c.mblno = this.getMblNo(this.shipment, this.hbl);
                            c.jobNo = this.shipment.jobNo || null;
                            c.exchangeDate = { startDate: new Date, endDate: new Date() };
                            this._store.dispatch(new fromStore.AddSellingSurchargeAction(c));
                        });
                    }
                }
            );
    }

    getRecentlyCharge() {
        if (!this.shipment.transactionType) {
            this.getRecentlyChargeOps();
        }
        else {
            const body: IRecentlyCharge = {
                hblId: this.hbl.id,
                jobId: this.shipment.id,
                transactionType: this.utility.getTransationType(this.shipment.transactionType ?? 'CL'),  // ! OpsTransaion do not have TransationType
                coloaderId: this.shipment.coloaderId,
                agentId: this.shipment.agentId,
                chargeType: this.TYPE,
                customerId: this.hbl.customerId,
            };
            this._documentRepo.getRecentlyCharges(body)
                .pipe(map((v: any[]) => (v || []).map((i => new CsShipmentSurcharge(i)))))
                .subscribe(
                    (charges: CsShipmentSurcharge[]) => {
                        if (!charges.length) {
                            this._toastService.warning("Not found recently charge");
                            return;
                        }
                        if (this.TYPE === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
                            charges.forEach(c => {
                                c.hblno = this.hbl.hwbno || null;
                                c.mblno = this.getMblNo(this.shipment, this.hbl);
                                c.jobNo = this.shipment.jobNo || null;
                                c.exchangeDate = { startDate: new Date, endDate: new Date() };
                                this._store.dispatch(new fromStore.AddBuyingSurchargeAction(c));
                            });
                        }
                        if ((this.TYPE as any) === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
                            charges.forEach(c => {
                                c.hblno = this.hbl.hwbno || null;
                                c.mblno = this.getMblNo(this.shipment, this.hbl);
                                c.jobNo = this.shipment.jobNo || null;
                                c.exchangeDate = { startDate: new Date, endDate: new Date() };
                                this._store.dispatch(new fromStore.AddSellingSurchargeAction(c));
                            });
                        }
                        if ((this.TYPE as any) === CommonEnum.SurchargeTypeEnum.OBH) {
                            charges.forEach(c => {
                                c.hblno = this.hbl.hwbno || null;
                                c.mblno = this.getMblNo(this.shipment, this.hbl);
                                c.jobNo = this.shipment.jobNo || null;
                                c.exchangeDate = { startDate: new Date, endDate: new Date() };
                                this._store.dispatch(new fromStore.AddOBHSurchargeAction(c));
                            });
                        }
                    }
                );
        }

    }

    loadDynamicComoGrid(charge: CsShipmentSurcharge, index: number) {
        this.isSelectedChargeDynamicCombogrid = false;
        this.isSelectedPartnerDynamicCombogrid = true;

        this.selectedSurcharge = charge;
        charge.isShowPartnerHeader = true;
        this.selectedIndexCharge = index;

        const containerRef: ViewContainerRef = this.widgetTargets.toArray()[index];

        this.componentRef = this.renderDynamicComponent(AppComboGridComponent, containerRef);
        if (!!this.componentRef) {
            this.componentRef.instance.headers = this.headerPartner;
            this.componentRef.instance.data = this.listPartner;
            this.componentRef.instance.fields = ['shortName', 'taxCode', 'partnerNameEn'];
            this.componentRef.instance.active = charge.paymentObjectId;

            this.subscription = ((this.componentRef.instance) as AppComboGridComponent<Partner>).onClick.subscribe(
                (v: Partner) => {
                    this.onSelectPartner(v, this.selectedSurcharge);
                    this.subscription.unsubscribe();
                    this.charges[index].isShowPartnerHeader = false;

                    containerRef.clear();
                });
            ((this.componentRef.instance) as AppComboGridComponent<Partner>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        this.charges[index].isShowPartnerHeader = false;
                        containerRef.clear();
                    }
                );
        }
    }

    loadDynamicComboGridCharge(charge: CsShipmentSurcharge, index: number) {
        // TODO: apply for SELLING, OBH
        this.selectedSurcharge = charge;
        this.selectedIndexCharge = index;

        // * Xác định đang chọn combogrid nào
        this.isSelectedChargeDynamicCombogrid = true;
        this.isSelectedPartnerDynamicCombogrid = false;

        const containerRef: ViewContainerRef = this.chargeContainerRef.toArray()[index];

        const componentRef: ComponentRef<any> = this.renderDynamicComponent(AppComboGridComponent, containerRef);
        if (!!componentRef) {
            componentRef.instance.headers = [
                { title: 'Name', field: 'chargeNameEn' },
                { title: 'Unit Price', field: 'unitPrice' },
                { title: 'Unit', field: 'unitId' },
                { title: 'Code', field: 'code' },
            ];
            componentRef.instance.data = this.listCharges;
            componentRef.instance.fields = ['chargeNameEn'];
            componentRef.instance.active = charge.chargeId;

            // * Listen EventEmiter
            this.subscription = ((componentRef.instance) as AppComboGridComponent<Charge>).onClick.subscribe(
                (v: Charge) => {
                    this.onSelectDataFormInfo(v, 'charge', this.selectedSurcharge);

                    this.subscription.unsubscribe();
                    containerRef.clear();
                });

            // * Listen ClickOutside
            ((componentRef.instance) as AppComboGridComponent<Charge>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        containerRef.clear();
                    }
                );
        }
    }

    deleteComponentRef(index: number, type: string) {
        switch (type) {
            case 'partner':
                const componentRef = this.widgetTargets.toArray()[index];
                if (!!componentRef) {
                    componentRef.clear();
                }
                break;
        }
    }

    handleChangeFeeType(event: any, charge: any) {
        let feeTypeListTemp: ChargeGroup[] = [];
        this.listChargeGroup.subscribe((res: ChargeGroup[]) => {
            feeTypeListTemp = res;
            const checkSelected = feeTypeListTemp.find(e => e.id === event);
            if (!!checkSelected && checkSelected.name === 'Com') {
                charge.kickBack = true;
            } else {
                charge.kickBack = false;
            }
        });

    }

    getMblNo(shipment: CsTransaction, hbl: CsTransactionDetail | HouseBill) {
        let mblNo = null;
        mblNo = shipment.mawb ? shipment.mawb : (hbl.mawb ? hbl.mawb : hbl.hwbno);
        return mblNo;
    }

    onChangeInvoiceNo(chargeItem: CsShipmentSurcharge, invNo: string) {
        if (!!invNo) {
            chargeItem.vatPartnerId = chargeItem.paymentObjectId;
        }
    }

    calculatorReceivable(charges: CsShipmentSurcharge[]) {
        const objReceivable = charges.map((item: any) => ({
            surchargeId: item.id,
            partnerId: item.paymentObjectId,
            office: (!!item.officeId ? item.officeId : this.userLogged.officeId),
            service: (!!item.transactionType ? item.transactionType : this.serviceTypeId),
        }));

        // charges.forEach((element: any) => {
        //     if (element.type === 'OBH') {
        //         objReceivable.push({ surchargeId: element.id, partnerId: element.payerId, office: (!!element.officeId ? element.officeId : this.userLogged.officeId), service: (!!element.transactionType ? element.transactionType : this.serviceTypeId) });
        //     }
        // });

        this._accountingRepo.calculatorDebitAmount({ objectReceivable: objReceivable }).subscribe();
    }

    onSelectSurcharge(index, cs: CsShipmentSurcharge) {
        this.selectedCs = cs;
        this.selectedIndexCharge = index;
        const qContextMenuList = this.queryListMenuContext.toArray();
        if (!!qContextMenuList.length) {
            qContextMenuList.forEach((c: ContextMenuDirective) => c.close());
        }
    }

    cancelLinkCharge(cs: CsShipmentSurcharge) {
        if (!cs.linkChargeId) {
            this._toastService.warning("Charge without link charge");
            return;
        }
        this.confirmCancelPopup.show();
    }

    onCancelLinkCharge(type: CommonEnum.SurchargeTypeEnum | string) {
        this.confirmCancelPopup.hide();
        if (!!this.selectedCs && this.selectedCs.id !== SystemConstants.EMPTY_GUID) {
            this._progressRef.start();
            this._documentRepo.cancelLinkCharge(this.selectedCs.id)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            if (this.selectedIndexCharge > -1) {
                                this.deleteChargeWithType(type, this.selectedIndexCharge);
                            }
                            this.getSurcharges(type);
                            this.getProfit();
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    revertFeeBuy(selectedCs: CsShipmentSurcharge) {
        if (!selectedCs.linkFee) {
            this._toastService.warning("Charge without fee");
            return;
        }
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Alert',
            body: this.messageConfirmRevertLinkFee,
            labelConfirm: 'Yes',
            classConfirmButton: 'btn-warning',
            iconConfirm: 'la la-trash',
            center: true
        }, () => this.onConfirmRevertLinkFeeBuy(selectedCs))
    }
    onConfirmRevertLinkFeeBuy(selectedCs: CsShipmentSurcharge) {
        let charges = [];
        charges.push(selectedCs);
        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
        this._documentRepo.revertShipmentSurchargesLinkFee(charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success("Fee Have Revert Linked Success");
                        this.getProfit();
                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
                    } else {
                        this._toastService.error(result.message);
                    }
                }
            );
    }
    detailLinkFee(selectedCs: CsShipmentSurcharge) {
        if (!selectedCs)
            this._toastService.error("Please Select Charge");
        this._spinner.show(this.spinnerpartner);
        this._documentRepo.detailLinkFee(selectedCs.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: any) => {
                    if (result) {
                        this._spinner.hide(this.spinnerpartner);
                        let strBody = "<div class=detail-linkfee > <b>Link from Job Ops:</b><a> " + result.jobNoOrg + "</a>"
                            + "</br><b>Link to Job Service:</b><a> " + result.jobNoLink + "</a>"
                            + "</br><b>Partner Name Selling :</b><a> " + result.partnerNameOrg + "</a>"
                            + "</br><b>Partner Name Buying :</b><a> " + result.partnerNameLink + "</a>"
                            + "</br><b>Linked At:</b><a> " + formatDate(new Date(result.datetimeCreated), 'dd/MM/yyyy hh:mm:ss', 'en') + "</a>"
                            + "</br><b>Create By:</b><a> " + result.userCreatedName + "</a>"
                            + "<div>"
                        this.detailLinkFeePopup.title = "Information";
                        this.detailLinkFeePopup.body = strBody;
                        this.detailLinkFeePopup.show();
                    } else {
                        this._toastService.error("No Charge Link Fee");
                    }
                }
            );
    }
}

interface IRecentlyCharge {
    hblId: string;
    transactionType: number;
    customerId: string; // * HBL
    agentId: string; // * MBL
    coloaderId: string; // * MBL
    chargeType: string; // * BUY/SELL/OBH
    jobId: string;
}
