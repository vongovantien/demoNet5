import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppList } from 'src/app/app.list';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as fromStore from './../../store';


@Component({
    selector: 'grant-total-profit',
    templateUrl: './grant-total-profit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShareBussinessGrantTotalProfitComponent extends AppList {

    shipmentProfits$: Observable<fromStore.ITransactionProfit[]>;
    totalUSD$: Observable<number>;
    totalVND$: Observable<number>;

    headers: CommonInterface.IHeaderTable[];

    constructor(
        private _store: Store<fromStore.IShareBussinessState>,
    ) {
        super();
    }

    ngOnInit() {
        this.shipmentProfits$ = this._store.select(fromStore.getTransactionProfitState);

        this.totalUSD$ = this.shipmentProfits$.pipe(
            map((profits: any[]) => (profits || []).reduce((acc: number, curr: any) => acc += curr.profitUSD, 0))
        );
        this.totalVND$ = this.shipmentProfits$.pipe(
            map((profits: fromStore.ITransactionProfit[]) => (profits || []).reduce((acc: number, curr: any) => acc += curr.profitLocal, 0))
        );

        this.headers = [
            { title: 'USD', field: 'profitUSD', dataType: 'CURRENCY' },
            { title: 'Local (VND)', field: 'profitLocal', dataType: 'CURRENCY' }
        ];
    }
}
