import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'extension'
})

export class ExtensionPipe implements PipeTransform {
    transform(fileName: string): string {
        if (!fileName) {
            return '';
        }
        return (fileName || '').split("/").pop().split('.').pop();
    }
}