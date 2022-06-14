import { Component, Output, EventEmitter } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { ToastrService } from "ngx-toastr";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { formatDate } from "@angular/common";
import { NgProgress } from "@ngx-progressbar/core";

@Component({
    selector: 'confirm-billing-date-popup',
    templateUrl: './confirm-billing-date.popup.html'
})
export class ConfirmBillingDatePopupComponent extends PopupBase {
    @Output() onApply: EventEmitter<string> = new EventEmitter<string>();
    form: FormGroup;
    billingDate: AbstractControl;
    constructor(
        private _toastService: ToastrService,
        private _fb: FormBuilder,
        private _progressService: NgProgress,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.form = this._fb.group({
            billingDate: [{
                startDate: new Date(),
                endDate: new Date(),
            }]
        });
        this.billingDate = this.form.controls['billingDate'];
    }

    apply() {
        if (this.billingDate.value.startDate === null) {
            this._toastService.warning("Please select date");
            return;
        }
        const _billingDate = formatDate(this.billingDate.value.startDate, 'yyyy-MM-dd', 'en');
        this.onApply.emit(_billingDate);
        this.hide();
    }

    closePopup() {
        this.billingDate.setValue({
            startDate: new Date(),
            endDate: new Date(),
        });
        this.hide();
    }
}