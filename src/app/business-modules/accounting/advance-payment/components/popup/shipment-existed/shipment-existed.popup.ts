import { Component, OnInit, EventEmitter, Output, ChangeDetectionStrategy, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'shipment-existed-popup',
    templateUrl: './shipment-existed.popup.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancePaymentShipmentExistedPopupComponent extends PopupBase implements OnInit {
    @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
    @Input() items: IShipmentExistedAdvance[] = [];
    @Input() jobNo: string;

    constructor() {
        super();
    }

    ngOnInit(): void { }

    submit() {
        this.onSubmit.emit();
    }

}

interface IShipmentExistedAdvance {
    requester: string;
    totalAmount: number;
    currency: string;
    requestDate: Date;
    advanceNo: string;
    statusApproval: string;
}

