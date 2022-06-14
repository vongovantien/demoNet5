import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import { AppForm } from '@app';
import { InfoPopupComponent } from '@common';
import { DocumentationRepo } from '@repositories';
import { CsTransaction } from '@models';
import { CommonEnum } from '@enums';
import { RoutingConstants } from '@constants';
import {
    GetDimensionAction,
    IShareBussinessState,
    ShareBusinessImportJobDetailPopupComponent,
    TransactionGetDetailSuccessAction,
} from '@share-bussiness';


import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';
import { ShareAirServiceFormCreateComponent } from '../../share-air/components/form-create/form-create-air.component';
@Component({
    selector: 'app-create-job-air-export',
    templateUrl: './create-job-air-export.component.html'
})

export class AirExportCreateJobComponent extends AppForm implements OnInit {

    // @ViewChild(ShareBusinessFormCreateAirComponent, { static: false }) formCreateComponent: ShareBusinessFormCreateAirComponent;
    @ViewChild(ShareAirServiceFormCreateComponent) formCreateComponent: ShareAirServiceFormCreateComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: true }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    isImport: boolean = false;
    selectedJob: CsTransaction;

    constructor(
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _store: Store<IShareBussinessState>
    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new TransactionGetDetailSuccessAction({}));
        this.formImportJobDetailPopup.service = 'air';
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formGroup.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,
            commodity: !!form.commodity && !!form.commodity.length ? form.commodity.toString() : null,
            ata: !!form.ata && !!form.ata.startDate ? formatDate(form.ata.startDate, 'yyyy-MM-dd', 'en') : null,
            atd: !!form.atd && !!form.atd.startDate ? formatDate(form.atd.startDate, 'yyyy-MM-dd', 'en') : null
        };
        const csTransaction: CsTransaction = new CsTransaction(Object.assign(_merge(form, formData)));
        csTransaction.transactionTypeEnum = CommonEnum.TransactionTypeEnum.AirExport;

        return csTransaction;
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid || (!!this.formCreateComponent.etd.value && !this.formCreateComponent.etd.value.startDate)
                                                    || (!!this.formCreateComponent.serviceDate.value && !this.formCreateComponent.serviceDate.value.startDate)) {
            valid = false;
        }
        return valid;
    }

    onSaveJob() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();
        modelAdd.dimensionDetails = this.formCreateComponent.dimensionDetails;

        modelAdd.dimensionDetails.forEach(d => {
            d.airWayBillId = null;
            d.hblid = null;
        });

        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
        } else {
            this.saveJob(modelAdd);
        }
    }

    saveJob(body: any) {
        this._documenRepo.createTransaction(body)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    onImport(selectedData: CsTransaction) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.formCreateComponent.isUpdate = true;
        this.formCreateComponent.formGroup.controls['jobNo'].setValue(null);
        this.formCreateComponent.formGroup.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);
        this._store.dispatch(new GetDimensionAction(selectedData.id));
    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.AirExport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.selected = -1;
        this.formImportJobDetailPopup.selectedShipment = null;
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

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}`]);
    }
}

