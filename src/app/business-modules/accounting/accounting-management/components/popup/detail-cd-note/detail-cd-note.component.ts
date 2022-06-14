import { Component, OnInit, ViewChild } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { DocumentationRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ReportPreviewComponent, ConfirmPopupComponent } from '@common';
import { Crystal } from '@models';
import { ToastrService } from 'ngx-toastr';
import { SortService } from '@services';
import { Store } from '@ngrx/store';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';
import { ShareModulesReasonRejectPopupComponent } from 'src/app/business-modules/share-modules/components';
import { NgxSpinnerService } from 'ngx-spinner';
import { ShareBussinessAdjustDebitValuePopupComponent } from 'src/app/business-modules/share-modules/components/adjust-debit-value/adjust-debit-value.popup';

@Component({
    selector: 'accounting-detail-cd-note',
    templateUrl: './detail-cd-note.component.html'
})
export class AccountingDetailCdNoteComponent extends PopupBase implements OnInit {
    @ViewChild(ReportPreviewComponent) reportPopup: ReportPreviewComponent;
    @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
    @ViewChild(ShareModulesReasonRejectPopupComponent) reasonRejectPopupComponent: ShareModulesReasonRejectPopupComponent;
    @ViewChild(ShareBussinessAdjustDebitValuePopupComponent) adjustDebitValuePopup: ShareBussinessAdjustDebitValuePopupComponent;

    cdnoteDetail: any = null;
    jobId: string = '';
    type: string = 'AIR';
    labelDetail: any = {
        subjectTo: 'Subject To',
        address: 'Address',
        tel: 'Tel',
        taxCode: 'Taxcode',
        hbl: 'HAWB/ HBL',
        jobId: 'JOB ID',
        mbl: 'MAWB/ MBL No',
        pol: 'A.O.L',
        pod: 'P.O.L',
        etd: 'ETD',
        eta: 'ETA',
        vessel: 'Flight',
        volume: 'Volume',
        packageQty: 'Package Quantity',
        soa: 'SOA',
        locked: 'Locked',
        note: 'Note',
        syncStatus: 'Sync Status',
        lastSync: 'Last Sync',
        currency: 'Currency',
        exchangeRate: 'Exc Rate',
        reasonReject: 'Reason Reject',
        saleman: 'Salesman'
    };
    airLabelDetail: any = {
        hbl: 'HAWB/ HBL',
        mbl: 'MAWB/ MBL No',
        pol: 'A.O.L',
        pod: 'P.O.L',
        etd: 'ETD',
        eta: 'ETA',
        vessel: 'Flight'
    };
    seaLabelDetail = {
        hbl: 'House Bill of Lading',
        mbl: 'Master Bill of Lading',
        pol: 'Port of loading',
        pod: 'Port of destination',
        etd: 'Estimated Time of Departure',
        eta: 'Estimated Time of Arrival',
        vessel: 'Vessel'
    };
    headers = [
        { title: 'HAWB No', field: 'hwbno', sortable: true },
        { title: 'Code', field: 'chargeCode', sortable: true },
        { title: 'Charge Name', field: 'nameEn', sortable: true },
        { title: 'Quantity', field: 'quantity', sortable: true },
        { title: 'Unit', field: 'unit', sortable: true },
        { title: 'Unit Price', field: 'unitPrice', sortable: true },
        { title: 'Currency', field: 'currency', sortable: true },
        { title: 'VAT', field: 'vatrate', sortable: true },
        { title: "Credit Value", field: 'credit', sortable: true },
        { title: "Debit Value", field: 'debit', sortable: true },
        { title: 'Note', field: 'notes', sortable: true },
        { title: 'Exc Rate', field: 'exchangeRate', sortable: true },
        { title: 'Synced From', field: 'syncedFromBy', sortable: true }
    ];
    balanceAmount: string = '';
    totalCredit: string = '';
    totalDebit: string = '';
    cdNote: string = '';
    totalAdjustVND: string = '';

