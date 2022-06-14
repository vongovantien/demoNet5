import { Component, Input, EventEmitter, Output } from '@angular/core';
import { eFMSPopup } from '../popup';
import { InfoPopupConfig } from '@app';

@Component({
    selector: 'info-popup',
    templateUrl: 'info.popup.html',
    styleUrls: ['./info.popup.scss'],
})

export class InfoPopupComponent extends eFMSPopup implements InfoPopupConfig {

    @Input() title: string = 'Notification';
    @Input() body: string = 'Default Info Popup';
    @Input() isShowButton: boolean = true;
    @Input() label: string = 'Ok';
    @Input() align: CommonType.DIRECTION = 'center';
    @Input() class: string = '';
    @Output() onSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
        super();
    }

    ngOnInit(): void { }

    close() {
        this.hide();
        this.onSubmit.emit(true);
    }

}