import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';

import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-add-country',
    templateUrl: './add-country.component.html'
})
export class FormCountryPopupComponent extends PopupBase implements OnInit {

    @Output() onChange = new EventEmitter<boolean>();

    formAddCountry: FormGroup;
    code: AbstractControl;
    nameEn: AbstractControl;
    nameVn: AbstractControl;
    active: AbstractControl;
    id: number = 0;

    isUpdate: boolean = false;
    isSubmitted = false;

    constructor(
        private _fb: FormBuilder,
        private catalogueRepo: CatalogueRepo,
        protected _progressService: NgProgress,
        private _toastService: ToastrService
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formAddCountry = this._fb.group({
            code: ['', Validators.compose([
                Validators.required
            ])],
            nameEn: ['', Validators.compose([
                Validators.required
            ])],
            nameVn: ['', Validators.compose([
                Validators.required
            ])],
            active: [true]

        });
        this.code = this.formAddCountry.controls['code'];
        this.nameEn = this.formAddCountry.controls['nameEn'];
        this.nameVn = this.formAddCountry.controls['nameVn'];
        this.active = this.formAddCountry.controls['active'];
    }

    cancelAdd() {
        this.isSubmitted = false;

        this.hide();
        this.formAddCountry.reset();
    }

    saveCountry() {
        this.isSubmitted = true;
        if (this.formAddCountry.valid) {
            const formData = this.formAddCountry.getRawValue();

            const body = {
                code: formData.code,
                nameEn: formData.nameEn,
                nameVn: formData.nameVn,
                id: this.id,
                active: !!this.isUpdate ? formData.active : true,
            };
            this._progressRef.start();
            if (this.isUpdate) {
                this.catalogueRepo.updateCountry(body)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => {
                            this._progressRef.complete();
                        })
                    )
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this.catalogueRepo.addCountry(body)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => {
                            this._progressRef.complete();
                        })
                    )
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }

        }
    }

    onHandleResult(res: CommonInterface.IResult) {
        if (res.status) {
            this._toastService.success(res.message);

            this.hide();
            this.onChange.emit(true);
        } else {
            this._toastService.error(res.message);
        }
    }
}
