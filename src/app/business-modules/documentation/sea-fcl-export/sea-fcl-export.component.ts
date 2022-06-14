import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { SortService } from 'src/app/shared/services/sort.service';
import { InfoPopupComponent, ConfirmPopupComponent, Permission403PopupComponent } from 'src/app/shared/common/popup';
import { AppList } from 'src/app/app.list';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { CsTransactionDetail, CsTransaction } from 'src/app/shared/models';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import * as fromShare from './../../share-business/store';
import { formatDate } from '@angular/common';
import { JobConstants, RoutingConstants } from '@constants';


@Component({
    selector: 'app-sea-fcl-export',
    templateUrl: './sea-fcl-export.component.html',
})
export class SeaFCLExportComponent extends AppList {

    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    headers: CommonInterface.IHeaderTable[];
    headersHBL: CommonInterface.IHeaderTable[];

    shipments: CsTransaction[] = [];
    houseBills: CsTransactionDetail[] = [];
    tmpHouseBills: CsTransactionDetail[] = [];
    tmpIndex: number = -1;

    itemToDelete: any = null;
    transactionService: number = CommonEnum.TransactionTypeEnum.SeaFCLExport;

    jobIdSelected: string = null;

    defaultDataSearch = {
        transactionType: this.transactionService,
        ...JobConstants.DEFAULT_RANGE_DATE_SEARCH
    };

    constructor(
        private _router: Router,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _ngProgessService: NgProgress,
        private _store: Store<fromShare.IShareBussinessState>
    ) {
        super();

        this._progressRef = this._ngProgessService.ref();

        this.requestList = this.requestSearchShipment;
        this.requestSort = this.sortShipment;

        this.isLoading = <any>this._store.select(fromShare.getTransationLoading);
    }

    ngOnInit() {
        this.headers = [
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'MBL No.', field: 'mawb', sortable: true },
            { title: 'ETD', field: 'etd', sortable: true },
            { title: 'ETA', field: 'eta', sortable: true },
            { title: 'Shipping Line', field: 'supplierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'POL', field: 'polName', sortable: true },
            { title: 'POD', field: 'podName', sortable: true },
            { title: 'Total Cont', field: 'sumCont', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Creator', field: 'creatorName', sortable: true },
            { title: 'Created Date', field: 'datetimeCreated', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
        ];
        this.headersHBL = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Salesman', field: 'saleManName', sortable: true },
            { title: 'Notify Party', field: 'notifyParty', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Containers', field: 'containers', sortable: true },
            { title: 'Packages', field: 'packages', sortable: true },
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
                    this.shipments = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortShipment(sortField: string) {
        this.shipments = this._sortService.sort(this.shipments, sortField, this.order);
    }

    sortHBL(sortField: string, order: boolean) {
        this.houseBills = this._sortService.sort(this.houseBills, sortField, order);
    }

    getListHouseBill(jobId: any, index: number) {
        this.jobIdSelected = jobId;
        if (this.tmpIndex === index) {
            this.houseBills = this.tmpHouseBills;
        } else {
            this._progressRef.start();
            this._documentRepo.getListHouseBillAscHBLOfJob({ transactionType: this.transactionService, jobId: jobId, hwbno: this.dataSearch.hwbno, customerId: this.dataSearch.customerId, saleManId: this.dataSearch.saleManId, creditDebitNo: this.dataSearch.creditDebitNo, soaNo: this.dataSearch.soaNo })
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: any) => {
                        this.houseBills = res || [];
                        this.tmpHouseBills = this.houseBills;
                        this.tmpIndex = index;
                    }
                );
        }
    }

    onSearchShipment($event: any) {
        $event.transactionType = this.transactionService;
        this.dataSearch = $event;

        this.loadListHouseBillExpanding();
    }

    onResetShipment($event: any) {
        this.page = 1;
        this.dataSearch = this.defaultDataSearch;

        this.requestSearchShipment();
        this.loadListHouseBillExpanding();
    }

    requestSearchShipment() {
        this._store.dispatch(new fromShare.TransactionLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    prepareDeleteShipment(item) {
        this._documentRepo.checkPermissionAllowDeleteShipment(item.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.confirmDelete(item);
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    confirmDelete(item: { id: string; }) {
        this.itemToDelete = item;
        this._progressRef.start();
        this._documentRepo.checkMasterBillAllowToDelete(item.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (respone: boolean) => {
                    if (respone === true) {
                        this.confirmDeletePopup.show();
                    } //else {
                    //this.infoPopup.show();
                    // }
                }
            );
    }

    deleteJob() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();

        this._documentRepo.deleteMasterBill(this.itemToDelete.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this._store.dispatch(new fromShare.TransactionLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    gotoCreateJob() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_EXPORT}/new`]);
    }

    loadListHouseBillExpanding() {
        this.tmpIndex = -1;
        if (this.jobIdSelected !== null) {
            this.getListHouseBill(this.jobIdSelected, -2);
        }
    }

    viewDetail(id: string): void {
        this._documentRepo.checkDetailShippmentPermission(id)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_EXPORT}`, id]);
                } else {
                    this.permissionPopup.show();
                }
            });
    }
}
