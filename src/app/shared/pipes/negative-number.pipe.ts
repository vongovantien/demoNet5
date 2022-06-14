import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
@Pipe({
    name: 'negativeNumber',
})

export class NegativeNumberePipe extends DecimalPipe implements PipeTransform {
    transform(value: number, ...args: any[]): any {
        if (!isNaN(value)) {
            if (value < 0) {
                if (!args.length) {
                    return `(${Math.abs(value)})`;
                }
                return `(${super.transform(Math.abs(value), args[0], '')})`;
            }
            else if (value === 0) {
                if (!args.length) {
                    return value;
                }
                return `-`;
            } else {
                if (!args.length)
                    return `${Math.abs(value)}`;
                return `${super.transform(Math.abs(value), args[0], '')}`;
            }
        }
        return value;
    }
}
