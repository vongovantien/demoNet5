import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActionsSubject } from '@ngrx/store';

import { AppForm } from '@app';
import { InfoPopupComponent } from '@common';
import { DocumentationRepo } from '@repositories';
import { CsTransaction, Container } from '@models';
import { CommonEnum } from '@enums';
import {
    ShareBusinessImportJobDetailPopupComponent,
} from '@share-bussiness';
import { RoutingConstants } from '@constants';

import { ShareSeaServiceFormCreateSeaExportComponent } from '../../share-sea/components/form-create-sea-export/form-create-sea-export.component';
import { ShareSeaServiceShipmentGoodSummaryLCLComponent } from '../../share-sea/components/shipment-good-summary-lcl/shipment-good-summary-lcl.component';

import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';

@Component({
    selector: 'app-create-job-lcl-export',
    templateUrl: './create-job-lcl-export.component.html'
})

export class SeaLCLExportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareSeaServiceFormCreateSeaExportComponent) formCreateComponent: ShareSeaServiceFormCreateSeaExportComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ShareSeaServiceShipmentGoodSummaryLCLComponent) shipmentGoodSummaryComponent: ShareSeaServiceShipmentGoodSummaryLCLComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    containers: Container[] = [];
    isImport: boolean = false;
    selectedJob: any = {}; // TODO model.

    constructor(
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _actionStoreSubject: ActionsSubject,
        protected _cdr: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit() {
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}`]);
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formGroup.getRawValue();

        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            ata: !!form.ata && !!form.ata.startDate ? formatDate(form.ata.startDate, 'yyyy-MM-dd', 'en') : null,
            atd: !!form.atd && !!form.atd.startDate ? formatDate(form.atd.startDate, 'yyyy-MM-dd', 'en') : null,

            personIncharge: form.personalIncharge,
            paymentTerm: form.term,
            agentId: form.agent,
            coloaderId: form.coloader,
            polDescription: form.polDescription,
            podDescription: form.podDescription,

            // * containers summary
            commodity: this.shipmentGoodSummaryComponent.commodities,
            grossWeight: this.shipmentGoodSummaryComponent.gw,
            cbm: this.shipmentGoodSummaryComponent.cbm,
            packageQty: this.shipmentGoodSummaryComponent.packageQuantity,
            packageType: this.shipmentGoodSummaryComponent.packageTypes.toString(),
        };
        const model: CsTransaction = new CsTransaction(Object.assign(_merge(form, formData)));
        model.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaLCLExport;


        return model;
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid
            || (!!this.formCreateComponent.etd.value && !this.formCreateComponent.etd.value.startDate)
            || (!!this.formCreateComponent.podDescription.value && !this.formCreateComponent.pod.value)
            || (!this.formCreateComponent.polDescription.value
            || (!!this.formCreateComponent.serviceDate.value && !this.formCreateComponent.serviceDate.value.startDate))
        ) {
            valid = false;
        }

        if (
            this.shipmentGoodSummaryComponent.gw === null
            || this.shipmentGoodSummaryComponent.cbm === null
            || this.shipmentGoodSummaryComponent.packageQuantity === null
            || this.shipmentGoodSummaryComponent.gw < 0
            || this.shipmentGoodSummaryComponent.cbm < 0
            || this.shipmentGoodSummaryComponent.packageQuantity < 0
        ) {
            valid = false;
        }
        return valid;
    }

    onSaveJob() {
        [this.formCreateComponent.isSubmitted, this.shipmentGoodSummaryComponent.isSubmitted] = [true, true];
        if (Object.keys(this.selectedJob).length > 0) {
            this.containers = this.selectedJob.containers;
        }
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();

        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
            this.isImport = false;
        } else {
            this.saveJob(modelAdd);
        }
    }

    saveJob(body: any) {
        this._documenRepo.createTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.formCreateComponent.formGroup.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaLCLExport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.show();
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
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}
