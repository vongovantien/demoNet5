import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import { AccountingRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';
import { AccountingConstants, RoutingConstants, SystemConstants } from '@constants';
import { AccAccountingManagementCriteria, AccAccountingManagementResult } from '@models';

import { AppList } from 'src/app/app.list';

import { catchError, finalize, map, takeUntil } from 'rxjs/operators';
import { accountingManagementDataSearchState, accountingManagementListLoadingState, accountingManagementListState, LoadListAccountingMngt } from '../store';
import { HttpResponse } from '@angular/common/http';


@Component({
    selector: 'app-accounting-voucher',
    templateUrl: './accounting-voucher.component.html'
})

export class AccountingManagementVoucherComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmPopupDelete: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) popup403: Permission403PopupComponent;

    vouchers: AccAccountingManagementResult[] = [];
    confirmDeleteVoucherText: string;
    selectedVoucher: AccAccountingManagementResult;

    defaultDataSearch: AccountingInterface.IDefaultSearchAcctMngt = {
        typeOfAcctManagement: AccountingConstants.ISSUE_TYPE.VOUCHER,
        fromIssuedDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 29)), 'yyyy-MM-dd', 'en'),
        toIssuedDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
    };

    constructor(
        private _router: Router,
        private _accountingRepo: AccountingRepo,
        private _progressService: NgProgress,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _store: Store<IAppState>
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.requestSearchAcctMngt;
        this.requestSort = this.sortVoucher;
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.headers = [
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Partner Name', field: 'partnerName', sortable: true },
            { title: 'Total Amount', field: 'totalAmount', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Voucher Date', field: 'date', sortable: true },
            { title: 'Issued Date', field: 'datetimeCreated', sortable: true },
            { title: 'Sync Date', field: 'lastSyncDate', sortable: true },
            { title: 'Sync Status', field: 'syncStatus', sortable: true },
            { title: 'Creator', field: 'creatorName', sortable: true },
        ];

        this.getListVoucher();

        this._store.select(accountingManagementDataSearchState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (dataSearch: AccAccountingManagementCriteria) => {
                    console.log(dataSearch);
                    if (!!dataSearch && dataSearch.typeOfAcctManagement === AccountingConstants.ISSUE_TYPE.VOUCHER) {
                        this.dataSearch = dataSearch;
                    } else {
                        this.dataSearch = this.defaultDataSearch;
                    }
                    this.requestSearchAcctMngt();
                }
            );

        this.isLoading = this._store.select(accountingManagementListLoadingState);
    }

    requestSearchAcctMngt() {
        this._store.dispatch(LoadListAccountingMngt({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'vat': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice`]);
                break;
            }
            case 'cdi': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/cd-invoice`]);
                break;
            }
        }
    }

    getListVoucher() {
        this._store.select(accountingManagementListState)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((data: any) => {
                    return {
                        data: (data.data || []).map((item: AccAccountingManagementResult) => new AccAccountingManagementResult(item)),
                        totalItems: data.totalItems || 0,
                    };
                })
            )
            .subscribe(
                (res: CommonInterface.IResponsePaging | any) => {
                    this.totalItems = res.totalItems || 0;
                    this.vouchers = res.data;
                }
            );
    }

    onSearchVoucher($event: any) {
        this.page = 1;
    }

    sortVoucher(sortField: string) {
        this.vouchers = this._sortService.sort(this.vouchers, sortField, this.order);
    }

    exportVoucher() {
        this._progressRef.start();
        this._exportRepo.exportAccountingManagement(this.dataSearch)
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

    prepareDeleteVoucher(voucher: AccAccountingManagementResult) {
        this._accountingRepo.checkAllowDeleteAcctMngt(voucher.id)
            .subscribe(
                (res: boolean) => {
                    if (!res) {
                        this.popup403.show();
                        return;
                    }
                    this.selectedVoucher = voucher;

                    this.confirmDeleteVoucherText = '';
                    const textConfirm: string = (this.confirmDeleteVoucherText + '').slice();
                    this.confirmDeleteVoucherText = textConfirm + `Do you want to delete ${voucher.voucherId} ?`;
                    this.confirmPopupDelete.show();
                }
            );
    }

    onDeleteVoucher() {
        if (!!this.selectedVoucher) {
            this._accountingRepo.deleteAcctMngt(this.selectedVoucher.id)
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.message) {
                            this._toastService.success(res.message);
                            this.confirmPopupDelete.hide();
                            this.onSearchVoucher(this.dataSearch);

                            this.requestSearchAcctMngt();
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    viewDetail(voucher: AccAccountingManagementResult): void {
        this._accountingRepo.checkDetailAcctMngtPermission(voucher.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher/${voucher.id}`]);
                } else {
                    this.popup403.show();
                }
            });
    }
}