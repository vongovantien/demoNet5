import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AccountingConstants, JobConstants } from '@constants';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { AccountingRepo, CatalogueRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Partner, ReceiptModel } from '@models';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { IAppState, getCurrentUserState } from '@store';
import { Store } from '@ngrx/store';
import { formatDate } from '@angular/common';

@Component({
    selector: 'form-quick-update-receipt',
    templateUrl: './form-quick-update-receipt.popup.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ARCustomerPaymentFormQuickUpdateReceiptPopupComponent extends PopupBase implements OnInit {
    @Input() updateKey: string = '';
    @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
    @Input() receipt: ReceiptModel;

    form: FormGroup;
    paymentMethod: AbstractControl;
    paymentRefNo: AbstractControl;
    obhpartnerId: AbstractControl;
    paymentDate: AbstractControl;
    bankAccountNo: AbstractControl;

    paymentMethods: string[] = [
        AccountingConstants.RECEIPT_PAYMENT_METHOD.CASH,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.BANK,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE_BANK,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE_CASH,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.INTERNAL,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.COLL_INTERNAL,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.OBH_INTERNAL,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.MANAGEMENT_FEE,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.OTHER_FEE,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.EXTRA,
        AccountingConstants.RECEIPT_PAYMENT_METHOD.OTHER
    ];

    obhPartners: Observable<Partner[]>;
    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;


    constructor(
        private readonly _fb: FormBuilder,
        private readonly _accountingRepo: AccountingRepo,
        private readonly _toastService: ToastrService,
        private readonly _catalogueRepo: CatalogueRepo,
        private readonly _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit(): void {
        this.form = this._fb.group({
            'paymentRefNo': [null, Validators.required],
            'paymentMethod': [],
            'obhpartnerId': [],
            'paymentDate': [],
            bankAccountNo: []
        });

        this.paymentMethod = this.form.controls['paymentMethod'];
        this.paymentRefNo = this.form.controls['paymentRefNo'];
        this.obhpartnerId = this.form.controls['obhpartnerId'];
        this.paymentDate = this.form.controls['paymentDate'];
        this.bankAccountNo = this.form.controls['bankAccountNo'];

        this.obhPartners = this._store.select(getCurrentUserState)
            .pipe(
                filter((c: any) => !!c.userName),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getListPartner(null, null, { active: true, partnerMode: 'Internal', notEqualInternalCode: currentUser.internalCode });
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            )
    }

    setValueForm(control: string, value: any = null) {
        this.form.controls[control].setValue(value);
    }

    onConfirmSave() {
        this.isSubmitted = true;
        if (!this.form.valid) return;

        const valueForm = this.form.getRawValue();
        const body: IModelQuickUpdateReceipt = {
            paymentMethod: valueForm.paymentMethod,
            paymentRefNo: valueForm.paymentRefNo,
            obhpartnerId: valueForm.obhpartnerId,
            paymentDate: !!valueForm.paymentDate.startDate ? formatDate(valueForm.paymentDate.startDate, 'yyyy-MM-dd', 'en') : null,
            bankAccountNo: valueForm.bankAccountNo
        };
        console.log(body);

        if (this.receipt) {
            this._accountingRepo.quickUpdateReceipt(this.receipt.id, body)
                .pipe()
                .subscribe((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onSuccess.emit({ id: this.receipt.id, type: this.updateKey, data: body });
                        this.hide();
                        return;
                    }
                    this._toastService.error(res.message);
                })
        }
    }

    autoGenerateReceiptNo() {
        if (!this.receipt) {
            return;
        }
        const modelReceipt: IGenerateReceiptV2 = {
            paymentMethod: this.receipt.paymentMethod,
            currencyId: this.receipt.currencyId,
            paymentDate: this.receipt.paymentDate
        }
        this._accountingRepo.generateReceiptNo(modelReceipt).subscribe(
            (data: any) => {
                if (!!data) {
                    const { receiptNo } = data;
                    this.setValueForm('paymentRefNo', receiptNo);
                }
            }
        );
    }


}

export interface IModelQuickUpdateReceipt {
    paymentMethod: string;
    paymentRefNo: string;
    obhpartnerId: string;
    paymentDate: string;
    bankAccountNo: string;
}

interface IGenerateReceiptV2 {
    paymentMethod: string;
    currencyId: string;
    paymentDate: Date;
}
