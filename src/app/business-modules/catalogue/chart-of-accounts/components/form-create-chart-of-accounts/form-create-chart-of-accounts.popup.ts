import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CatalogueRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'form-create-chart-of-accounts-popup',
    templateUrl: 'form-create-chart-of-accounts.popup.html'
})

export class FormCreateChartOfAccountsPopupComponent extends PopupBase implements OnInit {
    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    formChart: FormGroup;

    isSubmitted: boolean = false;
    isUpdate: boolean = false;

    active: AbstractControl;

    idChart: string = '';

    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService) {
        super();
    }

    ngOnInit() {
        this.formChart = this._fb.group({
            accountCode: [null, Validators.required],
            accountNameLocal: [null, Validators.required],
            accountNameEn: [null, Validators.required],
            active: [true],
        });
        this.active = this.formChart.controls['active'];

    }

    onSubmit() {
        this.isSubmitted = true;
        const formData = this.formChart.getRawValue();
        if (this.formChart.valid) {
            const body: IChart = {
                accountCode: this.formChart.controls['accountCode'].value,
                accountNameEn: this.formChart.controls['accountNameEn'].value,
                accountNameLocal: this.formChart.controls['accountNameLocal'].value,
                active: formData.active
            };

            if (this.isUpdate) {
                body.id = this.idChart;
                this._catalogueRepo.updateChartOfAccounts(body)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addChartOfAccounts(body)
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

interface IChart {
    id?: string;
    accountCode: string;
    accountNameEn: string;
    accountNameLocal: string;
    active: boolean;
}
