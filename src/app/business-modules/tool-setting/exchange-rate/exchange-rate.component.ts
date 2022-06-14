import { Component, OnInit, ViewChild } from '@angular/core';

import { SortService } from 'src/app/shared/services/sort.service';

import { CatalogueRepo } from '@repositories';
import { AppList } from 'src/app/app.list';
import { NgProgress } from '@ngx-progressbar/core';
import { ExchangeRateHistoryPopupComponent } from './components/detail-history/exchange-rate-history.popup';

import { finalize } from 'rxjs/operators';
import { ExchangeRateHistory } from '@models';
import { ExchangeRateConvertComponent } from './components/convert/exchange-rate-convert.component';
import { formatDate } from '@angular/common';


@Component({
    selector: 'app-exchange-rate',
    templateUrl: './exchange-rate.component.html',
})
export class ExchangeRateComponent extends AppList implements OnInit {

    @ViewChild(ExchangeRateHistoryPopupComponent) historyPopup: ExchangeRateHistoryPopupComponent;
    @ViewChild(ExchangeRateConvertComponent) convertPopup: ExchangeRateConvertComponent;

    exchangeRates: any[] = [];
    localCurrency = "VND";
    selectedrange: any;
    exchangeRatesOfDay: any;


    constructor(
        private sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgessService: NgProgress,
    ) {
        super();

        this.requestList = this.getExchangeRates;
        this.requestSort = this.onSortChange;
        this._progressRef = this._ngProgessService.ref();

    }

    ngOnInit() {
        this.headers = [
            { title: 'Exchange Rate Date', field: 'datetimeCreated', sortable: true },
            { title: 'Currency', field: 'localCurrency', sortable: true },
            { title: 'Update By', field: 'userModifield', sortable: true },
            { title: 'Update Time', field: 'datetimeUpdated', sortable: true },
        ];

        this.dataSearch = { localCurrencyId: this.localCurrency };
        this.getExchangeRates(this.dataSearch);

    }
    onSortChange() {
        this.exchangeRates = this.sortService.sort(this.exchangeRates, this.sort, this.order);
    }
    reloadHistory(event) {
        if (event) {
            this.searchHistory();
            this.convertPopup.getcurrencies();
        }
    }
    searchHistory() {
        this.dataSearch = { localCurrencyId: this.localCurrency };
        if (this.selectedrange != null) {
            this.dataSearch.fromDate = this.selectedrange.startDate != null ? formatDate(this.selectedrange.startDate, 'yyyy-MM-dd', 'en') : null;
            this.dataSearch.toDate = this.selectedrange.endDate != null ? formatDate(this.selectedrange.endDate, 'yyyy-MM-dd', 'en') : null;
        }
        this.page = 1;
        this.getExchangeRates(this.dataSearch);
    }
    resetSearch() {
        this.selectedrange = null;
        this.searchHistory();
    }
    showDetail(item: ExchangeRateHistory) {
        this._catalogueRepo.getExchangeRate(item.datetimeCreated)
            .pipe()
            .subscribe(
                (response: any) => {
                    if (!!response) {
                        this.exchangeRatesOfDay = response;
                        this.historyPopup.show();
                    }
                }
            );
    }

    getExchangeRates(dataSearch: any) {
        this._progressRef.start();
        this._catalogueRepo.getListExchangeRate(this.page, this.pageSize, dataSearch)
            .pipe(
                finalize(() => { this._progressRef.complete(); this.isLoading = false; })
            )
            .subscribe(
                (response: CommonInterface.IResponsePaging) => {
                    this.exchangeRates = response.data;
                    this.totalItems = response.totalItems;
                }
            );
    }

}
