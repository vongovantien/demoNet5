import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { CsTransactionDetail } from '@models';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { ChargeConstants } from '@constants';

import { SeaConsolExportCreateHBLComponent } from '../create/create-hbl-consol-export.component';
import * as fromShareBussiness from './../../../../../share-business/store';

import { catchError, skip, takeUntil, tap } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-detail-hbl-consol-export',
    templateUrl: './detail-hbl-consol-export.component.html'
})

export class SeaConsolExportDetailHBLComponent extends SeaConsolExportCreateHBLComponent implements OnInit, AfterViewInit {

    hblId: string;
    hblDetail: CsTransactionDetail;

    constructor(
        protected _progressService: NgProgress,
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _cd: ChangeDetectorRef

    ) {
        super(
            _activedRoute,
            _store,
            _documentationRepo,
            _catalogueRepo,
            _toastService,
            _actionStoreSubject,
            _router,
            _cd
        );
    }

    ngOnInit() {
        this._activedRoute.params.subscribe((param: Params) => {
            if (param.hblId && isUUID(param.hblId)) {
                this.hblId = param.hblId;
                this.jobId = param.jobId;

                this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                this.permissionHblDetail = this._store.select(fromShareBussiness.getDetailHBlPermissionState);

                this.getDetailHbl();

            } else {
                this.gotoList();
            }
        });
        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);
    }

    // ! Override ngAfterViewInit in SeaFCLExportCreateHBLComponent
    ngAfterViewInit() {

    }

    getDetailHbl() {
        this._store.select(fromShareBussiness.getDetailHBlState)
            .pipe(
                skip(1),
                catchError(this.catchError),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: CsTransactionDetail) => {
                    if (!!res) {
                        this.hblDetail = res;
                        // * Dispatch to save containers.
                        this._store.dispatch(new fromShareBussiness.GetContainersHBLSuccessAction(res.csMawbcontainers || []));

                        // * Get container to update model
                        this.getListContainer();
                    }
                },
            );
    }

    getListContainer() {
        this._store.select<any>(fromShareBussiness.getHBLContainersState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (containers: any) => {
                    this.containers = containers || [];
                }
            );
    }

    onSaveHBL() {
        this.formCreateHBLComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: this.invalidFormText
            });
            return;
        }

        const modelUpdate: any = this.getDataForm();
        modelUpdate.id = this.hblId;
        modelUpdate.jobId = this.jobId;
        modelUpdate.userCreated = this.hblDetail.userCreated;

        this.updateHbl(modelUpdate);

    }

    updateHbl(body: any) {
        body.transactionType = body.transactionType = ChargeConstants.SCE_CODE;
        const deliveryDate = {
            deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate == null ? null : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate
        };
        body.deliveryPerson = this.proofOfDeliveryComponent.proofOfDelievey.deliveryPerson;
        body.note = this.proofOfDeliveryComponent.proofOfDelievey.note;
        body.referenceNoProof = this.proofOfDeliveryComponent.proofOfDelievey.referenceNo;
        this._documentationRepo.updateHbl(Object.assign({}, body, deliveryDate))
            .pipe(
                tap(() => {
                    if (this.proofOfDeliveryComponent.fileList !== null && this.proofOfDeliveryComponent.fileList.length !== 0 && this.proofOfDeliveryComponent.files === null) {
                        this.proofOfDeliveryComponent.uploadFilePOD();
                    }
                }),
                catchError(this.catchError),
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblId));

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    showCreatepoup() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Save HBL',
            body: this.confirmUpdateHblText,
            labelCancel: 'No',
            labelConfirm: 'Yes'
        }, () => { this.onSaveHBL() });
    }

    // preview(reportType: string) {
    //     this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC')
    //         .pipe(
    //             switchMap((res: CommonInterface.IResult) => {
    //                 if (res.status) {
    //                     return this._documentationRepo.previewSeaHBLOfLanding(this.hblId, reportType);
    //                 }
    //                 this._toastService.warning(res.message);
    //                 return of(false);
    //             })
    //         )
    //         .subscribe(
    //             (res: any) => {
    //                 if (res !== false) {
    //                     if (res?.dataSource?.length > 0) {
    //                         this.dataReport = res;
    //                         this.showReport();
    //                     } else {
    //                         this._toastService.warning('There is no data to display preview');
    //                     }
    //                 }

    //             },
    //         );
    // }

    // previewAttachList() {
    //     this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC')
    //         .pipe(
    //             switchMap((res: CommonInterface.IResult) => {
    //                 if (res.status) {
    //                     return this._documentationRepo.previewAirAttachList(this.hblId);
    //                 }
    //                 this._toastService.warning(res.message);
    //                 return of(false);
    //             })
    //         ).subscribe(
    //             (res: any) => {
    //                 if (res !== false) {
    //                     if (res?.dataSource?.length > 0) {
    //                         this.dataReport = res;
    //                         this.showReport();
    //                     } else {
    //                         this._toastService.warning('There is no data to display preview');
    //                     }
    //                 }

    //             },
    //         );
    // }
}
