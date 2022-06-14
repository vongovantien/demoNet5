import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sum' })
export class SumPipe implements PipeTransform {
    transform(items: any[], attr?: string): any {
        if (attr) {
            return items.reduce((a, b) => a + b[attr], 0);
        }
        return !Array.isArray(items) ? items : items.reduce((previous: number, current: number) => previous + current, 0);
    }
}
@Pipe({ name: 'sumAmount' })
export class SumAmountCurrencyPipe implements PipeTransform {
    transform(items: any[], key?: string, currency?: string, currencyKey?: string): any {
        if (key && currency && currencyKey) {
            return items.filter(x => x[currencyKey] === currency).reduce((a, b) => {
                return a + b[key];
            }, 0);
        }
        if (key) {
            return items.reduce((a, b) => {
                return a + b[key];
            }, 0);
        }

        return !Array.isArray(items) ? items : items.reduce((previous: number, current: number) => previous + current, 0);
    }
}

