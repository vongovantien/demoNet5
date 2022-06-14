import { Component, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { takeUntil, finalize } from 'rxjs/operators';
import { AppList } from '@app';
import { Surcharge, Partner, SysImage } from '@models';
import { SortService, DataService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { CommonEnum } from '@enums';
import { delayTime } from '@decorators';
import { DocumentationRepo, AccountingRepo } from '@repositories';
import { ReportPreviewComponent } from '@common';
import { InjectViewContainerRefDirective } from '@directives';
import { ICrystalReport } from '@interfaces';

import { SettlementExistingChargePopupComponent } from '../popup/existing-charge/existing-charge.popup';
import { SettlementFormChargePopupComponent } from '../popup/form-charge/form-charge.popup';
import { SettlementPaymentManagementPopupComponent } from '../popup/payment-management/payment-management.popup';
import { SettlementTableSurchargeComponent } from '../table-surcharge/table-surcharge.component';
import { SettlementShipmentItemComponent, ISettlementShipmentGroup } from '../shipment-item/shipment-item.component';
import { SettlementFormCopyPopupComponent } from '../popup/copy-settlement/copy-settlement.popup';
import { SettlementTableListChargePopupComponent } from '../popup/table-list-charge/table-list-charge.component';
import { SettlementChargeFromShipmentPopupComponent } from '../popup/charge-from-shipment/charge-form-shipment.popup';
import { SettlementShipmentAttachFilePopupComponent } from './../popup/shipment-attach-files/shipment-attach-file-settlement.popup';

import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISettlementPaymentState, getSettlementPaymentDetailLoadingState, getSettlementPaymentDetailState } from '../store';
import { Store } from '@ngrx/store';
import { SystemConstants } from '@constants';
import { getCurrentUserState } from '@store';
@Component({
    selector: 'settle-payment-list-charge',
    templateUrl: './list-charge-settlement.component.html',
})

export class SettlementListChargeComponent extends AppList implements ICrystalReport {
    @Input() set readOnly(val: any) {
        this._readonly = coerceBooleanProperty(val);
    }

    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

    get readonly(): boolean {
        return this._readonly;
    }

    private _readonly: boolean = false;

    @ViewChild(SettlementExistingChargePopupComponent) existingChargePopup: SettlementExistingChargePopupComponent;
    @ViewChild(SettlementFormChargePopupComponent) formChargePopup: SettlementFormChargePopupComponent;
    @ViewChild(SettlementPaymentManagementPopupComponent) paymentManagementPopup: SettlementPaymentManagementPopupComponent;
    @ViewChild(SettlementFormCopyPopupComponent) copyChargePopup: SettlementFormCopyPopupComponent;
    @ViewChild(SettlementTableListChargePopupComponent) tableListChargePopup: SettlementTableListChargePopupComponent;
    @ViewChild(SettlementChargeFromShipmentPopupComponent) listChargeFromShipmentPopup: SettlementChargeFromShipmentPopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(SettlementShipmentAttachFilePopupComponent) shipmentFilePopup: SettlementShipmentAttachFilePopupComponent;
    @ViewChild(InjectViewContainerRefDirective) public reportContainerRef: InjectViewContainerRefDirective;

    @ViewChildren('tableSurcharge') tableSurchargeComponent: QueryList<SettlementTableSurchargeComponent>;
    @ViewChildren('headingShipmentGroup') headingShipmentGroup: QueryList<SettlementShipmentItemComponent>;

    groupShipments: ISettlementShipmentGroup[] = [];
    headers: CommonInterface.IHeaderTable[];

    surcharges: Surcharge[] = [];
    selectedSurcharge: Surcharge = new Surcharge();
    selectedIndexSurcharge: number;

    stateFormCharge: string = 'create';

    openAllCharge: BehaviorSubject<boolean> = new BehaviorSubject(false);
    settlementCode: string = '';

    TYPE: string = 'LIST';
    STATE: string = 'WRITE';  // * list'state READ/WRITE

    isShowButtonCopyCharge: boolean = false;
    isDirectSettlement: boolean = false;
    isExistingSettlement: boolean = false;
    requester: string = '';
    selectedGroupShipmentIndex: number;

    detailSettlement: Observable<any>;

    isLoadingSurchargeList: boolean = false;
    isLoadingGroupShipment: boolean = false;
    constructor(
        private readonly _sortService: SortService,
        private readonly _toastService: ToastrService,
        private readonly _documenRepo: DocumentationRepo,
        private readonly _dataService: DataService,
        private readonly _store: Store<ISettlementPaymentState>,
        private readonly _accountingRepo: AccountingRepo
    ) {
        super();
    }


    ngOnInit() {
        this.headers = [
            { title: 'JobId - HBL - MBL', field: 'jobId', sortable: true, width: 200 },
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'Qty', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unitName', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Amount', field: 'total', sortable: true },
            { title: 'Net Amount VND', field: 'amountVnd', sortable: true },
            { title: 'VAT Amount VND', field: 'vatAmountVnd', sortable: true },
            { title: 'Amount VND', field: '', sortable: true },
            { title: 'Payee', field: 'payer', sortable: true },
            { title: 'OBH Partner', field: 'obhPartnerName', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Series No', field: 'seriesNo', sortable: true },
            { title: 'Inv Date', field: 'invoiceDate', sortable: true },
            { title: 'VAT Partner', field: 'vatPartnerShortName', sortable: true },
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'Cont No', field: 'contNo', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Synced From', field: 'syncFrom', sortable: true },
        ];
        this.selectedSurcharge = this.surcharges[0];

        this.subscriptionDuplicateChargeState();

        this.isLoading = this._store.select(getSettlementPaymentDetailLoadingState);
        this.detailSettlement = this._store.select(getSettlementPaymentDetailState);
    }

    showExistingCharge() {
        this.existingChargePopup.requester = this.getUserId(this.requester);
        this.existingChargePopup.allowUpdate = this.checkAllowUpdateExistingCharge();
        this.existingChargePopup.settlementCode = this.settlementCode || null;
        this.existingChargePopup.show();
    }

    getUserId(userId: string) {
        if (userId === 'undefined' || !userId) {
            this._store.select(getCurrentUserState).pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((res: any) => {
                    if (!!res) {
                        userId = res.id;
                    }
                })
        }
        this.requester = userId;
        return userId;
    }

    showCreateCharge() {
        this.tableListChargePopup.isSubmitted = false;
        this.tableListChargePopup.isUpdate = false;
        this.tableListChargePopup.formGroup.reset();
        this.tableListChargePopup.initTableListCharge();
        this.tableListChargePopup.settlementCode = this.settlementCode || null;
        this.tableListChargePopup.show();
    }

    onRequestSurcharge(surcharge: Surcharge[], isCopy?: boolean) {
        if (surcharge[0].isFromShipment) {
            this.surcharges = this.surcharges.filter((item: any) => surcharge.map((chg: Surcharge) => chg.id).indexOf(item.id) === -1);
            this.surcharges = [...this.surcharges, ...surcharge];
            this.surcharges.forEach(x => x.isSelected = false);
        } else {
            this.surcharges = [...this.surcharges, ...surcharge];
            this.surcharges.forEach(x => x.isSelected = false);
        }

        this.TYPE = 'LIST'; // * SWITCH UI TO LIST
        if (this.tableListChargePopup.charges.length > 0) {
            this.isDirectSettlement = true;
            this.isExistingSettlement = false;
            this.isShowButtonCopyCharge = true;
        }
        if (this.existingChargePopup.selectedCharge.length > 0) {
            this.isExistingSettlement = true;
            this.isDirectSettlement = false;
            this.isShowButtonCopyCharge = false;
            this.groupShipments.forEach((groupItem: any) => {
                if (groupItem.hblId === surcharge[0].hblid) {
                    groupItem.chargeSettlements.map((charge: Surcharge) => {
                        const chargeInList = this.surcharges.filter((x: Surcharge) => x.id === charge.id).shift();
                        charge.amountVnd = chargeInList.amountVnd;
                        charge.vatAmountVnd = chargeInList.vatAmountVnd;
                    })
                    groupItem.totalAmount = groupItem.chargeSettlements.reduce((net: number, charge: Surcharge) => net += (charge.amountVnd + charge.vatAmountVnd), 0);
                }
            })
        }
        // ? Flag for Copy charge.
        if (isCopy == true) {
            this.isDirectSettlement = true;
            this.isExistingSettlement = false;
        }
        if (surcharge[0].isFromShipment) {
            this.onChange.emit(true);
        }
    }

    onUpdateSurchargeFromTableChargeList(charges: Surcharge[]) {
        if (charges.length) {
            this.selectedIndexSurcharge = -1;

            const surchargeFromShipment = this.surcharges.filter(x => x.isFromShipment);
            const surchargeHasSynced = this.surcharges.filter(x => !x.hasNotSynce);
            const hblIds: string[] = charges.map(x => x.hblid);
            if (charges[0].isChangeShipment) {
                const chargeMarkedChangeShipment = this.surcharges.filter(x => x.isChangeShipment === false && !x.isFromShipment && x.hasNotSynce);
                this.surcharges = [...chargeMarkedChangeShipment];
                // this.surcharges = this.surcharges.filter(x => hblIds.indexOf(x.hblid));
            } else {
                const chargeIds: string[] = charges.map(x => x.id);

                this.surcharges = this.surcharges.filter(x => hblIds.indexOf(x.hblid) === -1 && chargeIds.indexOf(x.jobId) === -1 && !x.isFromShipment && x.hasNotSynce);
            }

            this.surcharges = [...charges, ...this.surcharges, ...surchargeFromShipment, ...surchargeHasSynced];
            this.surcharges.forEach(c => c.isChangeShipment = undefined)

        }
    }
    onUpdateRequestSurcharge(surcharge: any) {
        this.TYPE = 'LIST'; // * SWITCH UI TO LIST
        this.surcharges[this.selectedIndexSurcharge] = surcharge;
        this.surcharges = [...this.surcharges];

        if (this.formChargePopup.isContinue) {
            // * Update next charge.
            this.openSurchargeDetail(this.surcharges[this.selectedIndexSurcharge + 1], this.selectedIndexSurcharge + 1, 'update');
        }
    }

    openSurchargeDetail(surcharge: Surcharge, index?: number, action?: string) {
        if (this.STATE !== 'WRITE') {
            return;
        } else {
            // * CHECK SURCHARGE IS FROM SHIPMENT.
            if (!surcharge) {
                return;
            } else if (this.TYPE === 'LIST') {
                this.selectedIndexSurcharge = index;
            } else {
                const indexSurcharge: number = this.surcharges.findIndex(item => item.id === surcharge.id);
                if (indexSurcharge !== - 1) {
                    this.selectedIndexSurcharge = indexSurcharge;
                }
            }
            if (surcharge.linkChargeId) {
                this._toastService.warning('Charge already linked charge');
                return;
            }
            if(!surcharge.hasNotSynce){
                this._toastService.warning('Charge already synced');
                return;
            }
            this.selectedSurcharge = surcharge;
            this.selectedSurcharge.invoiceDate = !this.selectedSurcharge.invoiceDate ? null : new Date(this.selectedSurcharge.invoiceDate);

            this.stateFormCharge = 'update';

            this.formChargePopup.action = action;
            this.formChargePopup.settlementCode = this.selectedSurcharge.settlementCode;
            this.formChargePopup.initFormUpdate(this.selectedSurcharge);
            this.formChargePopup.calculateTotalAmount();

            this.formChargePopup.isFromshipment = surcharge.isFromShipment;
            /*
                Phí hiện trường của lô lock | phí OBH đã sync đầu thu
                ? thì logic không cho edit các field giống phí chứng từ.
            */
            this.formChargePopup.isLocked = surcharge.isLocked;
            this.formChargePopup.isSynced = !!surcharge.syncedFromBy;
            this.formChargePopup.show();
        }
    }

    changeCurrency(currency: string) {
        this.tableListChargePopup.currencyId = currency || 'VND';
    }

    returnShipmet(item: any) {
        return item.shipment.jobId;
    }

    onClickHeadingShipment(data: any): boolean {

        this.paymentManagementPopup.getDataPaymentManagement(data.jobId, data.hbl, data.mbl, this.requester);

        this.showPaymentManagementPopup();
        return false;
    }

    // * Handle checkbox from heading
    onCheckBoxShipmentItemInGroupShipment(isCheck: boolean, indexShipmentItem: number): any {
        const tableChargeChildComponent: SettlementTableSurchargeComponent[] = this.tableSurchargeComponent.toArray();
        tableChargeChildComponent[indexShipmentItem].isCheckAll = isCheck;
        tableChargeChildComponent[indexShipmentItem].checkUncheckAllCharge();

        this.groupShipments[indexShipmentItem].isSelected = true;
    }

    // * Handle checkbox from listCharge in group.
    onChangeCheckBoxSurChargeListInGroupShipment(isCheckAll: boolean, indexShipmentItem: number) {
        const headingShipmentComponent: SettlementShipmentItemComponent[] = this.headingShipmentGroup.toArray();
        headingShipmentComponent[indexShipmentItem].isCheckAll = isCheckAll;
    }

    deleteShipmentItem() {
        if (this.TYPE === 'GROUP') {
            this.surcharges = [];
            const lastGroupShipment: any[] = this.groupShipments.filter((groupItem: any) => !groupItem.isSelected);
            for (const groupShipment of this.groupShipments) {
                const chargeIssue = groupShipment.chargeSettlements.filter((chg: Surcharge) => chg.isSelected && chg.hadIssued && !chg.isFromShipment);
                if(!!chargeIssue.length){
                    this._toastService.warning('Charge already issued CDNote/Soa/Voucher cannot be delete.');
                    return;
                }

                let checks : any[] = groupShipment.chargeSettlements.filter((x:any)=>x.isSelected && x.linkChargeId);
                if(!!checks.length){
                    this._toastService.warning('Charge already linked charge');
                    return;
                }
                groupShipment.chargeSettlements = this.returnChargeFromShipment(groupShipment);
            }

            // * UPDATE SURCHARGE LIST.
            for (const groupShipmentItem of lastGroupShipment) {
                this.surcharges.push(...groupShipmentItem.chargeSettlements);
            }

            // * UPDATE GROUP SHIPMENT LIST
            this.groupShipments = this.groupShipments.filter((groupItem: any) => groupItem.chargeSettlements.length);
        } else {
            const surchargeSelected: Surcharge[] = this.surcharges.filter((surcharge: Surcharge) => surcharge.isSelected);
            const chargeIssue = surchargeSelected.filter((chg: Surcharge) => chg.hadIssued && !chg.isFromShipment);
            if(!!chargeIssue.length){
                this._toastService.warning('Charge already issued CDNote/Soa/Voucher cannot be delete.');
                return;
            }
            
            let checkChargeLinks: Surcharge[] = surchargeSelected.filter((surcharge: Surcharge) => surcharge.linkChargeId);
            if (!!checkChargeLinks.length) {
                this._toastService.warning('Charge already linked charge');
                return;
            }

            if (!!surchargeSelected.length) {
                this.surcharges = this.surcharges.filter((surcharge: Surcharge) => !surcharge.isSelected);
            } else {
                this._toastService.warning(`Don't have any charges in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
                return;
            }
        }
        const headingShipmentComponent: SettlementShipmentItemComponent[] = this.headingShipmentGroup.toArray();

        // * Reset check all in heading shipment group.
        for (const item of headingShipmentComponent) {
            item.isCheckAll = false;
        }
    }

    returnChargeFromShipment(groupShipment: any) {
        return groupShipment.chargeSettlements.filter((surcharge: Surcharge) => !surcharge.isSelected);
    }

    sortSurcharge(sortData: any) {
        this.surcharges = this._sortService.sort(this.surcharges, sortData.sortField, sortData.order);
    }

    checkUncheckAllCharge() {
        for (const charge of this.surcharges) {
            if (this.isCheckAll) {
                if (charge.isFromShipment) {
                    charge.isSelected = true;
                }
                if (!charge.isFromShipment && !charge.isLocked && charge.hasNotSynce) {
                    charge.isSelected = true;
                }
            } else {
                charge.isSelected = this.isCheckAll;
            }
        }
    }

    isFromShipmentLocked = (charge: Surcharge) => {
        let isSelected;
        if (charge.isFromShipment) {
            isSelected = true;
        }
        if (!charge.isFromShipment && !charge.isLocked) {
            isSelected = true;
        }
        return isSelected
    }

    onChangeCheckBoxCharge() {
        this.isCheckAll = this.surcharges.filter(x => x.isFromShipment || (!x.isFromShipment && !x.isLocked)).every((item: Surcharge) => item.isSelected)
    }

    showPaymentManagement(surcharge: Surcharge) {
        this.paymentManagementPopup.getDataPaymentManagement(surcharge.jobId, surcharge.hbl, surcharge.mbl, this.requester);
        this.showPaymentManagementPopup();
    }

    openCopySurcharge(surcharge: Surcharge) {
        if (this.STATE !== 'WRITE' || surcharge.isLocked) { return; }
        this.formChargePopup.selectedSurcharge = surcharge;
        this.openSurchargeDetail(surcharge, null, 'copy');
    }

    switchToGroup() {
        if (this.TYPE === 'GROUP') {
            this.TYPE = 'LIST';
            if (!!this.surcharges.length) {
                return;
            }
            if (!!this.settlementCode) {
                this.isLoadingSurchargeList = true;
                this._accountingRepo.getListSurchargeDetailSettlement(this.settlementCode)
                    .pipe(finalize(() => this.isLoadingSurchargeList = false))
                    .subscribe(
                        (surcharges: Surcharge[]) => {
                            this.surcharges = surcharges;
                        }
                    )

            }
        } else {
            this.TYPE = 'GROUP';
            if (!!this.groupShipments.length) {
                return;
            }
            if (!!this.settlementCode) {
                this.isLoadingGroupShipment = true;
                this._accountingRepo.getListJobGroupSurchargeDetailSettlement(this.settlementCode)
                    .pipe(finalize(() => this.isLoadingGroupShipment = false))
                    .subscribe(
                        (data: any) => {
                            this.groupShipments = data || [];

                            this.selectedIndexSurcharge = null;
                            if (this.isExistingSettlement === true) {
                                this.groupShipments.forEach((groupItem: any) => {
                                    groupItem.chargeSettlements.map((charge: Surcharge) => {
                                        const chargeInList = this.surcharges.filter((x: Surcharge) => x.id === charge.id).shift();
                                        charge.amountVnd = chargeInList.amountVnd;
                                        charge.vatAmountVnd = chargeInList.vatAmountVnd;
                                    })
                                })
                            }
                        });
            }
        }
    }

    showCopyCharge() {
        this.copyChargePopup.show();
    }

    checkAllowUpdateExistingCharge() {
        const userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        const allowUpdate = this.STATE === 'WRITE' && userLogged.id === this.requester;
        return allowUpdate;
    }

    updateChargeWithJob(charge: Surcharge, index?: number) {

        if (this.STATE !== 'WRITE') { return; }
        this.selectedIndexSurcharge = index;
        if (!charge) {
            return;
        }
        if (charge.linkChargeId) {
            this._toastService.warning('Charge already linked charge');
            return;
        }
        if(!charge.hasNotSynce){
            this._toastService.warning('Charge already synced');
            return;
        }

        if (charge.isFromShipment) {
            const surchargesFromShipment: Surcharge[] = this.surcharges.filter((surcharge: Surcharge) => surcharge.hblid === charge.hblid && surcharge.isFromShipment);

            // this.listChargeFromShipmentPopup.charges = cloneDeep(surchargesFromShipment);
            // this.listChargeFromShipmentPopup.show();
            this.existingChargePopup.requester = this.requester;
            this.existingChargePopup.getDetailShipmentOfSettle(cloneDeep(surchargesFromShipment));
            this.existingChargePopup.state = 'update';
            this.existingChargePopup.allowUpdate = this.checkAllowUpdateExistingCharge();
            this.existingChargePopup.requester = this.requester;
            this.existingChargePopup.settlementCode = this.settlementCode || null;
            this.existingChargePopup.show();
        } else {
            const shipment = this.tableListChargePopup.shipments.find(s => s.jobId === charge.jobId && s.hbl === charge.hbl && s.mbl === charge.mbl);
            if (!!shipment) {
                this.tableListChargePopup.selectedShipment = shipment;
                this.tableListChargePopup.settlementCode = this.settlementCode || null;

                // * Filter charge with hblID.
                const surcharges: Surcharge[] = this.surcharges.filter((surcharge: Surcharge) => surcharge.hblid === charge.hblid && !surcharge.isFromShipment && surcharge.hasNotSynce);
                if (!!surcharges.length) {
                    const hblIds: string[] = surcharges.map(x => x.hblid);

                    this.surcharges.forEach(x => {
                        if (hblIds.indexOf(x.hblid)) {
                            x.isChangeShipment = false; //  * Mark item is editing.
                        }
                    });

                    this.tableListChargePopup.charges = cloneDeep(surcharges);

                    this.tableListChargePopup.charges.forEach(item => {
                        item.isDuplicate = false; // * Reset duplicate state
                        item.isSelected = true;

                        if (item.type.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase()) {
                            // get partner theo payerId.
                            const partner: Partner = this.tableListChargePopup.listPartner.find(p => p.id === item.payerId);
                            if (!!partner) {
                                // swap để map field cho chage obh
                                item.payer = partner.shortName;
                                item.obhId = item.paymentObjectId;
                                item.paymentObjectId = item.payerId;
                            }
                        } else {
                            // get partner theo paymentObjectId.
                            const partner: Partner = this.tableListChargePopup.listPartner.find(p => p.id === item.paymentObjectId);
                            if (!!partner) {
                                item.payer = partner.shortName;
                            }
                        }

                        if (!!item.invoiceDate && typeof item.invoiceDate === 'string') {
                            item.invoiceDate = { startDate: new Date(item.invoiceDate), endDate: new Date(item.invoiceDate) };
                        }
                    });
                    if (!!this.settlementCode) {
                        this.tableListChargePopup.getAdvances(shipment.jobId, shipment.hblid, !!charge.advanceNo, this.settlementCode);

                    } else {
                        this.tableListChargePopup.getAdvances(shipment.jobId, shipment.hblid, !!charge.advanceNo);
                    }

                    const selectedCD = this.tableListChargePopup.cds.find(x => x.clearanceNo === surcharges[0].clearanceNo);
                    if (!!selectedCD) {
                        this.tableListChargePopup.selectedCD = selectedCD;
                    }
                    // * Update value form.
                    this.tableListChargePopup.formGroup.patchValue({
                        shipment: shipment.hblid,
                        advanceNo: !!charge.advanceNo ? charge.advanceNo : null,
                        customNo: !!surcharges[0].clearanceNo ? surcharges[0].clearanceNo : null
                    });
                    this.tableListChargePopup.isUpdate = true;
                    this.tableListChargePopup.isSelected = true;
                    this.tableListChargePopup.show();
                }
            } else {
                // * Not found shipment in list PIC
                this._toastService.warning("Please check again!", 'Not found shipment');
            }
        }
    }

    onUpdateChargeFromShipment(surchargeFromShipment: Surcharge[]) {
        this.selectedIndexSurcharge = null;

        const surChargeisNotFromShipment = this.surcharges.filter(x => !x.isFromShipment);
        const hblidsSurchargefromshipmentUpdate = surchargeFromShipment.map(x => x.hblid);

        const surChargeFromShipmentAnother = this.surcharges.filter(x => x.isFromShipment && !hblidsSurchargefromshipmentUpdate.includes(x.hblid));

        this.surcharges.length = 0;
        this.surcharges = [...surChargeisNotFromShipment, ...surchargeFromShipment, ...surChargeFromShipmentAnother];

    }

    previewPLsheet(data: any, currency: string) {
        if (data.type === 'DOC') {
            this._documenRepo.previewSIFPLsheet(data.shipmentId, data.hblId, currency)
                .subscribe(
                    (res: any) => {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    },
                );
            return;
        }
        if (data.type === "OPS") {
            this._documenRepo.previewPL(data.shipmentId, currency)
                .subscribe(
                    (res: any) => {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    },
                );
            return;
        }
        if (data.typeService === "OPS") {
            this._documenRepo.previewPL(data.shipmentId, currency)
                .subscribe(
                    (res: any) => {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    },
                );
            return;
        } else {
            this._documenRepo.previewSIFPLsheet(data.shipmentId, data.hblid, currency)
                .subscribe(
                    (res: any) => {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    },
                );
            return;
        }

    }

    @delayTime(500)
    showPaymentManagementPopup() {
        this.paymentManagementPopup.show();
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.reportContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.reportContainerRef.viewContainerRef.clear();
            });
    }

    subscriptionDuplicateChargeState() {
        this._dataService.currentMessage
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (error: any) => {
                    if (error?.duplicateChargeSettlement?.data) {
                        let chargeDup: Partial<DuplicateShipmentSettlementResultModel> = {};
                        if (error?.duplicateChargeSettlement?.data?.length) {
                            chargeDup = error?.duplicateChargeSettlement?.data[0];
                        } else {
                            let errorData = error?.duplicateChargeSettlement?.data;
                            chargeDup.chargeId = errorData?.chargeId;
                            chargeDup.jobNo = errorData?.jobId;
                            chargeDup.mblNo = errorData?.mbl;
                            chargeDup.hblNo = errorData?.hbl;
                        }
                        this.surcharges.forEach(c => {
                            if ((c.jobNo || c.jobId) === chargeDup.jobNo
                                && (c.mblno || c.mbl) === chargeDup.mblNo
                                && (c.hblno || c.hbl) === chargeDup.hblNo
                                && (c.chargeId) === chargeDup.chargeId) {
                                c.isDuplicate = true;
                            } else {
                                c.isDuplicate = false;
                            }
                        })
                    }
                }
            )
    }

    viewShipmentAttachFile(index: number) {
        this.selectedGroupShipmentIndex = index;
        this.shipmentFilePopup.shipmentGroups = this.groupShipments[index];
        this.shipmentFilePopup.files = this.shipmentFilePopup.shipmentGroups.files;

        this.shipmentFilePopup.show();

    }

    onChangeShipmentGroupAttachFile(files: SysImage[]) {
        if (this.selectedGroupShipmentIndex !== -1) {
            this.groupShipments[this.selectedGroupShipmentIndex].files.length = 0;
            const oldData = this.groupShipments[this.selectedGroupShipmentIndex];
            oldData.files = Array.from(files);

            this.groupShipments[this.selectedGroupShipmentIndex] = JSON.parse(JSON.stringify(oldData));  // ? Clone data

        }
    }
}

interface DuplicateShipmentSettlementResultModel {
    jobNo: string;
    jobId?: string;
    mblNo: string;
    hblNo: string;
    chargeId: string;
}


