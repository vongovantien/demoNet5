import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { AppForm } from '@app';
import { ShareBusinessImportJobDetailPopupComponent } from '@share-bussiness';
import { CsTransaction } from '@models';
import { CommonEnum } from '@enums';
import { DocumentationRepo } from '@repositories';
import { InfoPopupComponent } from '@common';
import { RoutingConstants } from '@constants';

import { ShareSeaServiceFormCreateSeaImportComponent } from '../../share-sea/components/form-create-sea-import/form-create-sea-import.component';
import { ShareSeaServiceShipmentGoodSummaryLCLComponent } from '../../share-sea/components/shipment-good-summary-lcl/shipment-good-summary-lcl.component';

import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';
@Component({
    selector: 'app-create-job-lcl-import',
    templateUrl: './create-job-lcl-import.component.html'
})

export class SeaLCLImportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareSeaServiceFormCreateSeaImportComponent) formCreateComponent: ShareSeaServiceFormCreateSeaImportComponent;
    @ViewChild(ShareSeaServiceShipmentGoodSummaryLCLComponent) shipmentGoodSummaryComponent: ShareSeaServiceShipmentGoodSummaryLCLComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    isImport: boolean = false;
    selectedJob: any = {}; // TODO model.

    constructor(
        protected _router: Router,
        protected _documenRepo: DocumentationRepo,
        protected _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}`]);
    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaLCLImport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.show();
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.formCreateComponent.formCreate.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

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
        model.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaLCLImport;

        return model;

    }

    checkValidateForm() {
        let valid: boolean = true;
        if (
            !this.formCreateComponent.formCreate.valid
            || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)
            || (!!this.formCreateComponent.polDescription.value && !this.formCreateComponent.pol.value)
            || (!this.formCreateComponent.podDescription.value
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

    onCreateJob() {
        [this.formCreateComponent.isSubmitted, this.shipmentGoodSummaryComponent.isSubmitted] = [true, true];

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

    importJob(body: any) {
        this._documenRepo.importCSTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
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

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }
}
