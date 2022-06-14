import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'abs',
})
export class AbsPipe implements PipeTransform {
    transform(input: any): any {
        if (isNaN (input) && !isFinite(input)) {
            return 'NaN';
        }

        return Math.abs(input);
    }
}