    confirmMessage: string = '';
    reasonReject: string = '';

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _store: Store<IAppState>,
        private _spinner: NgxSpinnerService,) {
        super();
        this.requestSort = this.sortChargeCdNote;
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
    }

    setDefault(refNo: string) {

        if (refNo.includes('AE') || refNo.includes('AI')) {
            this.type = 'AIR';
            this.labelDetail.hbl = this.airLabelDetail.hbl;
            this.labelDetail.mbl = this.airLabelDetail.mbl;
            this.labelDetail.pol = this.airLabelDetail.pol;
            this.labelDetail.pod = this.airLabelDetail.pod;
            this.labelDetail.etd = this.airLabelDetail.etd;
            this.labelDetail.eta = this.airLabelDetail.eta;
            this.labelDetail.vessel = this.airLabelDetail.vessel;
        } else {
            this.type = 'SEA';
            this.labelDetail.hbl = this.seaLabelDetail.hbl;
            this.labelDetail.mbl = this.seaLabelDetail.mbl;
            this.labelDetail.pol = this.seaLabelDetail.pol;
            this.labelDetail.pod = this.seaLabelDetail.pod;
            this.labelDetail.etd = this.seaLabelDetail.etd;
            this.labelDetail.eta = this.seaLabelDetail.eta;
            this.labelDetail.vessel = this.seaLabelDetail.vessel;
        }
    }
    getDetailCdNote(jobId: string, cdNote: any) {
        this._documentationRepo.getDetailsCDNote(jobId, cdNote)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (dataCdNote: any) => {
                    dataCdNote.listSurcharges.forEach(element => {
                        element.debit = (element.type === 'SELL' || (element.type === 'OBH' && dataCdNote.partnerId === element.paymentObjectId)) ? element.total : null;
                        element.credit = (element.type === 'BUY' || (element.type === 'OBH' && dataCdNote.partnerId === element.payerId)) ? element.total : null;
                        element.adjustVND = element.amountVnd + element.vatAmountVnd;

                    });
                    this.cdnoteDetail = dataCdNote;
                    if (this.cdnoteDetail.cdNote.type == "DEBIT") {
                        this.headers = [
                            { title: 'HAWB No', field: 'hwbno', sortable: true },
                            { title: 'Code', field: 'chargeCode', sortable: true },
                            { title: 'Charge Name', field: 'nameEn', sortable: true },
                            { title: 'Quantity', field: 'quantity', sortable: true },
                            { title: 'Unit', field: 'unit', sortable: true },
                            { title: 'Unit Price', field: 'unitPrice', sortable: true },
                            { title: 'Currency', field: 'currency', sortable: true },
                            { title: 'VAT', field: 'vatrate', sortable: true },
                            { title: "Credit Value", field: 'credit', sortable: true },
                            { title: "Debit Value", field: 'debit', sortable: true },
                            { title: 'Total VND', field: 'totalVND', sortable: true },
                            { title: 'Total USD', field: 'totalUSD', sortable: true },
                            { title: 'Note', field: 'notes', sortable: true },
                            { title: 'Exc Rate', field: 'exchangeRate', sortable: true },
                            { title: 'Synced From', field: 'syncedFromBy', sortable: true }
                        ];
                    }
                    // Tính toán Amount Credit, Debit, Balance
                    this.calculatorAmount();
                },
            );
    }
    calculatorAmount() {
        // List currency có trong listCharges
        const listCurrency = [];
        const listCharge = [];
        for (const currency of this.cdnoteDetail.listSurcharges.map(m => m.currencyId)) {
            listCurrency.push(currency);
        }
        for (const charge of this.cdnoteDetail.listSurcharges) {
            listCharge.push(charge);
        }
        // List currency unique
        const uniqueCurrency = [...new Set(listCurrency)]; // Remove duplicate
        this.totalCredit = '';
        this.totalDebit = '';
        this.balanceAmount = '';
        this.totalAdjustVND = '';
        const adjustVND = listCharge.reduce((adjustVND, charge) => adjustVND + charge.adjustVND, 0);
        this.totalAdjustVND += this.formatNumberCurrency(adjustVND) + ' ' + 'VND';
        for (const currency of uniqueCurrency) {
            const _credit = listCharge.filter(f => f.currencyId === currency).reduce((credit, charge) => credit + charge.credit, 0);
            const _debit = listCharge.filter(f => f.currencyId === currency).reduce((debit, charge) => debit + charge.debit, 0);
            const _balance = _debit - _credit;
            this.totalCredit += this.formatNumberCurrency(_credit) + ' ' + currency + ' | ';
            this.totalDebit += this.formatNumberCurrency(_debit) + ' ' + currency + ' | ';
            this.balanceAmount += (_balance > 0 ? this.formatNumberCurrency(_balance) : '(' + this.formatNumberCurrency(Math.abs(_balance)) + ')') + ' ' + currency + ' | ';
        }
        this.totalCredit += "]";
        this.totalDebit += "]";
        this.balanceAmount += "]";
        this.totalCredit = this.totalCredit.replace("| ]", "").replace("]", "");
        this.totalDebit = this.totalDebit.replace("| ]", "").replace("]", "");
        this.balanceAmount = this.balanceAmount.replace("| ]", "").replace("]", "");
    }
    formatNumberCurrency(input: number) {
        return input.toLocaleString(
            'en-US', // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
            { minimumFractionDigits: 3 }
        );
    }

    closePopup() {
        this.hide();
    }


    previewCdNote(data: string) {
        if (this.cdNote.includes('AE') || this.cdNote.includes('AI')) {
            this.previewAirCdNote(data);
        } else {
            this.previewSeaCdNote(data);
        }
    }

    previewSeaCdNote(data: string) {
        this._documentationRepo.previewSIFCdNote({ jobId: this.jobId, creditDebitNo: this.cdNote, currency: data })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            setTimeout(() => {
                                this.reportPopup.frm.nativeElement.submit();
                                this.reportPopup.show();
                            }, 1000);
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }
                },
            );
    }

    previewAirCdNote(data: string) {
        this._documentationRepo.previewAirCdNote({ jobId: this.jobId, creditDebitNo: this.cdNote, currency: data })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: Crystal) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
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

    sortChargeCdNote(sort: string): void {
        if (this.cdnoteDetail) {
            this.cdnoteDetail.listSurcharges = this._sortService.sort(this.cdnoteDetail.listSurcharges, sort, this.order);
        }
    }

    showPopupReason() {
        this.reasonRejectPopupComponent.show();
    }

    confirmReject() {
        this.confirmMessage = `Are you sure you want to reject credit note?`;
        this.confirmPopup.show();
    }

    onApplyReasonReject($event) {
        this.reasonReject = $event;
        this.confirmReject();
    }

    onConfirmed() {
        this.confirmPopup.hide();
        this.rejectCreditNote();
    }

    rejectCreditNote() {
        this._spinner.show();
        this._documentationRepo.RejectCreditNote({ id: this.cdnoteDetail.cdNote.id, reason: this.reasonReject })
            .pipe(
                finalize(() => this._spinner.hide()),
                catchError(this.catchError),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    console.log(res);
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success(res.message);
                        this.getDetailCdNote(this.cdnoteDetail.jobId, this.cdnoteDetail.cdNote.code);
                    } else {
                        this._toastService.error(res.message);
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    adjustDebitValue() {
        this.adjustDebitValuePopup.action = 'DEBIT';
        this.adjustDebitValuePopup.jodId = this.jobId;
        this.adjustDebitValuePopup.cdNote = this.cdNote;
        this.adjustDebitValuePopup.active();
    }
    onSaveAdjustDebit() {
        this.getDetailCdNote(this.jobId, this.cdNote);
    }
}
