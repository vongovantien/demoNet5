import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'update-extend-day-popup',
    templateUrl: './update-extend-day.popup.html',
})
export class ARHistoryPaymentUpdateExtendDayPopupComponent extends PopupBase implements OnInit {
    @Output() onUpdateExtendDate: EventEmitter<any> = new EventEmitter<any>();
    formUpdateExtenDate: FormGroup;

    refId: string;
    type: string;
    invoiceNo: string;
    numberDaysExtend: AbstractControl;
    note: AbstractControl;
    paymentType: number;

    checkError: boolean = false; // flag -> click update button -> check validate

    constructor(
        private _fb: FormBuilder,
    ) {
        super();

    }

    ngOnInit(): void {
        this.formUpdateExtenDate = this._fb.group({
            numberDaysExtend: [null, Validators.required],
            note: []
        });

        //
        this.numberDaysExtend = this.formUpdateExtenDate.controls['numberDaysExtend'];
        this.note = this.formUpdateExtenDate.controls['note'];

    }

    updateExtendDate() {
        // null , number <= 0 , float, double
        if (!this.numberDaysExtend.value || this.numberDaysExtend.value <= 0 || this.numberDaysExtend.value % 1 !== 0) {
            this.checkError = true;
            return;
        }
        const body: IExtendDateUpdated = {
            refId: this.refId,
            type: this.type,
            invoiceNo: this.invoiceNo,
            numberDaysExtend: this.numberDaysExtend.value,
            note: this.note.value,
            paymentType: this.paymentType,
        };
        this.checkError = false;
        this.onUpdateExtendDate.emit(body);
        this.hide();

    }

    closePopup(): void {
        this.checkError = false;
        this.hide();
    }


}
export interface IExtendDateUpdated {
    refId: string;
    type: string;
    invoiceNo: string;
    numberDaysExtend: number;
    note: string;
    paymentType: number;
}
