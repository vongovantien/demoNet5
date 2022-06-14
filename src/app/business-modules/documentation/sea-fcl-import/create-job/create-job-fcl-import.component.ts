import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActionsSubject } from '@ngrx/store';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { AppForm } from '@app';
import { CsTransaction, Container } from '@models';
import { DocumentationRepo } from '@repositories';

import { InfoPopupComponent } from '@common';
import { CommonEnum } from '@enums';
import {
    ShareBussinessShipmentGoodSummaryComponent,
    ShareBusinessImportJobDetailPopupComponent
} from '@share-bussiness';
import { RoutingConstants } from '@constants';
import { ShareSeaServiceFormCreateSeaImportComponent } from '../../share-sea/components/form-create-sea-import/form-create-sea-import.component';

import { catchError, takeUntil } from 'rxjs/operators';
import * as fromShareBussiness from './../../../share-business/store';
import _merge from 'lodash/merge';

@Component({
    selector: 'app-create-job-fcl-import',
    templateUrl: './create-job-fcl-import.component.html',
})
export class SeaFCLImportCreateJobComponent extends AppForm {

    @ViewChild(ShareSeaServiceFormCreateSeaImportComponent) formCreateComponent: ShareSeaServiceFormCreateSeaImportComponent;
    @ViewChild(ShareBussinessShipmentGoodSummaryComponent) shipmentGoodSummaryComponent: ShareBussinessShipmentGoodSummaryComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    containers: Container[] = [];
    selectedJob: any = {}; // TODO model.
    isImport: boolean = false;

    constructor(
        protected _router: Router,
        protected _documenRepo: DocumentationRepo,
        protected _actionStoreSubject: ActionsSubject,
        protected _toastService: ToastrService,
        protected _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this._actionStoreSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromShareBussiness.ContainerAction) => {
                    if (action.type === fromShareBussiness.ContainerActionTypes.SAVE_CONTAINER) {
                        this.containers = action.payload;
                    }
                });
    }

    ngAfterViewInit() {
        // * Init container
        this.shipmentGoodSummaryComponent.initContainer();
        this.shipmentGoodSummaryComponent.containerPopup.isAdd = true;
        this._cd.detectChanges();

    }

    onSubmitData() {
        const form = this.formCreateComponent.formCreate.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            ata: !!form.ata && !!form.ata.startDate ? formatDate(form.ata.startDate, 'yyyy-MM-dd', 'en') : null,
            atd: !!form.atd && !!form.atd.startDate ? formatDate(form.atd.startDate, 'yyyy-MM-dd', 'en') : null,

            personIncharge: this.formCreateComponent.personIncharge.value,
            pod: this.formCreateComponent.pod.value,
            coloaderId: form.coloader,
            polDescription: form.polDescription,
            podDescription: form.podDescription,

            // * containers summary
            commodity: this.shipmentGoodSummaryComponent.commodities,
            desOfGoods: this.shipmentGoodSummaryComponent.description,
            packageContainer: this.shipmentGoodSummaryComponent.containerDetail,
            netWeight: this.shipmentGoodSummaryComponent.netWeight,
            grossWeight: this.shipmentGoodSummaryComponent.grossWeight,
            chargeWeight: this.shipmentGoodSummaryComponent.totalChargeWeight,
            cbm: this.shipmentGoodSummaryComponent.totalCBM,

        };
        const model: CsTransaction = new CsTransaction(Object.assign(_merge(form, formData)));
        model.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaFCLImport;

        return model;

    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.shipmentGoodSummaryComponent.containerDetail = this.selectedJob.packageContainer;
        this.shipmentGoodSummaryComponent.description = this.selectedJob.desOfGoods;
        this.shipmentGoodSummaryComponent.grossWeight = this.selectedJob.grossWeight;
        this.shipmentGoodSummaryComponent.netWeight = this.selectedJob.netWeight;
        this.shipmentGoodSummaryComponent.totalChargeWeight = this.selectedJob.chargeWeight;
        this.shipmentGoodSummaryComponent.totalCBM = this.selectedJob.cbm;
        this.formCreateComponent.formCreate.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formCreate.valid
            || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)
            || (!!this.formCreateComponent.polDescription.value && !this.formCreateComponent.pol.value)
            || (!this.formCreateComponent.podDescription.value
            || (!!this.formCreateComponent.serviceDate.value && !this.formCreateComponent.serviceDate.value.startDate))
        ) {
            valid = false;
        }
        return valid;
    }

    onCreateJob() {
        this.formCreateComponent.isSubmitted = true;
        if (Object.keys(this.selectedJob).length > 0) {
            this.containers = this.selectedJob.containers;
        }
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();
        modelAdd.csMawbcontainers = this.containers; // * Update containers model
        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
            this.isImport = false;
        } else {
            this.createJob(modelAdd);
        }

    }

    importJob(body: any) {
        this._documenRepo.importCSTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_IMPORT}/${res.data.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    createJob(body: any) {
        this._documenRepo.createTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_IMPORT}/${res.model.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaFCLImport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.show();
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_IMPORT}`]);
    }
}


