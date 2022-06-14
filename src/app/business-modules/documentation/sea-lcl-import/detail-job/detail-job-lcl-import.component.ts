import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';

import { SeaLCLImportCreateJobComponent } from '../create-job/create-job-lcl-import.component';
import { DocumentationRepo } from '@repositories';
import { ICanComponentDeactivate } from '@core';
import { CsTransaction } from '@models';
import { ConfirmPopupComponent, InfoPopupComponent, Permission403PopupComponent, ReportPreviewComponent, SubHeaderComponent } from '@common';

import { combineLatest, of, Observable } from 'rxjs';
import { switchMap, map, tap, skip, takeUntil, catchError, finalize, concatMap } from 'rxjs/operators';

import * as fromShareBussiness from './../../../share-business/store';
import isUUID from 'validator/lib/isUUID';
import { RoutingConstants } from '@constants';
import { ICrystalReport } from '@interfaces';
import { delayTime } from '@decorators';
import { HttpErrorResponse } from '@angular/common/http';


type TAB = 'SHIPMENT' | 'CDNOTE' | 'ASSIGNMENT' | 'HBL' | 'FILES';

@Component({
    selector: 'app-sea-lcl-import-detail-job',
    templateUrl: './detail-job-lcl-import.component.html'
})

export class SeaLCLImportDetailJobComponent extends SeaLCLImportCreateJobComponent implements OnInit, ICanComponentDeactivate, ICrystalReport {

    @ViewChild(SubHeaderComponent) headerComponent: SubHeaderComponent;
    @ViewChild("deleteConfirmTemplate") confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild("duplicateconfirmTemplate") confirmDuplicatePopup: ConfirmPopupComponent;
    @ViewChild("confirmLockShipment") confirmLockPopup: ConfirmPopupComponent;
    @ViewChild("confirmCancelPopup") confirmCancelPopup: ConfirmPopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild('notAllowDelete') canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    params: any;
    tabList: string[] = ['SHIPMENT', 'CDNOTE', 'ASSIGNMENT', 'ADVANCE-SETTLE', 'FILES'];
    jobId: string;

    shipmentDetail: CsTransaction;

    selectedTab: TAB | string = 'SHIPMENT';
    ACTION: CommonType.ACTION_FORM | string = 'UPDATE';

    action: any = {};

    nextState: RouterStateSnapshot;
    isCancelFormPopupSuccess: boolean = false;

    constructor(
        protected _router: Router,
        protected _documenRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _store: Store<any>,
        private _ngProgressService: NgProgress,
        private _cd: ChangeDetectorRef
    ) {
        super(_router, _documenRepo, _toastService);
        this._progressRef = this._ngProgressService.ref();
    }


    ngOnInit() { }

