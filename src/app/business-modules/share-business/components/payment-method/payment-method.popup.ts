import { PopupBase } from "@app";
import { Component, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";

@Component({
    selector: 'payment-method-popup',
    templateUrl: './payment-method.popup.html'
})
export class ShareBussinessPaymentMethodPopupComponent extends PopupBase {
    @Output() onApply: EventEmitter<string> = new EventEmitter<string>();
    paymentMethods: string[] = ['Cash', 'Bank Transfer'];

    formGroup: FormGroup;

    paymentMethod: AbstractControl;

    constructor(
        private _fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.formGroup = this._fb.group({
            paymentMethod: this.paymentMethods[0]
        });
        this.paymentMethod = this.formGroup.controls['paymentMethod'];
    }

    apply() {
        this.hide();
        this.onApply.emit(this.paymentMethod.value);
    }

    closePopup() {
        this.hide();
    }
}