import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { CsTransactionDetail } from '@models';
import { ChargeConstants } from '@constants';

import { SeaLCLExportCreateHBLComponent } from '../create/create-house-bill.component';
import * as fromShareBussiness from './../../../../../share-business/store';

import { catchError, skip, takeUntil, tap } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { delayTime } from '@decorators';
import { formatDate } from '@angular/common';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';

@Component({
    selector: 'app-detail-hbl-lcl-export',
    templateUrl: './detail-house-bill.component.html'
})

export class SeaLCLExportDetailHBLComponent extends SeaLCLExportCreateHBLComponent implements OnInit, AfterViewInit {

    hblId: string;
    hblDetail: CsTransactionDetail;

    constructor(
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
                        // this._store.dispatch(new fromShareBussiness.SaveContainerAction(res.csMawbcontainers || []));
                        this._store.dispatch(new fromShareBussiness.GetContainersHBLSuccessAction(this.hblDetail.csMawbcontainers));

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
        this.goodSummaryComponent.isSubmitted = true;

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

    showCreatepoup() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Save HBL',
            body: this.confirmUpdateHblText,
            labelCancel: 'No',
            labelConfirm: 'Yes'
        }, () => { this.onSaveHBL() });
    }

    updateHbl(body: any) {
        body.transactionType = ChargeConstants.SLE_CODE;
        const deliveryDate = {
            deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate == null ? null : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate,
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
                catchError(this.catchError))
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

    // preview(reportType: string) {
    //     this._documentationRepo.previewSeaHBLOfLanding(this.hblId, reportType)
    //         .pipe(
    //             catchError(this.catchError),
    //         )
    //         .subscribe(
    //             (res: any) => {
    //                 this.dataReport = res;
    //                 if (this.dataReport.dataSource.length > 0) {
    //                     this.showReport();
    //                 } else {
    //                     this._toastService.warning('There is no data to display preview');
    //                 }
    //             },
    //         );
    // }

    // previewAttachList() {
    //     this._documentationRepo.previewAirAttachList(this.hblId)
    //         .pipe(
    //             catchError(this.catchError),
    //         )
    //         .subscribe(
    //             (res: any) => {
    //                 this.dataReport = res;
    //                 if (this.dataReport.dataSource.length > 0) {
    //                     this.showReport();
    //                 } else {
    //                     this._toastService.warning('There is no data to display preview');
    //                 }
    //             },
    //         );
    // }

    // @delayTime(1000)
    // showReport(): void {
    //     this.reportPopup.frm.nativeElement.submit();
    //     this.reportPopup.show();
    // }
}
