import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from '@app';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { SortService } from '@services';

import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, ExportRepo } from '@repositories';
import { Router } from '@angular/router';
import { TrialOfficialOtherModel } from '@models';
import { RoutingConstants, SystemConstants } from '@constants';
import { getAccountReceivableListState, getAccountReceivableLoadingListState, getAccountReceivablePagingState, getAccountReceivableSearchState, IAccountReceivableState } from '../../account-receivable/store/reducers';
import { Store } from '@ngrx/store';
import { getMenuUserSpecialPermissionState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { LoadListAccountReceivable } from '../../account-receivable/store/actions';
import { HttpResponse } from '@angular/common/http';
import { AccReceivableDebitDetailPopUpComponent } from '../popup/account-receivable-debit-detail-popup.component';

@Component({
    selector: 'list-no-agreement-account-receivable',
    templateUrl: './list-no-agreement-account-receivable.component.html',
})
export class AccountReceivableNoAgreementComponent extends AppList implements OnInit {

    @ViewChild(AccReceivableDebitDetailPopUpComponent) debitDetailPopupComponent: AccReceivableDebitDetailPopUpComponent;

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
            { title: 'Over 1-15 days', field: 'over1To15Day', sortable: true },
            { title: 'Over 16-30 days', field: 'over16To30Day', sortable: true },
            { title: 'Over 30 days', field: 'over30Day', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Salesman', field: 'arSalesmanName', sortable: true },

        ];

        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.pageSize = 50;
        this.isLoading = this._store.select(getAccountReceivableLoadingListState);
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
                        data: !!data.data ? data.data.map((item: any) => item) : [],
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
    viewDetail(partnerId: string,salemanId:string) {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary/detail`], {
                queryParams: {
                    partnerId: partnerId,
                    salemanId:salemanId,
                    subTab: 'other',
                }
            });

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

    showDebitDetail(arSalesmanId,partnerId,option){
        let officeId = "";
        let overDueDay = 0;
        let agreeStr=''+partnerId;
        if(this.dataSearch && this.dataSearch.officeIds){officeId = this.dataSearch.officeIds.join("|");}
        if(this.dataSearch && this.dataSearch.overDueDay){overDueDay = this.dataSearch.overDueDay;}
        this._accountingRepo.getDataDebitDetailListPartnerId(partnerId, option,officeId,'',overDueDay,arSalesmanId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.debitDetailPopupComponent.dataDebitList = res || [];
                        this.debitDetailPopupComponent.dataSearch= {argeementId:agreeStr, option,officeId,serviceCode:'',overDueDay};
                        this.debitDetailPopupComponent.calculateTotal();
                        this.debitDetailPopupComponent.show();
                    }
                },
            );
    }
}
