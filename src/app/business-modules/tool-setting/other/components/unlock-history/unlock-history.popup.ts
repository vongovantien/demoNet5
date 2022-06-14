import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'unlock-history-popup',
    templateUrl: './unlock-history.popup.html'
})

export class UnlockHistoryPopupComponent extends PopupBase implements OnInit {

    @Input() body: string[] = [];
    @Output() onUnlock: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
        super();
    }

    ngOnInit() { }

    onSubmit() {
        this.onUnlock.emit(true);

        this.hide();
    }
}