import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AccountingRepo } from '@repositories';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
    selector: 'update-payment-voucher-popup',
    templateUrl: 'update-payment-voucher.popup.html'
})

export class UpdatePaymentVoucherPopupComponent extends PopupBase {

    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    formUpdateVoucher: FormGroup;
    voucherNo: AbstractControl;
    voucherDate: AbstractControl;

    constructor(private _accoutingRepo: AccountingRepo,
        private _fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.formUpdateVoucher = this._fb.group({
            voucherNo: [null, Validators.required],
            voucherDate: [null, Validators.required]
        });
        this.voucherNo = this.formUpdateVoucher.controls['voucherNo'];
        this.voucherDate = this.formUpdateVoucher.controls['voucherDate'];

    }

    onApply() {
        this.isSubmitted = true;
        if (!this.voucherNo.value || !this.voucherDate.value) {
            return;
        }
        const body: IVoucherDate = {
            voucherNo: this.voucherNo.value,
            voucherDate: this.voucherDate.value
        }
        this.onRequest.emit(body);
        this.hide();
    }

    onCancel() {
        this.hide();
    }

}
export interface IVoucherDate {
    voucherNo: string;
    voucherDate: string;
}