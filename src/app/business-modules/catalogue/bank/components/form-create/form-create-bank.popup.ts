import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'form-create-bank-popup',
    templateUrl: './form-create-bank.popup.html'
})

export class FormCreateBankPopupComponent extends PopupBase implements OnInit {

    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    form: FormGroup;
    id: any;
    bankNameCode: AbstractControl;
    bankNameVN: AbstractControl;
    bankNameEN: AbstractControl;
    edit: AbstractControl;
    active: AbstractControl;

    isSubmitted: boolean = false;

    isUpdate: boolean = false;
    userModifiedName: any;
    userCreatedName: any;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
        this.form = this._fb.group({
            bankNameCode: [null, Validators.required],
            bankNameVN: [null, Validators.required],
            bankNameEN: [null, Validators.required],
            active: [true],
            userModifiedName:[],
            userCreatedName:[]
        });

        this.bankNameCode = this.form.controls['bankNameCode'];
        this.bankNameVN = this.form.controls['bankNameVN'];
        this.bankNameEN = this.form.controls['bankNameEN'];
        this.active = this.form.controls['active'];
        this.userModifiedName = this.form.controls['userModifiedName'];
        this.userCreatedName = this.form.controls['userCreatedName'];
    }

    onSubmit() {
        this.isSubmitted = true;

        const formData = this.form.getRawValue();
        if (this.form.valid) {
            const body: IBank = {
                Id :this.id,
                BankNameVN: formData.bankNameVN,
                BankNameEN: formData.bankNameEN,
                Code: formData.bankNameCode,
                Active: !!this.isUpdate ? formData.active : true
            };

            if (this.isUpdate) {
                this._catalogueRepo.updateBank(body)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addBank(body)
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

interface IBank {
    Id?:string;
    Code?: string;
    BankNameVN: string;
    BankNameEN: string;
    Active: boolean;
}
