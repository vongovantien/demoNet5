import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeTrim'
})

export class RemoveTrimPipe implements PipeTransform {
    transform(value: string, ...args: any[]): any {
        return value.replace(".", "").replace(" ", "");
    }
}
