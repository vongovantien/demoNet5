import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import { DocumentationRepo, AccountingRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { PartnerOfAcctManagementResult, CDNoteViewModel, CombineBillingCriteria, Crystal } from '@models';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';
import { AccountingConstants, RoutingConstants, SystemConstants } from '@constants';

import { AppList } from 'src/app/app.list';
import { SelectPartner } from '../store';

import { AccountingManagementSelectPartnerPopupComponent } from '../components/popup/select-partner/select-partner.popup';
import { AccountingDetailCdNoteComponent } from '../components/popup/detail-cd-note/detail-cd-note.component';

import { catchError, finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AccountingManagementSelectPartnerCombinePopupComponent } from '../components/popup/select-partner-combine/select-partner-combine.popup';
import { ReportPreviewComponent } from '@common';
import { HttpResponse } from '@angular/common/http';



type TAB = 'CDI' | 'VAT' | 'VOUCHER';
@Component({
    selector: 'app-accounting-debit-credit-invoice',
    templateUrl: './accounting-debit-credit-invoice.component.html'
})

export class AccountingManagementDebitCreditInvoiceComponent extends AppList implements OnInit {

    @ViewChild(AccountingDetailCdNoteComponent) cdNoteDetailPopupComponent: AccountingDetailCdNoteComponent;
    @ViewChild(AccountingManagementSelectPartnerPopupComponent) selectPartnerPopup: AccountingManagementSelectPartnerPopupComponent;
    @ViewChild(AccountingManagementSelectPartnerCombinePopupComponent) selectPartnerCombinePopup: AccountingManagementSelectPartnerCombinePopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;

    selectedTab: TAB = 'CDI';
    cdNotes: CDNoteViewModel[] = [];

    menuSpecialPermission: Observable<any[]>;
    selectedIssueType: string;
    cdNoteCombine: CombineBillingCriteria[] = [];

    constructor(
        private _router: Router,
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _ngProgressService: NgProgress,
        private _accountingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _store: Store<IAppState>,
        private _exportRepo: ExportRepo,
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
        this.requestList = this.getCreditDebitInvoices;
        this.requestSort = this.sortCD;
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.headers = [
            { title: 'Reference No', field: 'referenceNo', sortable: true },
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'HBL', field: 'hblNo', sortable: true },
            { title: 'Partner Name', field: 'partnerName', sortable: true },
            { title: 'Total Amount', field: 'total', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Issue Date', field: 'issuedDate', sortable: true },
            { title: 'Accounting Date', field: 'voucherIddate', sortable: true },
            { title: 'Creator', field: 'creator', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'Issued for Voucher No', field: 'voucherId', sortable: true },
            { title: 'Sync Status', field: 'syncStatus', sortable: true },
            { title: 'Last Sync', field: 'lastSyncDate', sortable: true },
            { title: 'Payment Status', field: 'paymentStatus', sortable: true },
        ];
        this.getCreditDebitInvoices();
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'vat': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice`]);
                break;
            }
            case 'voucher': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher`]);
                break;
            }
        }
    }

    sortCD(sort: string): void {
        if (!!sort) {
            if (!!this.cdNotes.length) {
                this.cdNotes = this._sortService.sort(this.cdNotes, this.sort, this.order);
            }
        }
    }

    searchInvoiceAndCDNotes(event) {
        this.page = 1;
        this.dataSearch = event;
        this.getCreditDebitInvoices();
    }

    resetSearch(event) {
        this.page = 1;
        this.dataSearch = event;
        this.getCreditDebitInvoices();
    }

    getCreditDebitInvoices() {
        this.isLoading = true;
        this._progressRef.start();
        this._documentationRepo.pagingInvoiceAndCDNotes(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.isLoading = false;
                }),
                map((data: CommonInterface.IResponsePaging) => {
                    return {
                        data: (data.data || []).map((item: any) => new CDNoteViewModel(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.totalItems = res.totalItems || 0;
                    this.cdNotes = res.data;
                },
            );
    }

    showDetailCDNote(jobId: string, refNo: string) {
        this.cdNoteDetailPopupComponent.setDefault(refNo);
        this.cdNoteDetailPopupComponent.jobId = jobId;
        this.cdNoteDetailPopupComponent.cdNote = refNo;
        this.cdNoteDetailPopupComponent.getDetailCdNote(jobId, refNo);
        this.cdNoteDetailPopupComponent.show();
    }

    viewDetail(soaId: string, soano: string) {
        this._accountingRepo
            .checkAllowGetDetailSOA(soaId)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}/detail/`], {
                        queryParams: { no: soano, currency: "VND", action: "inv" }
                    });
                }
            });
    }

    issueVatInvoice() {
        const existCdNoteIssued = this.cdNotes.filter(x => x.isSelected && x.status !== 'New');
        if (!!existCdNoteIssued.length) {
            this._toastService.warning("An existing cd note has been issued, please check it");
            return;
        }
        const codes: CDNoteViewModel[] = this.cdNotes.filter(x => x.isSelected && x.status === 'New');
        if (!!codes.length) {
            const body: AccountingInterface.IPartnerOfAccountingManagementRef = {
                cdNotes: codes.filter(x=>x.billingType == "CdNote").map(x => x.referenceNo),
                soaNos: codes.filter(x=>x.billingType == "Soa").map(x => x.referenceNo),
                jobNos: null,
                hbls: null,
                mbls: null,
                settlementCodes: null
            };
            this.searchRef(body, AccountingConstants.ISSUE_TYPE.INVOICE);
        }
    }

    issueVoucher() {
        const existCdNoteIssued = this.cdNotes.filter(x => x.isSelected && x.status !== 'New');
        if (!!existCdNoteIssued.length) {
            this._toastService.warning("An existing cd note has been issued, please check it");
            return;
        }
        const codes: CDNoteViewModel[] = this.cdNotes.filter(x => x.isSelected && x.status === 'New');
        if (!!codes.length) {
            const body: AccountingInterface.IPartnerOfAccountingManagementRef = {
                cdNotes: codes.filter(x=>x.billingType == "CdNote").map(x => x.referenceNo),
                soaNos: codes.filter(x=>x.billingType == "Soa").map(x => x.referenceNo),
                jobNos: null,
                hbls: null,
                mbls: null,
                settlementCodes: null
            };
            this.searchRef(body, AccountingConstants.ISSUE_TYPE.VOUCHER);
        }
    }

    searchRef(body: AccountingInterface.IPartnerOfAccountingManagementRef, type: string) {
        this.selectedIssueType = type;
        if (type === AccountingConstants.ISSUE_TYPE.INVOICE) {
            this._accountingRepo.getChargeSellForInvoiceByCriteria(body)
                .subscribe(
                    (res: PartnerOfAcctManagementResult[]) => {
                        if (!!res && !!res.length) {
                            if (res.length === 1) {
                                this._store.dispatch(SelectPartner(res[0]));
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice/new`]);
                                return;
                            } else {
                                this.selectPartnerPopup.listPartners = res;
                                this.selectPartnerPopup.selectedPartner = null;

                                this.selectPartnerPopup.show();
                            }
                        } else {
                            this._toastService.warning("Not found data charge");
                        }
                    }
                );
        } else {
            this._accountingRepo.getChargeForVoucherByCriteria(body)
                .subscribe(
                    (res: PartnerOfAcctManagementResult[]) => {
                        if (!!res && !!res.length) {
                            if (res.length === 1) {
                                this._store.dispatch(SelectPartner(res[0]));
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher/new`]);
                                return;
                            } else {
                                this.selectPartnerPopup.listPartners = res;
                                this.selectPartnerPopup.selectedPartner = null;

                                this.selectPartnerPopup.show();
                            }
                        } else {
                            this._toastService.warning("Not found data charge");
                        }
                    }
                );
        }

    }

    onSelectPartner() {
        if (this.selectedIssueType === AccountingConstants.ISSUE_TYPE.INVOICE) {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice/new`]);
            return;
        }
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher/new`]);

    }

    previewCombine(currency: string) {
        const cdNotes: CDNoteViewModel[] = this.cdNotes.filter(x => x.isSelected);
        if (!!cdNotes.length) {
            this.cdNoteCombine = cdNotes.map(i => new CombineBillingCriteria({ cdNoteCode: i.referenceNo, partnerId: i.partnerId, partnerName: i.partnerName, currencyCombine: currency })).filter((g, i, arr) => arr.findIndex(t => t.cdNoteCode === g.cdNoteCode) === i); // Distinct CdNote Code;
            const partners: CombineBillingCriteria[] = this.cdNoteCombine.filter((g, i, arr) => arr.findIndex(t => t.partnerId === g.partnerId) === i); //Distinct PartnerId
            if (partners.length > 1) {
                this.selectPartnerCombinePopup.listPartners = partners;
                this.selectPartnerCombinePopup.selectedPartner = null;
                this.selectPartnerCombinePopup.show();
            } else {
                const combineCriteria = this.cdNoteCombine.filter(x => x.partnerId == partners[0].partnerId);
                this.previewCombineBilling(combineCriteria);
            }
        } else {
            this._toastService.warning("Please select CD Note to preview");
        }
    }

    onSelectPartnerCombine(partner: CombineBillingCriteria) {
        const combineCriteria = this.cdNoteCombine.filter(x => x.partnerId == partner.partnerId);
        this.previewCombineBilling(combineCriteria);
    }

    previewCombineBilling(combineCriteria: CombineBillingCriteria[]) {
        this._progressRef.start();
        this._documentationRepo.previewCombineBilling(combineCriteria)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: Crystal) => {
                    if (res != null) {
                        this.dataReport = res;
                        setTimeout(() => {
                            this.previewPopup.frm.nativeElement.submit();
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }
    exportInvoice(){
        this._progressRef.start();
        this._exportRepo.exportAccountingManagementDebCreInvoice(this.dataSearch)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('There is no data to export', '');
                    }
                },
            );
    }
}
