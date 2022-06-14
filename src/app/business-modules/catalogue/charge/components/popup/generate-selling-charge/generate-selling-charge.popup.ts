import { Component, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CatalogueRepo } from '@repositories';
import { ChartOfAccounts } from '@models';

@Component({
    selector: 'generate-selling-charge-popup',
    templateUrl: 'generate-selling-charge.popup.html'
})

export class GenerateSellingChargePopupComponent extends PopupBase {
    @Output() onCreatSellingCharge: EventEmitter<any> = new EventEmitter<any>();

    formGenerate: FormGroup;
    chargeCode: AbstractControl;
    accountNo: AbstractControl;
    accountNoVAT: AbstractControl;

    chartOfAccounts: ChartOfAccounts[] = [];

    chartOfAccount: ChartOfAccounts = new ChartOfAccounts;

    configComboChartOfAccount: Partial<CommonInterface.IComboGirdConfig> = {};


    constructor(private _fb: FormBuilder, private _catalogueRepo: CatalogueRepo) {
        super();
    }

    ngOnInit() {
        this.formGenerate = this._fb.group({
            chargeCode: [null, Validators.required],
            accountNo: [],
            accountNoVAT: []
        });
        this.chargeCode = this.formGenerate.controls['chargeCode'];
        this.accountNo = this.formGenerate.controls['accountNo'];
        this.accountNoVAT = this.formGenerate.controls['accountNoVAT'];
        this.configComboChartOfAccount = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'accountCode', label: 'Account No' },
                { field: 'accountNameLocal', label: 'Account Local Name' },
            ]
        }, { selectedDisplayFields: ['accountCode'], });
        this.getChartOfAccountsActive();
    }

    close() {
        this.hide();
    }

    getChartOfAccountsActive() {
        this._catalogueRepo.getChartOfAccountsActive().subscribe((res: any) => {
            if (!!res) {
                this.chartOfAccounts = res;
                console.log(this.chartOfAccounts);
            }
        });
    }

    onSelectDataFormInfo(data: any, type: string) {
        if (type === 'accountNo') {
            this.accountNo.setValue(data.accountCode);
        } else {
            this.accountNoVAT.setValue(data.accountCode);
        }
    }

    onSave() {
        this.isSubmitted = true;
        if (!this.chargeCode.value) {
            return;
        }
        if (this.formGenerate.valid) {
            const body: any = {
                chargeCode: this.chargeCode.value,
                accountNo: this.accountNo.value,
                accountNoVAT: this.accountNoVAT.value
            }
            console.log(body);
            this.onCreatSellingCharge.emit(body);
        }
    }

    onRemove() {

    }


}
