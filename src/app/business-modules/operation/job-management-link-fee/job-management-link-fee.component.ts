import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Shipment, CustomDeclaration } from '@models';
import { SortService } from '@services';
import { DocumentationRepo, OperationRepo } from '@repositories';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';

import { AppList } from 'src/app/app.list';
import * as fromOperationStore from '../store';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { JobConstants, RoutingConstants } from '@constants';
import { InjectViewContainerRefDirective } from '@directives';


@Component({
    selector: 'app-job-mangement-link-fee',
    templateUrl: './job-management-link-fee.component.html',
})
export class JobManagementLinkFeeComponent extends AppList implements OnInit {
    @ViewChild(InjectViewContainerRefDirective) viewContainer: InjectViewContainerRefDirective;
    @ViewChild(Permission403PopupComponent) canNotAllowActionPopup: Permission403PopupComponent;

    shipments: Shipment[] = [];
    selectedShipment: Shipment = null;

    customClearances: any[] = [];
    deleteMessage: string = '';

    headerCustomClearance: CommonInterface.IHeaderTable[];

    defaultDataSearch = {
        createdDateFrom: JobConstants.DEFAULT_RANGE_DATE_SEARCH.fromDate,
        createdDateTo: JobConstants.DEFAULT_RANGE_DATE_SEARCH.toDate,
    };
    messageConfirmLinkFee: string = "Do you want to Link Fee these Jobs ?";

    constructor(
        private sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _ngProgressService: NgProgress,
        private _toastService: ToastrService,
        private _operationRepo: OperationRepo,
        private _router: Router,
        private _store: Store<fromOperationStore.IOperationState>
    ) {
        super();
        this.requestSort = this.sortShipment;
        this.requestList = this.requestSearchShipment;
        this._progressRef = this._ngProgressService.ref();

        this.isLoading = this._store.select(fromOperationStore.getOperationTransationLoadingState);
    }

    ngOnInit() {
        this.headers = [
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'HBL', field: 'hwbno', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Linked Job', field: '', sortable: true },
            { title: 'Linked Fee', field: '', sortable: true },
            { title: 'Job Linked', field: '', sortable: true },
            { title: 'MBL', field: '', sortable: true },
            { title: 'User Link', field: '', sortable: true },
            { title: 'DateLink', field: '', sortable: true },
            { title: 'Date Modified', field: 'modifiedDate', sortable: true },
        ];

        this.headerCustomClearance = [
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'Transfer Date', field: 'clearanceDate', sortable: true },
            { title: 'HBl No', field: 'hblid', sortable: true },
            { title: 'Export Country', field: 'exportCountryCode', sortable: true },
            { title: 'import Country', field: 'importCountryCode', sortable: true },
            { title: 'Commodity Code', field: 'commodityCode', sortable: true },
            { title: 'Q\'ty', field: 'qtyCont', sortable: true },
            { title: 'Source', field: 'source', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];

        this.getShipments();

        this._store.select(fromOperationStore.getOperationTransationDataSearch)
            .pipe(
                withLatestFrom(this._store.select(fromOperationStore.getOperationTransationPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (criteria: any) => {
                    if (!!criteria && !!Object.keys(criteria.dataSearch).length) {
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

    requestSearchShipment() {
        this._store.dispatch(new fromOperationStore.OPSTransactionLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    showCustomClearance(jobNo: string, indexsShipment: number) {
        if (!!this.shipments[indexsShipment].customClearances && this.shipments[indexsShipment].customClearances.length) {
            this.customClearances = this.shipments[indexsShipment].customClearances;
        } else {
            this._progressRef.start();
            this._operationRepo.getCustomDeclaration(jobNo)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                ).subscribe(
                    (res: CustomDeclaration[]) => {
                        this.customClearances = (res || []).map((item: CustomDeclaration) => new CustomDeclaration(item));
                        this.shipments[indexsShipment].customClearances = this.customClearances;
                    },
                );
        }
    }

    deleteSipment(shipment: Shipment) {
        this._progressRef.start();
        this._documentRepo.checkShipmentAllowToDelete(shipment.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.selectedShipment = new Shipment(shipment);

                        this.deleteMessage = `Do you want to delete job No ${shipment.jobNo}?`;
                        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
                            title: 'Confirm',
                            body: this.deleteMessage,
                            labelConfirm: 'Ok'
                        }, () => { this.onDeleteShipment(); });
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }

    onDeleteShipment() {
        this._progressRef.start();
        this._documentRepo.deleteShipment(this.selectedShipment.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.requestSearchShipment();

                    }
                },
            );

    }
    showDetailLinkFee(id) {
        this._documentRepo.checkViewDetailPermission(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.LOGISTICS.JOB_DETAIL_LINK_FEE}/`, id]);
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }

    sortShipment() {
        if (!!this.shipments.length) {
            this.shipments = this.sortService.sort(this.shipments, this.sort, this.order);
        }
    }

    sortByCustomClearance(sort: string): void {
        if (!!sort) {
            this.setSortBy(sort, this.sort !== sort ? true : !this.order);
            if (typeof (this.requestSort) === 'function') {
                this.customClearances = this.sortService.sort(this.customClearances, this.sort, this.order);
            }
        }
    }

    sortClassCustomClearance(sort: string): string {
        if (!!sort) {
            let classes = 'sortable ';
            if (this.sort === sort) {
                classes += ('sort-' + (this.order ? 'asc' : 'desc') + ' ');
            }

            return classes;
        }
        return '';
    }

    getShipments() {
        this._store.select(fromOperationStore.getOperationTransationListShipment)
            .pipe(
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (res: CommonInterface.IResponsePaging | any) => {
                    if (!!res.data) {
                        this.shipments = res.data.opsTransactions || [];
                        this.totalItems = res.totalItems;
                    } else {
                        this.shipments = [];
                        this.totalItems = 0;
                    }
                }
            );
    }

    onSearchShipment(dataSearch: any) {
        this.dataSearch = dataSearch;
    }

    onResetSearchShipment($event: any) {
        this.page = 1;
        this.dataSearch = this.defaultDataSearch;

        this.requestSearchShipment();
    }

    gotoCreateJob() {
        this._router.navigate([`${RoutingConstants.LOGISTICS.JOB_MANAGEMENT}/new`]);
    }

    linkFeeJob() {
        let jobs = this.shipments.filter(x => x.isSelected);
        if (!jobs.length) {
            this._toastService.warning("Please select job");
            return;
        }
        let links = jobs.filter(x => !x.serviceNo);
        if (links.length > 0) {
            this._toastService.warning("Please linked job");
            return;
        }

        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Alert',
            body: this.messageConfirmLinkFee,
            labelConfirm: 'Yes',
            classConfirmButton: 'btn-warning',
            iconConfirm: 'la la-trash',
            center: true
        }, () => this.onConfirmLinkFee())
    }

    onConfirmLinkFee() {
        let jobs = this.shipments.filter(x => x.isSelected);
        this._documentRepo.updateShipmentLinkFee(jobs)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (result: CommonInterface.IResult) => {
                    if (result.status) {
                        this._toastService.success("Fee Have Linked Success");
                        this.getShipments();
                    } else {
                        this._toastService.error(result.message);
                    }
                }
            );
    }
}
