import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo, ExportRepo, CatalogueRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';

import { CsTransactionDetail, HouseBill } from '@models';
import { ReportPreviewComponent, ConfirmPopupComponent, InfoPopupComponent } from '@common';
import * as fromShareBussiness from '@share-bussiness';
import { ChargeConstants, RoutingConstants, SystemConstants } from '@constants';
import { ICrystalReport } from '@interfaces';
import { delayTime } from '@decorators';

import { InputBookingNotePopupComponent } from '../components/input-booking-note/input-booking-note.popup';
import { AirExportCreateHBLComponent } from '../create/create-house-bill.component';

import { merge, of } from 'rxjs';
import { catchError, takeUntil, skip, tap, switchMap, filter } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { formatDate } from '@angular/common';
import { getCurrentUserState } from '@store';

@Component({
    selector: 'app-detail-hbl-air-export',
    templateUrl: './detail-house-bill.component.html',
})
export class AirExportDetailHBLComponent extends AirExportCreateHBLComponent implements OnInit, ICrystalReport {
    @ViewChild(InputBookingNotePopupComponent) inputBookingNotePopupComponent: InputBookingNotePopupComponent;

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
        protected _exportRepo: ExportRepo,
    ) {
        super(
            _activedRoute,
            _store,
            _documentationRepo,
            _catalogueRepo,
            _toastService,
            _actionStoreSubject,
            _router,
        );
    }

    ngOnInit() {
        this._activedRoute.params.subscribe((param: Params) => {
            if (isUUID(param.hblId)) {
                this.hblId = param.hblId;
                this.jobId = param.jobId;

                this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                this._store.dispatch(new fromShareBussiness.GetDimensionHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.GetHBLOtherChargeAction(this.hblId));
                this.permissionHblDetail = this._store.select(fromShareBussiness.getDetailHBlPermissionState);
                this.getDetailHbl();
            } else {
                this.gotoList();
            }
        });
        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);


        // * Shortcut
        //#region --- Shortcut ---
        merge(
            this.createShortcut(['ControlLeft', 'KeyI']),
            this.createShortcut(['ControlRight', 'KeyI'])
        ).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                () => {
                    this.preview('LASTEST_ITL_FRAME');
                }
            );

        this.listenShortcutSaveHawb();

        //#endregion --- Shortcut ---
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
                    }
                },
            );
    }

    confirmSaveHBL() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Update HBL',
            body: 'You are about to update HBL. Are you sure all entered details are correct?'
        }, () => { this.saveHBL() });
    }

    saveHBL() {
        this.formCreateHBLComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: this.invalidFormText
            });
            return;
        } else {
            this._documentationRepo.checkExistedHawbNoAirExport(this.formCreateHBLComponent.hwbno.value, this.jobId, this.hblId)
                .pipe(
                    catchError(this.catchError),
                )
                .subscribe(
                    (res: any) => {
                        if (!!res && res.length > 0) {
                            let jobNo = '';
                            res.forEach(element => {
                                jobNo += element + '<br>';
                            });
                            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                title: 'HAWB No Existed',
                                body: 'Cannot save HBL! Hawb no existed in the following job: ' + jobNo,
                                class: 'bg-danger'
                            });
                        } else {
                            const modelUpdate = this.getDataForm();
                            this.setDataToUpdate(modelUpdate);

                            this.updateHbl(modelUpdate);

                        }
                    }
                );
        }
    }

    confirmUpdateData() {
        const modelUpdate = this.getDataForm();

        this.setDataToUpdate(modelUpdate);
        this.updateHbl(modelUpdate);
    }


    setDataToUpdate(modelUpdate: HouseBill) {
        modelUpdate.otherCharges = this.formCreateHBLComponent.otherCharges;

        modelUpdate.otherCharges.forEach(c => {
            c.jobId = this.jobId;
            c.hblId = this.hblId;
        });

        modelUpdate.id = this.hblId;
        modelUpdate.jobId = this.jobId;
        modelUpdate.transactionType = ChargeConstants.AE_CODE;
        modelUpdate.userCreated = this.hblDetail.userCreated;

        for (const dim of modelUpdate.dimensionDetails) {
            dim.hblid = this.hblId;
            // dim.mblId = this.jobId;
        }
    }

    updateHbl(body: any, isSeparate?: boolean) {
        const house = this.setProofOfDelivery(body);
        const deliveryDate = {
            deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate == null ? null : this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate,
        };
        house.deliveryDate = deliveryDate;
        this._documentationRepo.updateHbl(Object.assign({}, house, deliveryDate))
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

    preview(reportType: string, separateId?: string) {
        const id = !separateId ? this.hblId : separateId;
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewHouseAirwayBillLastest(id, reportType);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            )
            .subscribe(
                (res: any) => {
                    if (res !== false) {
                        if (res?.dataSource.length > 0) {
                            this.dataReport = res;
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }
                },
            );
    }

    previewAttachList() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewAirAttachList(this.hblId);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            )
            .subscribe(
                (res: any) => {
                    if (res !== false) {
                        if (res?.dataSource.length > 0) {
                            this.dataReport = res;
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }
                },
            );
    }

    exportNeutralHawb() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._store.select(getCurrentUserState)
                            .pipe(
                                filter((c: any) => !!c.userName),
                                switchMap((currentUser: SystemInterface.IClaimUser) => {
                                    if (!!currentUser.userName) {
                                        return this._exportRepo.exportHawbAirwayBill(this.hblId, currentUser.officeId)
                                    }
                                }),
                                takeUntil(this.ngUnsubscribe),
                            )
                    }
                    this._toastService.warning(res.message);
                    return of(false)
                })
            )
            .subscribe(
                (response: ArrayBuffer | any) => {
                    if (response !== false) {
                        if (response.byteLength > 0) {
                            this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                        } else {
                            this._toastService.warning('There is no neutral hawb data to print', '');
                        }
                    }
                }
            );
    }

    gotoSeparate() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${this.jobId}/hbl/${this.hblId}/separate`]);
    }

    openInputBookingNote(reportType: string) {
        this.inputBookingNotePopupComponent.reportType = reportType;
        this.inputBookingNotePopupComponent.hblId = this.hblId;
        this.inputBookingNotePopupComponent.bindingFormBN(this.hblDetail);
        this.inputBookingNotePopupComponent.show();
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
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
}