    ngAfterViewInit() {
        this.subscription = combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            tap((param: any) => {
                this.params = param;
                this.selectedTab = (!!param.tab && this.tabList.includes(param.tab.toUpperCase())) ? param.tab.toUpperCase() : 'SHIPMENT';
                this.jobId = !!param.jobId ? param.jobId : '';
                if (param.action) {
                    this.ACTION = param.action.toUpperCase();
                    this.isDuplicate = this.ACTION === 'COPY';
                } else {
                    this.ACTION = null;
                    this.isDuplicate = false;
                }

                this._cd.detectChanges();

            }),
            switchMap(() => of(this.jobId)),
        ).subscribe(
            (jobId: string) => {
                if (isUUID(jobId)) {
                    this._store.dispatch(new fromShareBussiness.TransactionGetProfitAction(jobId));
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(jobId));

                    this.getDetailSeaFCLImport();
                } else {
                    this.gotoList();
                }
            }
        );
    }

    getDetailSeaFCLImport() {
        this._store.select<any>(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: CsTransaction) => {
                    if (!!res) {
                        this.shipmentDetail = res;

                        // * reset field duplicate
                        if (this.ACTION === "COPY") {
                            this.formCreateComponent.getUserLogged();
                            this.headerComponent.resetBreadcrumb("Create Job");
                        } else {
                            this.headerComponent.resetBreadcrumb("Job Detail");
                        }
                    }
                },
            );
    }

    onSaveJob() {
        [this.formCreateComponent.isSubmitted, this.shipmentGoodSummaryComponent.isSubmitted] = [true, true];

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();

        //  * Update field
        modelAdd.id = this.jobId;
        modelAdd.transactionType = this.shipmentDetail.transactionType;
        modelAdd.jobNo = this.shipmentDetail.jobNo;
        modelAdd.datetimeCreated = this.shipmentDetail.datetimeCreated;
        modelAdd.userCreated = this.shipmentDetail.userCreated;
        modelAdd.currentStatus = this.shipmentDetail.currentStatus;

        if (this.ACTION === 'COPY') {
            this.duplicateJob(modelAdd);
        } else {
            this.saveJob(modelAdd);
        }
    }

    duplicateJob(body: any) {
        this._documenRepo.importCSTransaction(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success("Duplicate data successfully");
                        this.jobId = res.data.id;

                        // * get detail & container list.
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: Object.assign({}, { tab: 'SHIPMENT' }) });
                        this.ACTION = 'SHIPMENT';
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    saveJob(body: any) {
        this._documenRepo.updateCSTransaction(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * Dispatch action get detail.
                        this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                    } else {
                        this._toastService.error(res.message);
                    }
                },
                (error: HttpErrorResponse) => {
                    if (error.error?.data?.errorCode) {
                        this.formCreateComponent.formCreate.controls[error.error?.data?.errorCode].setErrors({ existed: true });
                    }
                }
            );
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'hbl':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}/hbl`]);
                break;
            case 'shipment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: Object.assign({}, { tab: 'SHIPMENT' }) });
                break;
            case 'cdNote':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'CDNOTE', view: this.params.view, export: this.params.export } });
                break;
            case 'assignment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'files':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'FILES' } });
                break;
            case 'advance-settle':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ADVANCE-SETTLE' } });
                break;
        }
    }

    prepareDeleteJob() {
        this._documenRepo.checkPermissionAllowDeleteShipment(this.jobId)
            .pipe(
                concatMap((isAllowDelete: boolean) => {
                    if (isAllowDelete) {
                        return this._documenRepo.checkMasterBillAllowToDelete(this.jobId);
                    }
                    return of(403);
                }),
                concatMap((isValid) => {
                    if (isValid) {
                        return of(200);
                    }
                    return of(201);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((value: number) => {
                if (value === 403) {
                    this.permissionPopup.show();
                    return;
                }
                if (value === 200) {
                    this.confirmDeletePopup.show();
                    return;
                } else {
                    this.canNotDeleteJobPopup.show();
                }
            });
    }

    onDeleteJob() {
        this._progressRef.start();
        this._documenRepo.deleteMasterBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeletePopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.gotoList();
                    }
                },
            );
    }

    previewPLsheet(currency: string) {
        const hblid = "00000000-0000-0000-0000-000000000000";
        this._documenRepo.previewSIFPLsheet(this.jobId, hblid, currency)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        this.showReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    showDuplicateConfirm() {
        this.confirmDuplicatePopup.show();
    }

    duplicateConfirm() {
        this.action = { action: 'copy' };
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, this.action)
        });
        this.confirmDuplicatePopup.hide();
    }

    lockShipment() {
        this.confirmLockPopup.show();
    }

    onLockShipment() {
        this.confirmLockPopup.hide();

        this._progressRef.start();
        this._documenRepo.LockCsTransaction(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (r: CommonInterface.IResult) => {
                    if (r.status) {
                        this._toastService.success(r.message);
                        this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                    } else {
                        this._toastService.error(r.message);
                    }
                },
            );
    }

    onSyncHBL() {
        this.formCreateComponent.isSubmitted = true;
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }
        const modelAdd = this.onSubmitData();

        const bodySyncData: DocumentationInterface.IDataSyncHBL = {
            flightVesselName: modelAdd.flightVesselName,
            etd: modelAdd.etd,
            eta: modelAdd.eta,
            pol: modelAdd.pol,
            pod: modelAdd.pod,
            bookingNo: modelAdd.bookingNo,
            voyNo: modelAdd.voyNo,
            mblNo: modelAdd.mawb

        };

        this._progressRef.start();
        this._documenRepo.syncHBL(this.jobId, bodySyncData)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            ).subscribe(
                (r: CommonInterface.IResult) => {
                    if (r.status) {
                        this._toastService.success(r.message);
                    } else {
                        this._toastService.error(r.message);
                    }
                },
            );
    }

    previewShipmentCoverPage() {
        this._documenRepo.previewShipmentCoverPage(this.jobId)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        this.showReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    handleCancelForm() {
        const isEdited = JSON.stringify(this.formCreateComponent.currentFormValue) !== JSON.stringify(this.formCreateComponent.formCreate.getRawValue());
        if (isEdited) {
            this.confirmCancelPopup.show();
        } else {
            this.isCancelFormPopupSuccess = true;
            this.gotoList();
        }
    }

    confirmCancel() {
        this.confirmCancelPopup.hide();
        this.isCancelFormPopupSuccess = true;

        if (this.nextState) {
            this._router.navigate([this.nextState.url.toString()]);
        } else {
            this.gotoList();
        }
    }

    canDeactivate(currenctRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> {
        this.nextState = nextState; // * Save nextState for Deactivate service.
        if (this.isCancelFormPopupSuccess || this.isDuplicate) {
            return of(true);
        }
        const isEdited = JSON.stringify(this.formCreateComponent.currentFormValue) !== JSON.stringify(this.formCreateComponent.formCreate.getRawValue());

        if (isEdited && !this.isCancelFormPopupSuccess) {
            this.confirmCancelPopup.show();
            return;
        }
        return of(!isEdited);
    }

    @delayTime(1000)
    showReport(): void {
        this.previewPopup.frm.nativeElement.submit();
        this.previewPopup.show();
    }

}
