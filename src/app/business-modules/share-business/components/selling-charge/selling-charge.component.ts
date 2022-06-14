import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { ShareBussinessBuyingChargeComponent } from '../buying-charge/buying-charge.component';
import { CatalogueRepo, DocumentationRepo, AccountingRepo } from '@repositories';
import { SortService } from '@services';
import { CsShipmentSurcharge, Charge, Unit } from '@models';
import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { takeUntil, catchError, finalize } from 'rxjs/operators';

import * as fromStore from './../../store';
import cloneDeep from 'lodash/cloneDeep';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { GetCatalogueCurrencyAction, getCatalogueCurrencyState, GetCatalogueUnitAction, getCatalogueUnitState } from '@store';
import { ContextMenuDirective, InjectViewContainerRefDirective } from '@directives';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { getPartnerForKeyingChargeState, LoadListPartnerForKeyInSurcharge } from './../../store';

@Component({
    selector: 'selling-charge',
    templateUrl: './selling-charge.component.html',
    styleUrls: ['./../buying-charge/buying-charge.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})

export class ShareBussinessSellingChargeComponent extends ShareBussinessBuyingChargeComponent {
    @ViewChild(InjectViewContainerRefDirective) viewContainer: InjectViewContainerRefDirective;
    @ViewChild(ConfirmPopupComponent) confirmLinkFeePopup: InfoPopupComponent;
    @ViewChildren(ContextMenuDirective) queryListMenuContext: QueryList<ContextMenuDirective>;
    @ViewChild('detailLinkFeePopup') detailLinkFeePopup: InfoPopupComponent;

    @Input() showSyncFreight: boolean = true;
    @Input() showGetCharge: boolean = true;
    @Input() showSyncStandard: boolean = true;
    @Input() allowSaving: boolean = true; // * not allow to save or add Charges without saving the job
    @Input() allowLinkFee: boolean = false;
    @Input() isDuplicateJob: boolean = false;


    TYPE: any = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
    messageConfirmLinkFee: string = "Do you want to Link Fee these Jobs ?";

    messageCreditRate: string = '';
    selectedCs: CsShipmentSurcharge;

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
        protected _cd: ChangeDetectorRef,

    ) {
        super(_catalogueRepo,
            _store,
            _documentRepo,
            _toastService,
            _sortService,
            _ngProgressService,
            _spinner,
            _accountingRepo,
            _activedRoute,
            _cd);
        this._progressRef = this._ngProgressService.ref();

    }

    getPartner() {
        this._store.dispatch(LoadListPartnerForKeyInSurcharge(
            { office: this.hbl?.officeId, salemanId: this.hbl.saleManId, service: this.serviceTypeId })
        );
        this._store.select(getPartnerForKeyingChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((partners: any[]) => {
                this.listPartner = partners;
            });
    }

    getCurrency() {
        this._store.dispatch(new GetCatalogueCurrencyAction());
        this.listCurrency = this._store.select(getCatalogueCurrencyState);
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

    getSurcharge() {
        this._store.select(fromStore.getSellingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    if (this.isDuplicateJob) {
                        buyings.forEach(s => s.linkFee = null);
                    }
                    this.charges = buyings;
                    this._cd.markForCheck();
                }
            );
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
            { title: 'Fee Type', field: 'chargeGroup', sortable: true },
            { title: 'SOA', field: 'soano', sortable: true },
            { title: 'Debit Note', field: 'cdno', sortable: true },
            // { title: 'Settle Payment', field: 'settlementCode', sortable: true },
            { title: 'Exchange Rate Date', field: 'exchangeDate', sortable: true },
            { title: 'Final Exchange Rate', field: 'finalExchangeRate', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Voucher ID Date', field: 'voucherIddate', sortable: true },
            { title: 'Net Amount', field: 'netAmount', sortable: true },
            { title: 'Payment Status', field: 'paymentStatus', sortable: true },
            { title: 'Paid Date', field: 'paidDate', sortable: true },
        ];
    }

    getCharge() {
        this.listCharges$ = this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceTypeId, type: CommonEnum.CHARGE_TYPE.DEBIT })
        // .subscribe(
        //     (charges: Charge[]) => {
        //         this.listCharges = charges;
        //     }
        // );
    }

    saveSellingSurCharge() {
        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }


        // * Update data
        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }

        if (!this.checkDuplicate()) {
            return;
        }

        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
        this._documentRepo.addShipmentSurcharges(this.charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success(result.message);

                        this.getProfit();

                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                    } else {
                        this._toastService.error(result.message);
                    }
                }
            );
    }

    syncFreightCharge() {
        this._progressRef.start();

        this._documentRepo.getArrivalInfo(this.hbl.id, CommonEnum.TransactionTypeEnum.SeaFCLImport)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        if (!res.csArrivalFrieghtCharges.length) {
                            this._toastService.warning("Not found freight charge");
                        } else {
                            for (const freightCharge of res.csArrivalFrieghtCharges) {
                                const newSurCharge: CsShipmentSurcharge = new CsShipmentSurcharge(freightCharge);
                                newSurCharge.id = SystemConstants.EMPTY_GUID;
                                newSurCharge.exchangeDate = { startDate: new Date(), endDate: new Date() };
                                newSurCharge.invoiceDate = null;
                                newSurCharge.hblno = this.hbl.hwbno || null;
                                newSurCharge.mblno = this.getMblNo(this.shipment, this.hbl);
                                newSurCharge.jobNo = this.shipment.jobNo || null;

                                // * Default get partner = customer name's hbl.
                                newSurCharge.partnerShortName = this.hbl.customerName;
                                newSurCharge.paymentObjectId = this.hbl.customerId;

                                this._store.dispatch(new fromStore.AddSellingSurchargeAction(newSurCharge));
                            }
                        }
                    }
                }
            );
    }

    syncBuyingCharge() {
        this._store.select(fromStore.getBuyingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    if (!buyings.length) {
                        this._toastService.warning("Not found buying charge");
                        return;
                    }

                    const buyingCharges: CsShipmentSurcharge[] = cloneDeep(buyings);

                    // * update debit charge to chargeId
                    buyingCharges.forEach(c => {
                        c.chargeId = c.debitCharge;
                        c.id = SystemConstants.EMPTY_GUID;
                        c.type = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
                        c.invoiceDate = null;
                        c.creditNo = null;
                        c.debitNo = null;
                        c.settlementCode = null;
                        c.voucherId = null;
                        c.voucherIddate = null;
                        c.voucherIdre = null;
                        c.voucherIdredate = null;
                        c.isFromShipment = true;
                        c.invoiceNo = null;
                        c.invoiceDate = null;
                        c.finalExchangeRate = null;
                        c.acctManagementId = null;
                        c.kickBack = null;
                        c.paySoano = null;
                        c.syncedFrom = null;
                        // Mặc định lấy customer name của HBL
                        c.paymentObjectId = this.service === 'logistic' ? this.shipment.customerId : this.hbl.customerId;
                        c.partnerName = this.service === 'logistic' ? this.shipment.customerName : this.hbl.customerName;
                        c.partnerShortName = this.service === 'logistic' ? this.shipment.customerName : this.hbl.customerName;
                        c.exchangeDate = { startDate: new Date(), endDate: new Date() };
                        this._store.dispatch(new fromStore.AddSellingSurchargeAction(c));
                    });

                    // this.charges = [...this.charges, ...buyingCharges];
                }
            );
    }

    getSaveLinkFee() {
        let isSubmitted = this.charges.filter(x => x.id == "00000000-0000-0000-0000-000000000000");
        if (isSubmitted.length) {
            this._toastService.warning("Please save charge");
            return;
        }
        let links = this.charges.filter(x => x.isSelected);
        if (!links.length) {
            this._toastService.warning("Please select charge");
            return;
        }
        links.forEach((e) => {
            if (e.linkFee) {
                this._toastService.warning("Select charge have linked");
                return;
            }
        })
        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }

        if (!this.checkValidate()) {
            return;
        }

        if (!this.checkDuplicate()) {
            return;
        }
        if (!this.shipment.serviceNo) {
            this._toastService.warning("Please linked job");
            return;
        }

        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Alert',
            body: this.messageConfirmLinkFee,
            labelConfirm: 'Yes',
            classConfirmButton: 'btn-warning',
            iconConfirm: 'la la-trash',
            center: true
        }, () => this.onConfirmLinkFee())
    }

    onConfirmLinkFee() {
        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
        let links = this.charges.filter(x => x.isSelected);
        this._documentRepo.updateShipmentSurchargesLinkFee(links)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success("Fee Have Linked Success");
                        this.getProfit();
                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                    } else {
                        links.forEach(e => e.linkFee = false);
                        this._toastService.error(result.message);
                    }
                }
            );
    }
    onConfirmRevertLinkFee(selectedCs: CsShipmentSurcharge) {
        let charges = [];
        selectedCs.linkFee = false;
        charges.push(selectedCs);
        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
        this._documentRepo.updateShipmentSurchargesLinkFee(charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success("Fee Have Revert Linked Success");
                        this.getProfit();
                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                    } else {
                        this._toastService.error(result.message);
                    }
                }
            );
    }
    onSelectSurcharge(cs: CsShipmentSurcharge) {
        this.selectedCs = cs;

        const qContextMenuList = this.queryListMenuContext.toArray();
        if (!!qContextMenuList.length) {
            qContextMenuList.forEach((c: ContextMenuDirective) => c.close());
        }
    }

    revertFeeSell(selectedCs: CsShipmentSurcharge) {
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
        }, () => this.onConfirmRevertLinkFeeSell(selectedCs))
    }

    onConfirmRevertLinkFeeSell(selectedCs: CsShipmentSurcharge) {
        let charges = [];
        charges.push(selectedCs);
        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
        this._documentRepo.revertShipmentSurchargesLinkFee(charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success("Fee Have Revert Linked Success");
                    } else {
                        this._toastService.error(result.message);
                    }
                    this.getProfit();
                    this.getSurcharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                }
            );
    }
}
