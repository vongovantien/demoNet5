import { Component, ChangeDetectionStrategy } from '@angular/core';

import * as fromStore from './../../store';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { AppList } from 'src/app/app.list';
@Component({
    selector: 'hbl-profit-summary',
    templateUrl: './profit-summary.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShareBussinessProfitSummaryComponent extends AppList {

    hblProfit$: Observable<fromStore.IHBLProfit>;
    totalUSD$: Observable<number>;
    totalVND$: Observable<number>;

    headers: CommonInterface.IHeaderTable[];

    constructor(
        private _store: Store<fromStore.SurchargeAction>
    ) {
        super();
    }

    ngOnInit() {
        this.hblProfit$ = this._store.select(fromStore.getProfitState);
        this.totalUSD$ = this.hblProfit$.pipe(
            map(data => data.profitUSD)
        );
        this.totalVND$ = this.hblProfit$.pipe(
            map(data => data.profitLocal)
        );

        this.headers = [
            { title: 'USD', field: 'profitUSD', dataType: 'CURRENCY' },
            { title: 'Local (VND)', field: 'profitLocal', dataType: 'CURRENCY' }
        ];

    }
}