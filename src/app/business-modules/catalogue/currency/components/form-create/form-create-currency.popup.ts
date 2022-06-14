import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'form-create-currency-popup',
    templateUrl: './form-create-currency.popup.html'
})

export class FormCreateCurrencyPopupComponent extends PopupBase implements OnInit {

    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    form: FormGroup;
    code: AbstractControl;
    name: AbstractControl;
    active: AbstractControl;
    default: AbstractControl;

    isSubmitted: boolean = false;

    isUpdate: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
        this.form = this._fb.group({
            code: [null, Validators.required],
            name: [null, Validators.required],
            active: [true],
            default: [false]
        });

        this.code = this.form.controls['code'];
        this.name = this.form.controls['name'];
        this.default = this.form.controls['default'];
        this.active = this.form.controls['active'];
    }

    onSubmit() {
        this.isSubmitted = true;

        const formData = this.form.getRawValue();
        if (this.form.valid) {
            const body: ICurrency = {
                currencyName: formData.name,
                id: formData.code,
                active: !!this.isUpdate ? formData.active : true,
                isDefault: !!this.isUpdate ? formData.default : false
            };

            if (this.isUpdate) {
                this._catalogueRepo.updateCurrency(body)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addCurrency(body)
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

interface ICurrency {
    id?: string;
    currencyName: string;
    isDefault: boolean;
    active: boolean;
}
