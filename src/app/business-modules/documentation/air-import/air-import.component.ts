import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SortService } from '@services';
import { DocumentationRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import * as fromShare from './../../share-business/store';
import { CommonEnum } from '@enums';
import { CsTransactionDetail, CsTransaction } from '@models';
import { ConfirmPopupComponent, InfoPopupComponent, Permission403PopupComponent } from '@common';
import { takeUntil, catchError, finalize, withLatestFrom, map } from 'rxjs/operators';
import { JobConstants, RoutingConstants } from '@constants';

@Component({
    selector: 'app-air-import',
    templateUrl: './air-import.component.html',
})
export class AirImportComponent extends AppList {

    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    headersHBL: CommonInterface.IHeaderTable[];

    shipments: CsTransaction[] = [];
    houseBills: CsTransactionDetail[] = [];
    itemToDelete: any = null;
    tmpHouseBills: CsTransactionDetail[] = [];
    tmpIndex: number = -1;

    transactionService: number = CommonEnum.TransactionTypeEnum.AirImport;

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
        private _store: Store<fromShare.IShareBussinessState>) {
        super();

        this._progressRef = this._ngProgessService.ref();
        this.requestList = this.requestSearchShipment;
        this.requestSort = this.sortShipment;

        this.isLoading = <any>this._store.select(fromShare.getTransationLoading);

    }

    ngOnInit() {
        this.headers = [
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'MAWB No.', field: 'mawb', sortable: true },
            { title: 'ETA', field: 'eta', sortable: true },
            { title: 'Airline', field: 'supplierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'AOL', field: 'polName', sortable: true },
            { title: 'AOD', field: 'podName', sortable: true },
            { title: 'Package Qty', field: 'packageQty', sortable: true },
            { title: 'G.W', field: 'grossWeight', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Creator', field: 'creatorName', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
        ];
        this.headersHBL = [
            { title: 'HAWB No', field: 'hwbno', sortable: true },
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

    prepareDeleteShipment(shipment) {
        this._documentRepo.checkPermissionAllowDeleteShipment(shipment.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.confirmDelete(shipment);
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
                    } else {
                        this.infoPopup.show();
                    }
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
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/new`]);
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
                    this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}`, id]);
                } else {
                    this.permissionPopup.show();
                }
            });
    }
}
