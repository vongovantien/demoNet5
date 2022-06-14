import { Component, Output, EventEmitter, Input } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AppForm } from '@app';
import { User, Currency, Partner } from '@models';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { getCurrentUserState, IAppState } from '@store';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
@Component({
    selector: 'settle-payment-form-create',
    templateUrl: './form-create-settlement.component.html',
    styleUrls: ['./form-create-settlement.component.scss']
})

export class SettlementFormCreateComponent extends AppForm {
    @Input() set readOnly(val: any) {
        this._readonly = coerceBooleanProperty(val);
    }

    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

    get readonlyForm(): boolean {
        return this._readonly;
    }

    private _readonly: boolean = false;
    @Output() onChangeCurrency: EventEmitter<Currency> = new EventEmitter<Currency>();

    users: Observable<User[]>;
    userLogged: Partial<SystemInterface.IClaimUser>;

    form: FormGroup;
    settlementNo: AbstractControl;
    requester: AbstractControl;
    requestDate: AbstractControl;
    paymentMethod: AbstractControl;
    amount: AbstractControl;
    currency: AbstractControl;
    note: AbstractControl;
    statusApproval: AbstractControl;
    payee: AbstractControl;
    beneficiaryName: AbstractControl;
    bankAccountNo: AbstractControl;
    bankName: AbstractControl;
    bankNameDescription: AbstractControl;
    advanceAmount: AbstractControl;
    balanceAmount: AbstractControl;
    bankCode: AbstractControl;
    dueDate: AbstractControl;

    currencyList: any[] = [{ id: 'VND' }, { id: 'USD' }];
    displayFieldBank: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Bank Code' },
        { field: 'bankNameEn', label: 'Bank Name' }
    ];
    methods: CommonInterface.ICommonTitleValue[];

    customers: any;
    banks: Observable<any[]>;

    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit() {
        this.initFormSettlement();
        this.initBasicData();
        this.getUserLogged();
        this.getSystemUser();
        this.getCustomer();
        this.banks = this._catalogueRepo.getListBank(null, null, { active: true });

    }

    initFormSettlement() {
        this.form = this._fb.group({
            'settlementNo': [{ value: null, disabled: true }],
            'requester': [{ value: null, disabled: true }],
            'requestDate': [{ startDate: new Date(), endDate: new Date() }, Validators.required],
            'paymentMethod': [],
            'amount': [{ value: null, disabled: true }],
            'currency': ['VND'],
            'note': [],
            'statusApproval': ['New'],
            'payee': [],
            'beneficiaryName': [],
            'bankAccountNo': [],
            'bankName': [],
            'bankNameDescription': [],
            'advanceAmount': [],
            'balanceAmount': [],
            'bankCode': [],
            'dueDate': []
        });


        this.settlementNo = this.form.controls['settlementNo'];
        this.requester = this.form.controls['requester'];
        this.requestDate = this.form.controls['requestDate'];
        this.paymentMethod = this.form.controls['paymentMethod'];
        this.amount = this.form.controls['amount'];
        this.currency = this.form.controls['currency'];
        this.note = this.form.controls['note'];
        this.statusApproval = this.form.controls['statusApproval'];
        this.payee = this.form.controls['payee'];
        this.beneficiaryName = this.form.controls['beneficiaryName'];
        this.bankAccountNo = this.form.controls['bankAccountNo'];
        this.bankName = this.form.controls['bankName'];
        this.bankNameDescription = this.form.controls['bankNameDescription'];
        this.advanceAmount = this.form.controls['advanceAmount'];
        this.balanceAmount = this.form.controls['balanceAmount'];
        this.bankCode = this.form.controls['bankCode'];
        this.dueDate = this.form.controls['dueDate'];

        this.currency.valueChanges.pipe(
            map((data: any) => data)
        ).subscribe((value: Currency) => {
            if (!!value) {
                this.onChangeCurrency.emit(value);
            }
        });
    }

    getUserLogged() {
        this._store.select(getCurrentUserState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: any) => {
                if (!!res) {
                    this.userLogged = res;
                    if (!this.readonlyForm) {
                        this.requester.setValue(this.userLogged.id);
                    }
                }
            })
    }

    getSystemUser() {
        this.users = this._systemRepo.getListSystemUser({ active: true });
    }

    initBasicData() {
        this.methods = this.getMethod();
        this.paymentMethod.setValue(this.methods[0]);
    }

    getMethod(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Cash', value: 'Cash' },
            { title: 'Bank Transfer', value: 'Bank' },
            { title: 'Net Off Shipment', value: 'NETOFF_SHPT' },
            { title: 'Other', value: 'Other' },
        ];
    }

    getCustomer() {
        const customersFromService = this._catalogueRepo.getCurrentCustomerSource();
        if (!!customersFromService.data.length) {
            this.customers = customersFromService.data;
            return;
        }
        this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL).subscribe(
            (data) => {
                this._catalogueRepo.customersSource$.next({ data }); // * Update service.
                this.customers = data;
            }
        );
    }

    getBeneficiaryInfo() {
        if (!!this.payee.value) {
            if (this.paymentMethod.value === this.methods[1] || this.paymentMethod.value === this.methods[3]) {
                const beneficiary = this.getPartnerById(this.payee.value);
                if (!!beneficiary) {
                    this.beneficiaryName.setValue(beneficiary.partnerNameVn);
                    this.bankAccountNo.setValue(beneficiary.bankAccountNo);
                    this.setBankInfo(beneficiary);
                }
            } else {
                this.resetBankInfo();
            }
        } else {
            this.resetBankInfo();
            if (this.paymentMethod.value === this.methods[1]) {
                if (!!this.userLogged) {
                    this.beneficiaryName.setValue(this.userLogged.nameVn);
                    this.bankAccountNo.setValue(this.userLogged.bankAccountNo);
                    this.setBankInfo(this.userLogged);
                }
            }
        }
    }

    setBankInfo(data: any) {
        this.bankName.setValue(data.bankCode);
        this.bankNameDescription.setValue(data.bankName);
        this.mapBankCode(data.bankCode);
    }

    resetBankInfo() {
        this.beneficiaryName.setValue(null);
        this.bankAccountNo.setValue(null);
        this.bankName.setValue(null);
        this.bankNameDescription.setValue(null);
        this.mapBankCode(null);
    }

    getPartnerById(id: string) {
        const partner: Partner = !this.customers ? null : this.customers.find((p: Partner) => p.id === id);
        return partner || null;
    }

    mapBankCode(data: any) {
        this.bankCode.setValue(data);
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'bankName':
                this.bankName.setValue(data.code);
                this.bankNameDescription.setValue(data.bankNameEn);
                break;
        }
    }

    checkStaffPartner() {
        const payeeInfo = this.getPartnerById(this.payee.value);
        if ((!this.payee.value || payeeInfo.partnerGroup.indexOf('STAFF') !== -1) && this.paymentMethod.value === this.methods[2]) {
            return true;
        }
        return false;
    }
}
