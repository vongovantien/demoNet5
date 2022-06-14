import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { AppForm } from '@app';
import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { HouseBill, DIM, CsTransactionDetail } from '@models';
import {
    ShareBusinessImportHouseBillDetailComponent,
    ShareBusinessAttachListHouseBillComponent,
    getDimensionVolumesState, getDetailHBlState,
    GetDetailHBLSuccessAction,
    getTransactionPermission
} from '@share-bussiness';
import { SystemConstants, RoutingConstants } from '@constants';
import { CommonEnum } from '@enums';


import * as fromShareBussiness from './../../../../../share-business/store';
import { AirExportHBLFormCreateComponent } from '../components/form-create-house-bill-air-export/form-create-house-bill-air-export.component';

import _merge from 'lodash/merge';
import { catchError, takeUntil, map, tap, mergeMap, switchMap } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { merge, of } from 'rxjs';
import { ShareBusinessProofOfDelieveyComponent } from 'src/app/business-modules/share-business/components/hbl/proof-of-delivery/proof-of-delivery.component';
import { InjectViewContainerRefDirective } from '@directives';

@Component({
    selector: 'app-create-hbl-air-export',
    templateUrl: './create-house-bill.component.html',
})
export class AirExportCreateHBLComponent extends AppForm implements OnInit {

    @ViewChild(AirExportHBLFormCreateComponent, { static: true }) formCreateHBLComponent: AirExportHBLFormCreateComponent;
    @ViewChild(ShareBusinessAttachListHouseBillComponent) attachListComponent: ShareBusinessAttachListHouseBillComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild(ShareBusinessProofOfDelieveyComponent, { static: true }) proofOfDeliveryComponent: ShareBusinessProofOfDelieveyComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    jobId: string;
    selectedHbl: CsTransactionDetail;
    isImport: boolean = false;

    constructor(
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,

    ) {
        super();
    }

    ngOnInit() {
        this._activedRoute.params
            .subscribe((param: Params) => {
                if (isUUID(param.jobId)) {
                    this.jobId = param.jobId;
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                    this.permissionShipments = this._store.select(getTransactionPermission);
                } else {
                    this.gotoList();
                }
            });

        this.listenShortcutSaveHawb();
    }

    listenShortcutSaveHawb() {
        merge(
            this.createShortcut(['ControlLeft', 'ShiftLeft', 'KeyS']),
        ).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                () => {
                    this.confirmSaveHBL();
                }
            );
    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHbldate: !!form.issueHbldate && !!form.issueHbldate.startDate ? formatDate(form.issueHbldate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,

            customerId: form.customer,
            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            forwardingAgentId: form.forwardingAgent,
            shipmentType: form.shipmenttype,
            rateCharge: form.asArranged ? form.rateChargeAs : form.rateCharge,

            cbm: this.formCreateHBLComponent.totalCBM,
            hw: this.formCreateHBLComponent.totalHeightWeight,
            attachList: this.attachListComponent.attachList.replace(form.hwbno, '[[HBLNo]]').replace(formatDate(form.etd.startDate, 'dd/MM/yyyy', 'en'), '[[Date]]'),
            dimensionDetails: form.dimensionDetails,
            hwConstant: this.formCreateHBLComponent.hwconstant,

        };

