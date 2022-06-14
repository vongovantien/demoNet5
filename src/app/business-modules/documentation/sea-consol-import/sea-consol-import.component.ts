import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';

import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { AppList } from '@app';
import { ConfirmPopupComponent, InfoPopupComponent, Permission403PopupComponent } from '@common';
import { CsTransaction, CsTransactionDetail } from '@models';
import { CommonEnum } from '@enums';
import { JobConstants, RoutingConstants } from '@constants';

import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import * as fromShare from './../../share-business/store';

@Component({
    selector: 'app-sea-consol-import',
    templateUrl: './sea-consol-import.component.html',
})
export class SeaConsolImportComponent extends AppList {

    @ViewChild(ConfirmPopupComponent) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    headerHouseBills: CommonInterface.IHeaderTable[];

    masterbills: CsTransaction[] = [];
    housebills: CsTransactionDetail[] = [];
    tmpHouseBills: CsTransactionDetail[] = [];
    tmpIndex: number = -1;

    selectedMasterBill: CsTransaction = null;
    deleteMessage: string = '';
    transactionService: number = CommonEnum.TransactionTypeEnum.SeaConsolImport;

    defaultDataSearch = {
        transactionType: this.transactionService,
        ...JobConstants.DEFAULT_RANGE_DATE_SEARCH
    };
    jobIdSelected: string = null;

    constructor(
        private _router: Router,
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _store: Store<fromShare.IShareBussinessState>
    ) {
        super();
        this._progressRef = this._progressService.ref();

        this.requestList = this.requestSearchShipment;
        this.requestSort = this.sortMasterBills;

        this.isLoading = <any>this._store.select(fromShare.getTransationLoading);
    }

    ngOnInit() {
        this.headers = [
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'MBL No.', field: 'mawb', sortable: true },
            { title: 'ETA', field: 'eta', sortable: true },
            { title: 'Shipping Line', field: 'supplierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'POL', field: 'polName', sortable: true },
            { title: 'POD', field: 'podName', sortable: true },
            { title: "Cont Qty", field: 'sumCont', sortable: true },
            { title: "Package Qty", field: 'sumPackage', sortable: true },
            { title: 'G.W', field: 'grossWeight', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Creator', field: 'creatorName', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
        ];

        this.headerHouseBills = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Salesman', field: 'saleManName', sortable: true },
            { title: 'Notify Party', field: 'notifyParty', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Containers', field: 'containers', sortable: true },
            { title: 'Packages', field: 'packages', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Group', field: 'group', sortable: true },
            { title: 'Department', field: 'department', sortable: true },

        ];

        this.getShipments();

        this._store.select(fromShare.getTransactionDataSearchState)
            .pipe(
                withLatestFrom(this._store.select(fromShare.getTransactionListPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (criteria: any) => {
                    if (!!criteria && !!Object.keys(criteria.dataSearch).length && criteria.dataSearch.transactionType === this.transactionService) {
                        this.dataSearch = criteria.dataSearch;
                    } else {
                        this.dataSearch = this.defaultDataSearch;
                    }
                    this.page = criteria.page;
                    this.pageSize = criteria.pageSize;
                    this.requestSearchShipment();
                }
            );

    }

    getShipments() {
        this._store.select(fromShare.getTransactionListShipment)
            .pipe(
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (res: CommonInterface.IResponsePaging | any) => {
                    this.masterbills = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    requestSearchShipment() {
        this._store.dispatch(new fromShare.TransactionLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    getListHouseBill(jobId: string, index: number) {
        this.jobIdSelected = jobId;
        if (this.tmpIndex === index) {
            this.housebills = this.tmpHouseBills;
        } else {
            this._progressRef.start();
            this._documentationRepo.getListHouseBillAscHBLOfJob({ transactionType: this.transactionService, jobId: jobId, hwbno: this.dataSearch.hwbno, customerId: this.dataSearch.customerId, saleManId: this.dataSearch.saleManId, creditDebitNo: this.dataSearch.creditDebitNo, soaNo: this.dataSearch.soaNo })
                .pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        this._progressRef.complete();
                    })
                ).subscribe(
                    (res: CsTransactionDetail[]) => {
                        this.housebills = (res || []).map((item: CsTransactionDetail) => new CsTransactionDetail(item));
                        this.tmpHouseBills = this.housebills;
                        this.tmpIndex = index;
                    },
                );
        }
    }

    gotoCreateJob() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/new`]);
    }

    onSearchMasterBills(data: any) {
        this.page = 1; // reset page.
        data.transactionType = this.transactionService;
        this.dataSearch = data;

        this.loadListHouseBillExpanding();
    }

    onResetMasterBills($event: any) {
        this.page = 1;
        this.dataSearch = this.defaultDataSearch;

        this.requestSearchShipment();
        this.loadListHouseBillExpanding();
    }

    sortMasterBills(sort: string): void {
        this.masterbills = this._sortService.sort(this.masterbills, sort, this.order);
    }

    sortHouseBills(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.housebills = this._sortService.sort(this.housebills, sortData.sortField, sortData.order);
        }
    }

    prepareDeleteShipment(masterbill: CsTransaction) {
        this._documentationRepo.checkPermissionAllowDeleteShipment(masterbill.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.checkDeleteMasterBill(masterbill);
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    checkDeleteMasterBill(masterbill: CsTransaction) {
        this._progressRef.start();
        this._documentationRepo.checkMasterBillAllowToDelete(masterbill.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.selectedMasterBill = new CsTransaction(masterbill);
                        this.deleteMessage = `Are you sure you want to delete this Job?`;
                        this.confirmDeleteJobPopup.show();
                    } else {
                        this.canNotDeleteJobPopup.show();
                    }
                },
            );
    }

    onDeleteMasterBill() {
        this._progressRef.start();
        this._documentationRepo.deleteMasterBill(this.selectedMasterBill.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeleteJobPopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this._store.dispatch(new fromShare.TransactionLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
                    }
                },
            );
    }

    loadListHouseBillExpanding() {
        this.tmpIndex = -1;
        if (this.jobIdSelected !== null) {
            this.getListHouseBill(this.jobIdSelected, -2);
        }
    }

    viewDetail(id: string): void {
        this._documentationRepo.checkDetailShippmentPermission(id)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}`, id]);
                } else {
                    this.permissionPopup.show();
                }
            });
    }
}
