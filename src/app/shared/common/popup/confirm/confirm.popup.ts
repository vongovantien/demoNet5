import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmPopupConfig } from 'src/app/app.base';
import { eFMSPopup } from '../popup';

@Component({
    selector: 'confirm-popup',
    templateUrl: './confirm.popup.html',
    styleUrls: ['./confirm.popup.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmPopupComponent extends eFMSPopup implements ConfirmPopupConfig {

    @Input() title: string = 'Notification';
    @Input() body: string = 'You are not allow to delete';
    @Input() labelConfirm: string = 'Yes';
    @Input() labelCancel: string = 'Cancel';
    @Input() iconConfirm = "la la-save";
    @Input() iconCancel: string = 'la la-ban';
    @Input() classConfirmButton: string = 'btn-brand';
    @Input() classCancelButton: string = 'btn-default';
    @Input() center: boolean = false;

    @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
    @Input() align: CommonType.DIRECTION = 'center';

    constructor() {
        super();
    }

    ngOnInit(): void { }

    onConfirm() {
        this.onSubmit.emit(true);
    }

    close() {
        this.hide();
        this.onCancel.emit();
    }
}


