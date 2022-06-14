import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Shipment, CustomDeclaration } from '@models';
import { SortService } from '@services';
import { DocumentationRepo, OperationRepo } from '@repositories';
import { ConfirmPopupComponent, LoadingPopupComponent, Permission403PopupComponent, ReportPreviewComponent } from '@common';

import { AppList } from 'src/app/app.list';
import * as fromOperationStore from './../store';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { JobConstants, RoutingConstants } from '@constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { InjectViewContainerRefDirective, ContextMenuDirective } from '@directives';
import { GetCurrenctUser, getCurrentUserState, getMenuUserSpecialPermissionState } from '@store';
import { Observable, of } from 'rxjs';
import { delayTime } from '@decorators';
import { LinkChargeJobRepPopupComponent } from './components/popup/link-charge-from-jobRep-popup/link-charge-from-job-rep.popup';



@Component({
    selector: 'app-job-mangement',
    templateUrl: './job-management.component.html',
})
export class JobManagementComponent extends AppList implements OnInit {

    @ViewChild(LinkChargeJobRepPopupComponent) linkChargeFromRep: LinkChargeJobRepPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) canNotAllowActionPopup: Permission403PopupComponent;
    @ViewChild(LoadingPopupComponent) loadingPopupComponent: LoadingPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;
    @ViewChildren(ContextMenuDirective) queryListMenuContext: QueryList<ContextMenuDirective>;

    shipments: Shipment[] = [];
    selectedShipment: Shipment = null;

    customClearances: any[] = [];
    deleteMessage: string = '';

    headerCustomClearance: CommonInterface.IHeaderTable[];

    defaultDataSearch = {
        createdDateFrom: JobConstants.DEFAULT_RANGE_DATE_SEARCH.fromDate,
        createdDateTo: JobConstants.DEFAULT_RANGE_DATE_SEARCH.toDate,
    };

    currentLoggedUser: Observable<Partial<SystemInterface.IClaimUser>>;
    isSearchLinkFeea: boolean = false;

    constructor(
        private sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _ngProgressService: NgProgress,
        private _toastService: ToastrService,
        private _operationRepo: OperationRepo,
        private _router: Router,
        private _store: Store<fromOperationStore.IOperationState>,
        private _spinner: NgxSpinnerService
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
            { title: 'Replicate Job', field: 'replicateJobNo', sortable: true },
            { title: 'HBL', field: 'hwbno', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Product Service', field: 'productService', sortable: true },
            { title: 'Service Date', field: 'serviceDate', sortable: true },
            { title: 'Service Port', field: 'polName', sortable: true },
            { title: "Cont Q'ty", field: 'sumContainers', sortable: true },
            { title: "Pack Q'ty", field: 'sumPackages', sortable: true },
            { title: 'G.W', field: 'sumGrossWeight', sortable: true },
            { title: 'CBM', field: 'sumCbm', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
            { title: 'Department', field: 'departmentName', sortable: true },
            { title: 'Group', field: 'groupName', sortable: true },
            { title: 'Modified Date', field: 'modifiedDate', sortable: true },
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

        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.currentUser$ = this._store.select(getCurrentUserState);
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
                        this.confirmDeleteJobPopup.show();
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
                    this.confirmDeleteJobPopup.hide();
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
    showDetail(id) {
        this._documentRepo.checkViewDetailPermission(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.LOGISTICS.JOB_DETAIL}/`, id]);
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

    printPLSheet(currency: string) {
        const currentJob = Object.assign({}, this.selectedShipment);
        this._documentRepo.previewPL(this.selectedShipment?.id, currency)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (res.dataSource.length > 0) {
                        this.renderAndShowReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.viewContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.viewContainerRef.viewContainerRef.clear();
            });
    }


    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }
    onSelectTab(tabName: any) {
        this.isSearchLinkFeea = !this.isSearchLinkFeea;
    }

    chargeFromRep() {
        this._spinner.hide();
        this.loadingPopupComponent.body = "<a>The Link Charge Proccess is running ....!</a> <br><b>Please you wait a moment...</b>";
        this.loadingPopupComponent.show();
        this._documentRepo.chargeFromReplicate('')
            .pipe(
                catchError(() => of(
                    this.loadingPopupComponent.body = "<a>The Link Charge Proccess is Fail</b>",
                    this.loadingPopupComponent.proccessFail()
                )),
                finalize(() => { this._progressRef.complete(); })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this.loadingPopupComponent.body = "<a>The Link Charge Proccess is Completed</b>";
                        this.loadingPopupComponent.proccessCompleted();
                    }
                },
            );
    }

    chargeFromJobRep() {
        this.linkChargeFromRep.show();
    }

    onSelectOps(shipment) {
        this.selectedShipment = shipment;

        const qContextMenuList = this.queryListMenuContext.toArray();
        if (!!qContextMenuList.length) {
            qContextMenuList.forEach((c: ContextMenuDirective) => c.close());
        }
    }

    confirmReplicateJob() {
        const currentJob = Object.assign({}, this.selectedShipment);

        const confirmMessage = `Are you sure you want to replicate <span class="font-weight-bold">${currentJob?.jobNo}</span>?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Replicate job',
            body: confirmMessage,
            iconConfirm: 'la la-copy',
            labelConfirm: 'Yes',
            center: true
        }, () => {
            if (!!currentJob) {
                this._documentRepo.replicateOps([currentJob.id])
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.requestSearchShipment();

                            } else
                                this._toastService.error(res.message);
                        }
                    )
            }
        });
    }
}
