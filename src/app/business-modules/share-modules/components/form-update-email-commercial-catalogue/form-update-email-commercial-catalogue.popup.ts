import { Component, Output, EventEmitter } from '@angular/core';
import { PopupBase } from '@app';
import { SystemRepo, CatalogueRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { Office } from '@models';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgProgress } from '@ngx-progressbar/core';
import _merge from 'lodash/merge';
import { ToastrService } from 'ngx-toastr';
import { PartnerEmail } from 'src/app/shared/models/catalogue/partnerEmail.model';
import _cloneDeep from 'lodash/cloneDeep';
@Component({
    selector: 'popup-update-email-commercial-catalogue',
    templateUrl: 'form-update-email-commercial-catalogue.popup.html'
})

export class FormUpdateEmailCommercialCatalogueComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();

    officeId: AbstractControl;
    type: AbstractControl;
    email: AbstractControl;
    partnerId: string = '';
    id: string = '';

    indexDetailEmail: number = null;

    formGroup: FormGroup;

    types: Array<string> = ["Billing", "Document"];
    offices: CommonInterface.INg2Select[] = [];

    isUpdate: boolean = false;
    constructor(private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        private _ngProgressService: NgProgress) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this.initForm();
        this.getOffices();
    }
    initForm() {
        this.formGroup = this._fb.group({
            officeId: [null, Validators.required],
            type: [null, Validators.required],
            email: [null, Validators.required]
        });
        this.officeId = this.formGroup.controls['officeId'];
        this.type = this.formGroup.controls['type'];
        this.email = this.formGroup.controls['email'];
        if (!this.isUpdate) {
            this.type.setValue("Billing");
        }
    }

    getOffices() {
        this._systemRepo.getAllOffice()
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: Office[]) => {
                    if (!!res) {
                        this.offices = this.utility.prepareNg2SelectData(res || [], 'id', 'shortName');
                    }
                },
            );
    }

    getFormData() {
        this.isSubmitted = true;
        if (this.formGroup.valid) {
            const formBody = this.formGroup.getRawValue();
            const cloneObject = {
                officeId: !!formBody.officeId ? formBody.officeId.id : null,
                type: !!formBody.type ? formBody.type : null,
                email: !!formBody.email ? formBody.email : null
            };
            const mergeObj = Object.assign(_merge(formBody, cloneObject));
            mergeObj.partnerId = this.partnerId;
            return mergeObj;
        }
    }

    updateFormValue(data: PartnerEmail) {
        const formValue = {
            officeId: !!data.officeId ? { id: data.officeId, text: this.offices.find(x => x.id === data.officeId).text } : null,
            type: !!data.type ? data.type : null,
            email: !!data.email ? data.email : null
        };
        this.formGroup.patchValue(_merge(_cloneDeep(data), formValue));
    }

    onSubmit() {
        const mergeObj = this.getFormData();
        if (this.formGroup.valid) {
            if (!!this.partnerId) {
                if (!this.isUpdate) {
                    this._catalogueRepo.addEmailPartner(mergeObj)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: any) => {
                                if (res.success) {
                                    this._toastService.success('New data added');
                                    this.onRequest.emit(true);
                                    this.hide();
                                } else {
                                    this._toastService.error("Opps", "Something getting error!");
                                }
                            }
                        );
                } else {
                    mergeObj.id = this.id;
                    this._catalogueRepo.updateEmailPartner(mergeObj)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: any) => {
                                if (res.status) {
                                    this._toastService.success(res.message);
                                    this.onRequest.emit(true);
                                    this.hide();
                                } else {
                                    this._toastService.error("Opps", "Something getting error!");
                                }
                            }
                        );
                }
            }
            else {
                mergeObj.index = this.indexDetailEmail;
                this.onRequest.emit(mergeObj);
            }
        }
    }

    close() {
        this.hide();
    }
}