        const houseBill = new HouseBill(_merge(form, formData));
        return houseBill;
    }

    saveHBL() {
        this.formCreateHBLComponent.isSubmitted = true;
        if (this.isImport) {
            this._documentationRepo.generateHBLNo(CommonEnum.TransactionTypeEnum.AirExport)
                .pipe(
                    mergeMap((res: any) => {
                        if (this.formCreateHBLComponent.hwbno.value == null || this.formCreateHBLComponent.hwbno.value == "") {
                            this.formCreateHBLComponent.hwbno.setValue(res.hblNo);
                        }
                        if (!this.checkValidateForm()) {
                            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                body: this.invalidFormText
                            });
                            return null;
                        }
                        return this._documentationRepo.checkExistedHawbNoAirExport(this.formCreateHBLComponent.hwbno.value, this.jobId, null);
                    }
                    )).subscribe(result => {
                        if (!!result && result.length > 0) {
                            let jobNo = '';
                            result.forEach(element => {
                                jobNo += element + '<br>';
                            });

                            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                title: 'HAWB No Existed',
                                body: 'Cannot save HBL! Hawb no existed in the following job: ' + jobNo,
                                class: 'bg-danger'
                            });
                        } else {
                            const houseBill: HouseBill = this.getDataForm();
                            this.setData(houseBill);
                            this.createHbl(houseBill);
                        }
                    }
                    );
        } else {
            if (!this.checkValidateForm()) {
                this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                    body: this.invalidFormText
                });
                return;
            }
            this._documentationRepo.checkExistedHawbNoAirExport(this.formCreateHBLComponent.hwbno.value, this.jobId, null)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        if (!!res && res.length > 0) {
                            let jobNo = '';
                            res.forEach(element => {
                                jobNo += element + '<br>';
                            });
                            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                body: 'Cannot save HBL! Hawb no existed in the following job: ' + jobNo,
                                class: 'bg-danger'
                            });
                        } else {
                            const houseBill: HouseBill = this.getDataForm();
                            this.setData(houseBill);
                            this.createHbl(houseBill);
                        }
                    }
                );
        }

    }

    setData(houseBill: HouseBill) {
        houseBill.jobId = this.jobId;
        houseBill.otherCharges = this.formCreateHBLComponent.otherCharges;
        houseBill.otherCharges.forEach(c => {
            c.jobId = this.jobId;
            c.hblId = SystemConstants.EMPTY_GUID;
        });
    }

    confirmSaveHBL() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Create HBL',
            body: 'You are about to create a new HAWB. Are you sure all entered details are correct?'
        }, () => { this.saveHBL() });
    }

    confirmSaveData() {
        const houseBill: HouseBill = this.getDataForm();
        this.setData(houseBill);
        this.createHbl(houseBill);
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateHBLComponent.formCreate.valid
            || (!!this.formCreateHBLComponent.etd.value && !this.formCreateHBLComponent.etd.value.startDate)
            || (!!this.formCreateHBLComponent.issueHbldate.value && !this.formCreateHBLComponent.issueHbldate.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }

    setProofOfDelivery(houseBill: HouseBill) {
        houseBill.deliveryPerson = this.proofOfDeliveryComponent.proofOfDelievey.deliveryPerson;
        houseBill.note = this.proofOfDeliveryComponent.proofOfDelievey.note;
        houseBill.referenceNoProof = this.proofOfDeliveryComponent.proofOfDelievey.referenceNo;

        return houseBill;
    }

    createHbl(houseBill: HouseBill, hbId?: string) {
        const house = this.setProofOfDelivery(houseBill);
        const deliveryDate = {
            deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : null,
        };
        house.deliveryDate = deliveryDate;

        this._documentationRepo.validateCheckPointContractPartner(houseBill.customerId, SystemConstants.EMPTY_GUID, 'DOC', null, 6)
            .pipe(
                switchMap(
                    (res: CommonInterface.IResult) => {
                        if (!res.status) {
                            this._toastService.warning(res.message);
                            return of(false);
                        }
                        return this._documentationRepo.createHousebill(Object.assign({}, house, deliveryDate))
                            .pipe(
                                tap((result: any) => {
                                    if (this.proofOfDeliveryComponent.fileList !== null && this.proofOfDeliveryComponent.fileList.length !== 0 && this.proofOfDeliveryComponent.files !== null && Object.keys(this.proofOfDeliveryComponent.files).length === 0) {
                                        this.proofOfDeliveryComponent.hblid = result.data;
                                        if (this.proofOfDeliveryComponent.fileList.length > 0) {
                                            this.proofOfDeliveryComponent.uploadFilePOD();
                                        }
                                    }
                                }),
                                catchError(this.catchError),
                            )
                    }
                )
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        if (!res.data) {
                            this.gotoList();
                        } else {
                            if (!!hbId) {
                                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}${this.jobId}/hbl/${hbId}/separate`]);
                            } else {

                                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${this.jobId}/hbl/${res.data}`]);
                            }
                        }
                    }
                }
            );
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Export';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
    }

    onImport(selectedData: CsTransactionDetail) {
        this.selectedHbl = selectedData;
        this._store.dispatch(new GetDetailHBLSuccessAction(this.selectedHbl));
        this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.selectedHbl.id));

        if (!!this.selectedHbl) {
            this._store.select(getDimensionVolumesState)
                .pipe(
                    takeUntil(this.ngUnsubscribe),
                    map((dims: DIM[]) => dims.map(d => new DIM(d))),
                    tap((dims: DIM[]) => { this.formCreateHBLComponent.dims = dims; }),
                    mergeMap(() => this._store.select(getDetailHBlState))
                ).subscribe(
                    (hbl: HouseBill) => {
                        if (!!hbl && hbl.id !== SystemConstants.EMPTY_GUID) {
                            this.isImport = true;
                            hbl.hwbno = this.formCreateHBLComponent.hwbno.value;
                            hbl.mawb = this.formCreateHBLComponent.mawb.value;
                            this.formCreateHBLComponent.totalCBM = hbl.cbm;
                            this.formCreateHBLComponent.totalHeightWeight = hbl.hw;
                            this.formCreateHBLComponent.jobId = hbl.jobId;
                            this.formCreateHBLComponent.hblId = hbl.id;
                            this.formCreateHBLComponent.hwconstant = hbl.hwConstant;

                            this.formCreateHBLComponent.updateFormValue(hbl, true);
                            // this.formCreateHBLComponent.hwbno.setValue(this.formCreateHBLComponent.hwbno.value);
                        }
                    }
                );
        }
    }

    confirmCancel() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: this.confirmCancelFormText,
        }, () => { this.gotoList() });
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${this.jobId}/hbl`]);
    }
}
