import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import { AppForm } from '@app';
import { InfoPopupComponent } from '@common';
import { DocumentationRepo } from '@repositories';
import { CsTransaction } from '@models';
import { CommonEnum } from '@enums';
import {
    ShareBusinessImportJobDetailPopupComponent,
} from '@share-bussiness';

import { RoutingConstants } from '@constants';
import { ShareAirServiceFormCreateComponent } from '../../share-air/components/form-create/form-create-air.component';

import * as fromShareBusiness from '../../../share-business/store';
import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';


@Component({
    selector: 'app-create-job-air-import',
    templateUrl: './create-job-air-import.component.html'
})

export class AirImportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareAirServiceFormCreateComponent) formCreateComponent: ShareAirServiceFormCreateComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: true }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    isImport: boolean = false;
    selectedJob: CsTransaction;

    constructor(
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _store: Store<fromShareBusiness.IShareBussinessState>,
        protected _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new fromShareBusiness.TransactionGetDetailSuccessAction({}));
    }

    ngAfterViewInit(): void {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.AirImport;

        this.formImportJobDetailPopup.service = 'air';
        this._cd.detectChanges();
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formGroup.getRawValue();
        console.log(form);
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,
            ata: !!form.ata && !!form.ata.startDate ? formatDate(form.ata.startDate, 'yyyy-MM-dd', 'en') : null,
            atd: !!form.atd && !!form.atd.startDate ? formatDate(form.atd.startDate, 'yyyy-MM-dd', 'en') : null,

            commodity: !!form.commodity && !!form.commodity.length ? form.commodity.toString() : null,
        };
        const airImportAddModel: CsTransaction = new CsTransaction(Object.assign(_merge(form, formData)));
        airImportAddModel.transactionTypeEnum = CommonEnum.TransactionTypeEnum.AirImport;

        return airImportAddModel;
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)
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
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.formCreateComponent.isUpdate = true;
        this.formCreateComponent.formGroup.controls['jobNo'].setValue(null);
        this.formCreateComponent.formGroup.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

        this._store.dispatch(new fromShareBusiness.GetDimensionAction(selectedData.id));
    }

    showImportPopup() {

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

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}`]);
    }
}
