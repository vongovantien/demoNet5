import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'popup-salesman-credit-limit',
    templateUrl: 'salesman-credit-limit.popup.html'
})

export class SalesmanCreditLimitPopupComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();

    formGroup: FormGroup;


    constructor(
        private _fb: FormBuilder,

    ) {
        super();
    }
    initForm() {
        this.formGroup = this._fb.group({
            creditLimit: [],
            creditRate: [120]
        });
    }

    close() {
        this.hide();
    }

    onSubmit() {
        const body: ISalesmanCreditLimit = {
            creditLimit: this.formGroup.controls['creditLimit'].value,
            creditRate: this.formGroup.controls['creditRate'].value
        }
        this.onRequest.emit(body);
        this.hide();
    }

    ngOnInit() {
        this.initForm();
    }

}


export interface ISalesmanCreditLimit {
    creditLimit: number;
    creditRate: number;
}
