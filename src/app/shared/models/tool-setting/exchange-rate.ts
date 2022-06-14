export class CatCurrencyExchange {
    currencyFromId: String;
    currencyToId: String;
    rate: number;

    constructor() { }

}

export class ExchangeRateHistory {
    datetimeCreated: string = null;
    localCurrency: string = null;
    userModifield: string = null;
    datetimeUpdated: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}