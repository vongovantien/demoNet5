import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SortService } from 'src/app/shared/services';
import { DocumentationRepo, ExportRepo, AccountingRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { catchError, switchMap, filter, takeUntil } from 'rxjs/operators';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { OpsCdNoteAddPopupComponent } from '../ops-cd-note-add/ops-cd-note-add.popup';
import { AccountingConstants, SystemConstants } from '@constants';
import { ShareBussinessPaymentMethodPopupComponent } from 'src/app/business-modules/share-business/components/payment-method/payment-method.popup';
import { delayTime } from '@decorators';
import { InjectViewContainerRefDirective } from '@directives';
import { Store } from '@ngrx/store';
import { IAppState, getCurrentUserState } from '@store';
import { ShareBussinessAdjustDebitValuePopupComponent } from 'src/app/business-modules/share-modules/components/adjust-debit-value/adjust-debit-value.popup';
import { of } from 'rxjs';
@Component({
    selector: 'ops-cd-note-detail',
    templateUrl: './ops-cd-note-detail.popup.html'
})
export class OpsCdNoteDetailPopupComponent extends PopupBase {
    @ViewChild(OpsCdNoteAddPopupComponent) cdNoteEditPopupComponent: OpsCdNoteAddPopupComponent;
    @Output() onDeleted: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(ShareBussinessPaymentMethodPopupComponent) paymentMethodPopupComponent: ShareBussinessPaymentMethodPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) public viewContainerRef: InjectViewContainerRefDirective;
    @ViewChild(ShareBussinessAdjustDebitValuePopupComponent) adjustDebitValuePopup: ShareBussinessAdjustDebitValuePopupComponent;

    jobId: string = null;
    cdNote: string = null;
    typeConfirm: string = '';
    isHouseBillID: boolean = true;

    CdNoteDetail: any = null;
    totalCredit: string = '';
    totalDebit: string = '';
    totalAdjustVND: string = '';
    balanceAmount: string = '';

    paymentMethodSelected: string = '';
    messageValidate: string;
    constructor(
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _accountantRepo: AccountingRepo,
        private _store: Store<IAppState>,
    ) {
        super();
        this.requestSort = this.sortChargeCdNote;
    }

    ngOnInit() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
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
    }

    getDetailCdNote(jobId: string, cdNote: string) {
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
                    this.CdNoteDetail = dataCdNote;
                    if (this.CdNoteDetail.cdNote.type == "DEBIT") {
                        this.headers = [
                            { title: 'HBL No', field: 'hwbno', sortable: true },
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
        for (const currency of this.CdNoteDetail.listSurcharges.map(m => m.currencyId)) {
            listCurrency.push(currency);
        }
        for (const charge of this.CdNoteDetail.listSurcharges) {
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

    checkDeleteCdNote(id: string) {
        this._documentationRepo.checkCdNoteAllowToDelete(id)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: `All related information will be lost? Are you sure you want to delete this Credit/Debit Note?`,
                            labelConfirm: 'Ok'
                        }, () => { this.deleteCdNote() });
                    } else {
                        this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: 'You can not delete this Credit/Debit Note. Please recheck!'
                        });
                    }
                },
            );
    }

    deleteCdNote() {
        this._documentationRepo.deleteCdNote(this.CdNoteDetail.cdNote.id)
            .subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.onDeleted.emit();
                        this.closePopup();
                    }
                },
            );
    }

    openPopupEdit() {
        this.cdNoteEditPopupComponent.action = 'update';
        this.cdNoteEditPopupComponent.selectedPartner = { field: "id", value: this.CdNoteDetail.partnerId };
        this.cdNoteEditPopupComponent.selectedNoteType = this.CdNoteDetail.cdNote.type;
        this.cdNoteEditPopupComponent.CDNote = this.CdNoteDetail.cdNote;
        this.cdNoteEditPopupComponent.currentMBLId = this.CdNoteDetail.jobId;
        this.cdNoteEditPopupComponent.note.setValue(this.CdNoteDetail.note);
        this.cdNoteEditPopupComponent.excRateUsdToLocal.setValue(this.CdNoteDetail.excRateUsdToLocal);
        this.cdNoteEditPopupComponent.getListCharges(this.CdNoteDetail.jobId, this.CdNoteDetail.partnerId, this.isHouseBillID, this.CdNoteDetail.cdNote.code);
        this.cdNoteEditPopupComponent.show();
    }

    onUpdateCdNote(dataRequest: any) {
        this.onDeleted.emit();
        this.getDetailCdNote(this.jobId, this.cdNote);
    }

    sortChargeCdNote(sort: string): void {
        if (this.CdNoteDetail) {
            this.CdNoteDetail.listSurcharges = this._sortService.sort(this.CdNoteDetail.listSurcharges, sort, this.order);
        }
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.viewContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.viewContainerRef.viewContainerRef.clear();
            });
    }

    preview(isOrigin: boolean) {
        this.CdNoteDetail.totalCredit = this.CdNoteDetail.listSurcharges.reduce((credit, charge) => credit + charge.credit, 0);
        this.CdNoteDetail.totalDebit = this.CdNoteDetail.listSurcharges.reduce((debit, charge) => debit + charge.debit, 0);
        let sourcePreview$;
        if (this.CdNoteDetail.cdNote.type === "DEBIT") {
            sourcePreview$ = this._documentationRepo.validateCheckPointContractPartner(this.CdNoteDetail.partnerId,
                this.CdNoteDetail.listSurcharges[0].hblid,
                'DOC',
                null,
                3).pipe(
                    switchMap((res: CommonInterface.IResult) => {
                        if (res.status) {
                            return this._documentationRepo.previewCDNote(this.CdNoteDetail, isOrigin);
                        }
                        this._toastService.warning(res.message);
                        return of(false);
                    })

                )
        } else {
            sourcePreview$ = this._documentationRepo.previewCDNote(this.CdNoteDetail, isOrigin);
        }
        sourcePreview$
            .subscribe(
                (res: any) => {
                    if (res !== false) {
                        if (res != null && res?.dataSource?.length > 0) {
                            this.dataReport = res;
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }
                },
            );
    }

    exportCDNote() {
        let sourcePreview$;
        if (this.CdNoteDetail.cdNote.type === "DEBIT") {
            sourcePreview$ = this._documentationRepo.validateCheckPointContractPartner(this.CdNoteDetail.partnerId,
                this.CdNoteDetail.listSurcharges[0].hblid,
                'DOC',
                null,
                3).pipe(
                    switchMap((res: CommonInterface.IResult) => {
                        if (res.status) {
                            return this._store.select(getCurrentUserState)
                                .pipe(
                                    filter((c: any) => !!c.userName),
                                    switchMap((currentUser: SystemInterface.IClaimUser) => {
                                        if (!!currentUser.userName) {
                                            return this._exportRepo.exportCDNote(this.CdNoteDetail.jobId, this.CdNoteDetail.cdNote.code, currentUser.officeId)
                                        }
                                    }),
                                    takeUntil(this.ngUnsubscribe),
                                );
                        }
                        this._toastService.warning(res.message);
                        return of(false);
                    })

                )
        } else {
            sourcePreview$ = this._store.select(getCurrentUserState)
                .pipe(
                    filter((c: any) => !!c.userName),
                    switchMap((currentUser: SystemInterface.IClaimUser) => {
                        if (!!currentUser.userName) {
                            return this._exportRepo.exportCDNote(this.CdNoteDetail.jobId, this.CdNoteDetail.cdNote.code, currentUser.officeId)
                        }
                    }),
                    takeUntil(this.ngUnsubscribe),
                );
        }
        sourcePreview$.subscribe(
            (response: any) => {
                if (response != null) {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                } else {
                    this._toastService.warning('No data found');
                }
            },
        );
    }

    confirmSendToAcc() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: 'Are you sure you want to send data to accountant system?',
            labelConfirm: 'Ok'
        }, () => {
            this.syncCdNote();
        });
    }

    showConfirmed() {
        this._accountantRepo.checkCdNoteSynced(this.CdNoteDetail.cdNote.id)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (res: any) => {
                    if (res) {
                        if (this.CdNoteDetail.cdNote.type !== 'CREDIT') {
                            this.messageValidate = "Existing charge has been synchronized to the accounting system or the charge has issue VAT invoices on eFMS! Please you check again!";
                        } else {
                            this.messageValidate = "Existing charge has been synchronized to the accounting system! Please you check again!";
                        }
                        this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: this.messageValidate
                        })

                    } else {
                        if (this.CdNoteDetail.cdNote.type === 'CREDIT' && this.CdNoteDetail.creditPayment === 'Direct') {
                            this.paymentMethodPopupComponent.show();
                        } else {
                            this.paymentMethodSelected = 'Other'; // CR 14979: 03-12-2020
                            this.confirmSendToAcc();
                        }
                    }
                },
            );
    }

    onApplyPaymentMethod($event) {
        this.paymentMethodSelected = $event;
        this.confirmSendToAcc();
    }

    syncCdNote() {
        const cdNoteIds: AccountingInterface.IRequestGuidType[] = [];
        const cdNoteId: AccountingInterface.IRequestGuidType = {
            Id: this.CdNoteDetail.cdNote.id,
            type: this.CdNoteDetail.cdNote.type,
            action: this.CdNoteDetail.cdNote.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
            paymentMethod: this.paymentMethodSelected
        };
        cdNoteIds.push(cdNoteId);
        this._accountantRepo.syncCdNoteToAccountant(cdNoteIds)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success("Send Data to Accountant System Successful");
                        this.getDetailCdNote(this.jobId, this.cdNote);
                        // Gọi onDelete để refresh lại list cd note
                        this.onDeleted.emit();
                    } else {
                        this._toastService.error("Send Data Fail");
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    previewCdNote(data: string) {
        let sourcePreview$;
        if (this.CdNoteDetail.cdNote.type === "DEBIT") {
            sourcePreview$ = this._documentationRepo.validateCheckPointContractPartner(this.CdNoteDetail.partnerId,
                this.CdNoteDetail.listSurcharges[0].hblid,
                'DOC',
                null,
                3).pipe(
                    switchMap((res: CommonInterface.IResult) => {
                        if (res.status) {
                            return this._documentationRepo.previewOPSCdNote({ jobId: this.jobId, creditDebitNo: this.cdNote, currency: data });
                        }
                        this._toastService.warning(res.message);
                        return of(false);
                    })

                )
        } else {
            sourcePreview$ = this._documentationRepo.previewOPSCdNote({ jobId: this.jobId, creditDebitNo: this.cdNote, currency: data });
        }
        sourcePreview$
            .subscribe(
                (res: any) => {
                    if (res != null && res?.dataSource.length > 0) {
                        this.dataReport = res;
                        this.renderAndShowReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    adjustDebitValue() {
        this.adjustDebitValuePopup.action = 'DEBIT';
        this.adjustDebitValuePopup.jodId = this.jobId;
        this.adjustDebitValuePopup.cdNote = this.cdNote;
        this.adjustDebitValuePopup.active();
    }

    onSaveAdjustDebit() {
        this.getDetailCdNote(this.jobId, this.cdNote)
    }
}
