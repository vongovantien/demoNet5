import { Component, OnInit, Input } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { CatalogueRepo, AccountingRepo } from '@repositories';
import { AccountingConstants } from '@constants';
import { ChartOfAccounts, Currency, Partner } from '@models';
import { CommonEnum } from '@enums';
import { IAppState, getCatalogueCurrencyState, GetCatalogueCurrencyAction } from '@store';

import { getAccoutingManagementPartnerState, IAccountingManagementPartnerState, getAccoutingManagementPaymentTermState, UpdateExchangeRate } from '../../store';

import { Observable, forkJoin } from 'rxjs';
import { map, debounceTime, takeUntil, distinctUntilChanged, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';

@Component({
    selector: 'form-create-vat-invoice',
    templateUrl: './form-create-vat-invoice.component.html'
})

export class AccountingManagementFormCreateVATInvoiceComponent extends AppForm implements OnInit {
    @Input() set update(u: boolean) {
        this._isUpdate = u;

    }
    get update() {
        return this._isUpdate;
    }
    private _isUpdate: boolean = false;

    formGroup: FormGroup;

    partnerId: AbstractControl;
    personalName: AbstractControl;
    totalExchangeRate: AbstractControl;
    voucherId: AbstractControl;
    date: AbstractControl;
    invoiceNoTempt: AbstractControl;
    invoiceNoReal: AbstractControl;
    serie: AbstractControl;
    paymentMethod: AbstractControl;
    accountNo: AbstractControl;
    totalAmount: AbstractControl;
    currency: AbstractControl;
    status: AbstractControl;
    attachDocInfo: AbstractControl;
    description: AbstractControl;
    paymentTerm: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameVn', label: 'Name Local' },
        { field: 'taxCode', label: 'Tax Code' },
    ];
    paymentMethods: string[] = AccountingConstants.PAYMENT_METHOD;

    displayFieldsChartAccount: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountCode', label: 'Account Code' },
        { field: 'accountNameLocal', label: 'Account Name Local' },
    ];

    partners: Observable<Partner[]>;
    listCurrency: Observable<Currency[]>;
    chartOfAccounts: Observable<ChartOfAccounts[]>;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>,
        private _accountingRepo: AccountingRepo,
    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCatalogueCurrencyAction());

        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.listCurrency = this._store.select(getCatalogueCurrencyState);
        this.chartOfAccounts = this._catalogueRepo.getListChartOfAccounts();

        this.initForm();

        this._store.select(getAccoutingManagementPartnerState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: IAccountingManagementPartnerState) => {
                    if (!!res.partnerId) {
                        if (!this.formGroup.controls['partnerId'].value) {
                            this.formGroup.controls['partnerId'].setValue(res.partnerId);
                            this.formGroup.controls['personalName'].setValue(res.partnerName);
                            this.formGroup.controls['partnerAddress'].setValue(res.partnerAddress);
                        }

                        if (!this.attachDocInfo.value) {
                            if (this.attachDocInfo.value !== res.inputRefNo) {
                                this.attachDocInfo.setValue(null);
                                this.attachDocInfo.setValue(this.updateAttachInfo(this.attachDocInfo.value, !!res.inputRefNo ? res.inputRefNo : ''));
                                this.description.setValue(`Hóa Đơn Thu Phí : ${this.attachDocInfo.value}`);
                            }
                        } else if (!!res.inputRefNo && !this.attachDocInfo.value.includes(res.inputRefNo)) {
                            this.attachDocInfo.setValue(this.updateAttachInfo(this.attachDocInfo.value, !!res.inputRefNo ? res.inputRefNo : ''));
                            this.description.setValue(`Hóa Đơn Thu Phí : ${this.attachDocInfo.value}`);

                        }
                    }
                }
            );

        // * Listen Payment term change form input ref no
        this._store.select(getAccoutingManagementPaymentTermState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res) => {
                    if (!this.paymentTerm.value) {
                        this.paymentTerm.setValue(res);
                    }
                }
            );

        if (!this.update) {
            this.generateVoucherId();
        }
    }

    initForm() {
        this.formGroup = this._fb.group({
            partnerId: [null, Validators.required],

            personalName: [],
            partnerAddress: [],
            description: [],
            attachDocInfo: [],
            totalExchangeRate: [],

            voucherId: [null, Validators.required],
            date: [{ startDate: new Date(), endDate: new Date() }],
            invoiceNoTempt: [null, Validators.required],
            invoiceNoReal: [{ value: null, disabled: true }],
            serie: [this.generateSerieNo(), Validators.required],
            paymentMethod: [this.paymentMethods[2]],
            accountNo: [],
            totalAmount: [{ value: null, disabled: true }],
            currency: ['VND'],
            status: ['New'],
            paymentTerm: [null, Validators.compose([
                Validators.required,
                Validators.max(31),
                Validators.min(1)
            ])],
        });

        this.partnerId = this.formGroup.controls['partnerId'];
        this.voucherId = this.formGroup.controls['voucherId'];
        this.invoiceNoTempt = this.formGroup.controls['invoiceNoTempt'];
        this.invoiceNoReal = this.formGroup.controls['invoiceNoReal'];
        this.date = this.formGroup.controls['date'];
        this.serie = this.formGroup.controls['serie'];
        this.paymentMethod = this.formGroup.controls['paymentMethod'];
        this.currency = this.formGroup.controls['currency'];
        this.accountNo = this.formGroup.controls['accountNo'];
        this.status = this.formGroup.controls['status'];
        this.totalExchangeRate = this.formGroup.controls['totalExchangeRate'];
        this.attachDocInfo = this.formGroup.controls['attachDocInfo'];
        this.description = this.formGroup.controls['description'];
        this.paymentTerm = this.formGroup.controls['paymentTerm'];


        if (!this.update) {
            this.invoiceNoTempt.valueChanges
                .pipe(
                    debounceTime(400),
                    startWith(this.invoiceNoTempt.value),
                    distinctUntilChanged()
                )
                .subscribe(
                    (res) => {
                        this.invoiceNoReal.setValue(res);
                    }
                );
            this.chartOfAccounts.subscribe(
                (accounts: ChartOfAccounts[]) => {
                    const defaultAccountNo: ChartOfAccounts = (accounts || []).find((a: ChartOfAccounts) => a.accountCode === AccountingConstants.DEFAULT_ACCOUNT_NO_CODE);
                    this.accountNo.setValue(!!defaultAccountNo ? defaultAccountNo.accountCode : null);

                }
            );
        }
    }

    onSelectDataFormInfo(data, type: string) {
        switch (type) {
            case 'partner':
                this.partnerId.setValue((data as Partner).id);
                break;
            case 'account':
                this.accountNo.setValue((data as ChartOfAccounts).accountCode);
                break;
            default:
                break;
        }
    }

    generateVoucherId() {
        forkJoin([
            this._accountingRepo.generateVoucherId('Invoice', null),
            this._accountingRepo.generateInvoiceNoTemp(),
        ])
            .subscribe(
                (res: any[]) => {
                    this.voucherId.setValue(res[0].voucherId);
                    this.invoiceNoTempt.setValue(res[1].invoiceNoTemp);
                    this.invoiceNoReal.setValue(res[1].invoiceNoTemp);
                }
            );
    }

    syncExchangeRateCharge() {
        if (!!this.totalExchangeRate.value) {
            // this._dataService.setData("generalExchangeRate", this.totalExchangeRate.value);
            this._store.dispatch(UpdateExchangeRate({ exchangeRate: this.totalExchangeRate.value }));

        }
    }

    generateSerieNo() {
        return `INV/${formatDate(new Date(), "yy", "en")}`;
    }

    updateAttachInfo(pre: string, cur: string) {
        if (!pre) {
            return cur;
        }
        return `${pre}${!!cur ? ', ' + cur : ''}`;
    }
}
