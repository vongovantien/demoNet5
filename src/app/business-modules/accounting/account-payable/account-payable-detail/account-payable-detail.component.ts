import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { SystemConstants } from '@constants';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { getAccountPayablePaymentListState, getAccountPayablePaymentLoadingListState, getAccountPayablePaymentPagingState, getAccountPayablePaymentSearchState, IAccountPayablePaymentState } from './store/reducers';
import { AccountingPayableModel } from 'src/app/shared/models/accouting/accounting-payable';
import { PaymentModel } from '@models';
import { LoadListAccountPayableDetail } from './store/actions';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoadingPopupComponent } from '@common';
import { AccountingRepo, ExportRepo } from '@repositories';
import { of } from 'rxjs';
import { SortService } from '@services';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-account-payable-detail',
    templateUrl: './account-payable-detail.component.html',
})
export class AccountPayableTabComponent extends AppList implements OnInit {
    @ViewChild(LoadingPopupComponent) loadingPopupComponent: LoadingPopupComponent;

    payables: AccountingPayableModel[] = [];
    payments: PaymentModel[] = [];
    paymentHeaders: CommonInterface.IHeaderTable[];
    selectedSubTab: string = "SUMMARY";

    activeTrialOffice: boolean = false;
    activeGuaranteed: boolean = false;
    activeOther: boolean = false;
    totalAr: any = 0;

    constructor(
        private _cd: ChangeDetectorRef,
        private _ngProgessSerice: NgProgress,
        private _store: Store<IAccountPayablePaymentState>,
        private _spinner: NgxSpinnerService,
        private _exportRepo: ExportRepo,
        private _accountingRepo: AccountingRepo,
        private _sortService: SortService
    ) {
        super();
        this._progressRef = this._ngProgessSerice.ref();
        this.requestList = this.loadListAccountPayableDetail;
        this.requestSort = this.sortAccPayment;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Acct Ref No', field: 'referenceNo', sortable: true },
            { title: 'Acct date', field: 'voucherDate', sortable: true },
            { title: 'Partner Name', field: 'partnerName', sortable: true },
            { title: 'Transaction type', field: 'transactionType', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Doc No', field: 'billingNo', sortable: true },
            { title: 'Begin Amount', field: 'totalAmount', sortable: true },
            { title: 'Org Payment', field: 'paymentAmount', sortable: true },
            { title: 'Origin Remain', field: 'remainAmount', sortable: true },
            { title: 'Begin AmountVND', field: 'totalAmountVnd', sortable: true },
            { title: 'Payment VND', field: 'paymentAmountVnd', sortable: true },
            { title: 'Remain VND', field: 'remainAmountVnd', sortable: true },
            { title: 'Org Currency', field: 'currency', sortable: true },
            { title: 'Payment Term', field: 'paymentTerm', sortable: true },
            { title: 'Due Date', field: 'paymentDueDate', sortable: true },
            { title: 'Description', field: '', sortable: true },
        ];

        this.paymentHeaders = [
            { title: 'No', field: '', sortable: true },
            { title: 'Ref No', field: 'refNo', sortable: true },
            { title: 'Acct Date', field: 'paymentDate', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Billing No', field: 'docNo', sortable: true },
            { title: 'Paid Amount', field: 'paymentAmount', sortable: true },
            { title: 'Remain Amount', field: 'remainAmount', sortable: true },
            { title: 'Paid AmountVND', field: 'paymentAmountVnd', sortable: true },
            { title: 'Remain AmountVND', field: 'remainAmountVnd', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
        ];

    }

    ngAfterViewInit() {
        this.getPagingData();
        this._store.select(getAccountPayablePaymentSearchState)
            .pipe(
                withLatestFrom(this._store.select(getAccountPayablePaymentPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data) => {
                    if (!!data.dataSearch) {
                        this.dataSearch = data.dataSearch;
                    } else {
                        this.initDataSearch();
                    }

                    this.page = data.page;
                    this.pageSize = data.pageSize;

                    this.loadListAccountPayableDetail();
                }
            );

        this.isLoading = this._store.select(getAccountPayablePaymentLoadingListState);
        this._cd.detectChanges();
    }

    initDataSearch() {
        const loginData = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.dataSearch = {
            paymentStatus: ["Unpaid", "Paid A Part"],
            office: [loginData.officeId],
            fromPaymentDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd', 'en'),
            toPaymentDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd', 'en'),
        }
    }

    loadListAccountPayableDetail() {
        this._store.dispatch(LoadListAccountPayableDetail({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    getPagingData() {
        this._store.select(getAccountPayablePaymentListState)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new AccountingPayableModel(item)) : [],
                        totalItems: data.totalItems,
                    };
                }),
                takeUntil(this.ngUnsubscribe)
            ).subscribe(
                (res: any) => {
                    this.payables = res.data || [];
                    this.totalItems = res.totalItems;
                },
            );
    }

    changeTabAccount(tab: string) {
    }


    onSearchPayment(event) {
        this.page = 1;
        this.dataSearch = event;

        this.dataSearch = this.dataSearch;
        this.getPagingData();
    }

    startDownloadReport(data: any, fileName: string) {
        if (data.byteLength > 0) {
            this.downLoadFile(data, SystemConstants.FILE_EXCEL, fileName);
            this.loadingPopupComponent.downloadSuccess();
        } else {
            this.loadingPopupComponent.downloadFail();
        }
    }

    exportStandart() {
        this._spinner.hide();
        this.loadingPopupComponent.show();
        this._exportRepo.exportAcountingPayableStandart(this.dataSearch)
            .pipe(
                catchError(() => of(this.loadingPopupComponent.downloadFail())),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: any) => {
                    this.startDownloadReport(response.body, response.headers.get('efms-file-name'));
                }
            );
    }

    exportAccountingTemplate() {
        this._spinner.hide();
        this.loadingPopupComponent.show();
        this._exportRepo.exportAcountingTemplatePayable(this.dataSearch)
            .pipe(
                catchError(() => of(this.loadingPopupComponent.downloadFail())),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: any) => {
                    this.startDownloadReport(response.body, response.headers.get('efms-file-name'));
                }
            );
    }

    sortAccPayment(sortField: string, order: boolean) {
        this.payables = this._sortService.sort(this.payables, sortField, order);
    }

    sortPayment(sortField: string, order: boolean) {
        this.payments = this._sortService.sort(this.payments, sortField, order);
    }

    getPayments(item: AccountingPayableModel) {
        this.payments = [];
        if (!item.notShowDetail) {
            const criteria: any = {
                refNo: item.referenceNo,
                type: item.transactionType,
                invoiceNo: item.invoiceNo,
                billingNo: item.billingNo,
                bravoNo: item.bravoRefNo
            };
            this._accountingRepo.getPayablePaymentByRefNo(criteria)
                .pipe(
                    catchError(this.catchError)
                ).subscribe(
                    (res: []) => {
                        this.payments = res || [];
                    },
                );
        }
    }
}
