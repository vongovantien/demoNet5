import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { Router } from '@angular/router';
import { RoutingConstants, SystemConstants } from '@constants';
import { ARHistoryPaymentListInvoiceComponent } from './components/list-invoice-payment/list-invoice-history-payment.component';
import { Store } from '@ngrx/store';
import { getDataSearchHistoryPaymentState, getHistoryPaymentListState, getHistoryPaymentPagingState, IHistoryPaymentState } from './store/reducers';
import { LoadListHistoryPayment } from './store/actions';
import { AccountingPaymentModel } from '@models';


type TAB = 'HISTORY' | 'OBH';

enum PAYMENT_TAB {
    CUSTOMER = 'CUSTOMER',
    AGENCY = 'AGENCY',
    ARSUMMARY = 'ARSUMMARY',
    HISTORY = 'HISTORY'

}
@Component({
    selector: 'app-history-payment',
    templateUrl: './history-payment.component.html',

})

export class ARHistoryPaymentComponent extends AppList implements OnInit {

    @ViewChild(ARHistoryPaymentListInvoiceComponent) invoiceListComponent: ARHistoryPaymentListInvoiceComponent;

    selectedTab: string = PAYMENT_TAB.HISTORY;

    constructor(
        private _router: Router,
        private _ngProgessSerice: NgProgress,
        private _cd: ChangeDetectorRef,
        private _store: Store<IHistoryPaymentState>) {
        super();
        this._progressRef = this._ngProgessSerice.ref();
        // this.requestList = this.requestLoadListHistoryPayment;
    }

    ngOnInit() {
    }

    requestLoadListHistoryPayment() {
        this._store.dispatch(LoadListHistoryPayment({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    ngAfterViewInit() {
        this._store.select(getDataSearchHistoryPaymentState)
            .pipe(
                withLatestFrom(this._store.select(getHistoryPaymentPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data) => {
                    if (!!data.dataSearch) {
                        this.dataSearch = data.dataSearch;
                    }else{
                        const loginData = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
                        this.dataSearch.searchType = 'VatInvoice';
                        this.dataSearch.paymentStatus = ["Unpaid", "Paid A Part"];
                        this.dataSearch.office = [loginData.officeId];
                    }

                    this.page = data.page;
                    this.pageSize = data.pageSize;

                    // this.requestLoadListHistoryPayment();
                }
            );
        this.invoiceListComponent.dataSearch = this.dataSearch;
        this.invoiceListComponent.getPagingData();

        this._cd.detectChanges();

    }

    getPaymentType() {
        let paymentType: number;
        if (this.selectedTab === "HISTORY") {
            paymentType = 0;
        }
        return paymentType;
    }

    onSearchPayment(event) {
        this.page = 1;
        this.dataSearch = event;
        this.dataSearch.paymentType = this.getPaymentType();
        if (this.dataSearch.paymentType === 0) {
            this.invoiceListComponent.dataSearch = this.dataSearch;
            this.invoiceListComponent.getPagingData();
        }
    }

    requestSearchShipment() {
        this._store.select(getHistoryPaymentListState)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new AccountingPaymentModel(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    if (this.selectedTab === "HISTORY") {
                        this.invoiceListComponent.refPayments = res.data || [];
                        this.invoiceListComponent.totalItems = res.totalItems;
                    }
                },
            );
    }

    handleUpdateExtendDateOfInvoice() {
        this.invoiceListComponent.getPagingData();
    }

    onSelectTab(tabName: PAYMENT_TAB | string) {
        switch (tabName) {
            case 'PAYMENT':
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}`]);
                break;
            case 'AR':
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`]);
                break;
            default:
                break;
        }
        this.selectedTab = tabName;
    }
}
