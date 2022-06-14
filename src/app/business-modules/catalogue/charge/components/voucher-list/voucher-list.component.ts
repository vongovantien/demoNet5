import { Component, OnInit } from '@angular/core';
import { AppList } from 'src/app/app.list';

import { CatChargeToAddOrUpdate } from 'src/app/shared/models/catalogue/catChargeToAddOrUpdate.model';
import { CatChargeDefaultAccount } from 'src/app/shared/models/catalogue/catChargeDefaultAccount.model';
import { ChartOfAccounts } from '@models';
import { CatalogueRepo } from '@repositories';


@Component({
    selector: 'voucher-list',
    templateUrl: 'voucher-list.component.html'
})

export class VoucherListComponent extends AppList implements OnInit {

    ngDataTypeChargeDefault: Array<string> = ["Công Nợ", "Giải Chi", "Loại Khác"];
    isAddNewLine: boolean = false;

    value: any = {};

    ChargeToAdd: CatChargeToAddOrUpdate = new CatChargeToAddOrUpdate();

    isMaximumAccountRow: boolean = false;
    isSameVoucherType: boolean = false;
    isSubmitted: boolean = false;

    chartOfAccounts: ChartOfAccounts[] = [];

    configComboChartOfAccount: Partial<CommonInterface.IComboGirdConfig> = {};



    constructor(private _catalogueRepo: CatalogueRepo) {
        super();
    }


    ngOnInit() {
        this.headers = [
            { title: 'Voucher Type', field: '', sortable: false, width: 100 },
            { title: 'Account Debit No', field: '', sortable: false },
            { title: 'Account Credit No', field: '', sortable: false },
            { title: 'Account Debit No (VAT)', field: '', sortable: false },
            { title: 'Account Crebit No (VAT)', field: '', sortable: false },
        ];
        this.configComboChartOfAccount = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'accountCode', label: 'Account No' },
                { field: 'accountNameLocal', label: 'Account Local Name' },
            ]
        }, { selectedDisplayFields: ['accountCode'], });
        this.getChartOfAccountsActive();

    }

    removeDefaultAccount(index) {
        this.ChargeToAdd.listChargeDefaultAccount.splice(index, 1);
        this.isMaximumAccountRow = false;
    }

    public refreshValue(value: any): void {
        this.value = value;
    }

    selectedTypeDefault(value: any, index: number) {
        // const listAcc = this.ChargeToAdd.listChargeDefaultAccount;
        if (this.ChargeToAdd.listChargeDefaultAccount.findIndex(o => o.type === value.text) !== -1) {
            // if (findIndex(listAcc, function (o) { return o.type === value.text; }) !== -1) {
            this.isSameVoucherType = true;
        } else {
            this.isSameVoucherType = false;
            this.ChargeToAdd.listChargeDefaultAccount[index].type = value.text;
        }


    }

    removedTypeDefault(value: any, index: number) {
        this.ChargeToAdd.listChargeDefaultAccount[index].type = null;
    }

    validatateDefaultAcountLine() {
        if (this.ChargeToAdd.listChargeDefaultAccount.length > 0) {
            const index = this.ChargeToAdd.listChargeDefaultAccount.length - 1;
            if ((this.ChargeToAdd.listChargeDefaultAccount[index].debitAccountNo === '' || this.ChargeToAdd.listChargeDefaultAccount[index].debitAccountNo == null)
                && (this.ChargeToAdd.listChargeDefaultAccount[index].creditAccountNo === '' || this.ChargeToAdd.listChargeDefaultAccount[index].creditAccountNo == null)
                && (this.ChargeToAdd.listChargeDefaultAccount[index].creditVat == null)
                && (this.ChargeToAdd.listChargeDefaultAccount[index].debitVat == null) || this.ChargeToAdd.listChargeDefaultAccount[index].type == null) {
                return false;
            } else {
                return true;
            }
        }
        if (this.ChargeToAdd.listChargeDefaultAccount.length === 0) {
            return true;
        }

    }

    addNewChargeDedaultAccount() {
        const obj = new CatChargeDefaultAccount();
        if (this.ChargeToAdd.listChargeDefaultAccount.length === 0) {
            this.ChargeToAdd.listChargeDefaultAccount.push(obj);
        } else {
            if (this.validatateDefaultAcountLine()) {
                if (this.ChargeToAdd.listChargeDefaultAccount.length === 3) {
                    this.isMaximumAccountRow = true;
                } else {
                    this.ChargeToAdd.listChargeDefaultAccount.push(obj);
                    this.isAddNewLine = false;
                }
            } else {
                this.isAddNewLine = true;
            }

        }
    }

    getChartOfAccountsActive() {
        this._catalogueRepo.getChartOfAccountsActive().subscribe((res: any) => {
            if (!!res) {
                this.chartOfAccounts = res;
            }
        });
    }


}
