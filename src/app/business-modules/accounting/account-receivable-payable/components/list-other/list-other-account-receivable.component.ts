import { Component, OnInit } from '@angular/core';
import { AppList } from '@app';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { SortService } from '@services';

import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, ExportRepo } from '@repositories';
import { Router } from '@angular/router';
import { TrialOfficialOtherModel } from '@models';
import { RoutingConstants, SystemConstants } from '@constants';
import { getAccountReceivableListState, getAccountReceivablePagingState, getAccountReceivableSearchState, IAccountReceivableState } from '../../account-receivable/store/reducers';
import { Store } from '@ngrx/store';
import { getMenuUserSpecialPermissionState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { LoadListAccountReceivable } from '../../account-receivable/store/actions';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'list-other-account-receivable',
    templateUrl: './list-other-account-receivable.component.html',
})
export class AccountReceivableListOtherComponent extends AppList implements OnInit {

    //
    otherList: any[] = [];

    constructor(private _sortService: SortService,
        private _progressService: NgProgress,
        private _accountingRepo: AccountingRepo,
        private _router: Router,
        private _store: Store<IAccountReceivableState>,
        private _exportRepo: ExportRepo,
        private _toastService: ToastrService,
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortOtherList;
        this.requestList = this.getPagingList;
    }
    ngOnInit() {
        this.headers = [
            { title: 'Partner Id', field: 'partnerCode', sortable: true },
            { title: 'Partner Name', field: 'partnerNameAbbr', sortable: true },
            { title: 'Debit Amount', field: 'debitAmount', sortable: true },
            { title: 'Billing', field: 'billingAmount', sortable: true },
            { title: 'Paid', field: 'paidAmount', sortable: true },
            { title: 'OutStanding Balance', field: 'billingUnpaid', sortable: true },
            { title: 'Status', field: 'agreementStatus', sortable: true },
            { title: 'Parent Partner', field: 'partnerNameAbbr', sortable: true },

        ];

        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this._store.select(getAccountReceivableSearchState)
        .pipe(
            withLatestFrom(this._store.select(getAccountReceivablePagingState)),
            takeUntil(this.ngUnsubscribe),
            map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
        )
        .subscribe(
            (data) => {
                this.dataSearch = data.dataSearch;
                this.page = data.page;
                this.pageSize = data.pageSize;
            }
        );
    }

    sortOtherList(sortField: string, order: boolean) {
        this.otherList = this._sortService.sort(this.otherList, sortField, order);
    }

    getPagingList() {
        this._store.dispatch(LoadListAccountReceivable({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
        this._store.select(getAccountReceivableListState)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new TrialOfficialOtherModel(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.otherList = res.data || [];
                    this.totalItems = res.totalItems;
                },
            );
    }
    viewDetail(agreementId: string, partnerId: string) {

        if (!!agreementId) {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary/detail`], {
                queryParams: {
                    agreementId: agreementId,
                    subTab: 'other',
                }
            });
        } else {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary/detail`], {
                queryParams: {
                    partnerId: partnerId,
                    subTab: 'other',
                }
            });
        }

    }

    exportExcel() {
        if (!this.otherList.length) {
            this._toastService.warning('No Data To View, Please Re-Apply Filter');
            return;
        } else {
            this._exportRepo.exportAccountingReceivableArSumary(this.dataSearch)
                .subscribe(
                    (res: HttpResponse<any>) => {
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                    }
                );
        }

    }
}