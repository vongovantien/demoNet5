import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'exchange-rate-history-popup',
    templateUrl: './exchange-rate-history.popup.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangeRateHistoryPopupComponent extends PopupBase implements OnInit {
    @Input() exchangeRatesOfDay: any;

    constructor() {
        super();
    }

    ngOnInit(): void { }
    hide() {
        this.popup.hide();
        this.exchangeRatesOfDay = null;
    }
}
