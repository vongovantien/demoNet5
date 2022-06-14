import { Component, OnInit } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from '@repositories';
import { Currency } from '@models';

@Component({
    selector: 'exchange-rate-convert',
    templateUrl: './exchange-rate-convert.component.html',
})
export class ExchangeRateConvertComponent extends AppForm implements OnInit {

    convertDate: any;
    date: null;
    convert: any = {
        selectedRangeDate: null,
        fromCurrency: null,
        toCurrency: null
    };

    rate: any;

    fromCurrencies: Currency[];
    toCurrencies: Currency[];

    constructor(
        private _catalogueRepo: CatalogueRepo
    ) {
        super();
    }

    ngOnInit(): void {
        this.getcurrencies();
    }
    convertRate(form) {
        this.date = this.convert.selectedRangeDate.startDate;
        if (form.valid
            && this.convert.fromCurrency != null
            && this.convert.toCurrency != null
            && this.convert.selectedRangeDate.startDate !== null) {
            this._catalogueRepo.convertExchangeRate(new Date(this.convert.selectedRangeDate.startDate).toISOString(), this.convert.fromCurrency, this.convert.toCurrency)
                .subscribe((response) => {
                    if (response) {
                        this.rate = response;
                    }
                });

        }
    }

    getcurrencies() {
        this._catalogueRepo.getExchangeRateCurrency()
            .subscribe(
                (response) => {
                    if (response != null) {
                        this.fromCurrencies = response.fromCurrencies;
                        this.toCurrencies = response.toCurrencies;
                    } else {
                        this.fromCurrencies = [];
                        this.toCurrencies = [];
                    }
                }
            );

    }
}
