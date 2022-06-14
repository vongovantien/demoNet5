import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortTableClass' })
export class SortTableClassPipe implements PipeTransform {
    transform(sortable: boolean, field: string, key: string, order: boolean = false): any {
        if (!!sortable) {
            let classes = 'sortable ';
            if (field === key) {
                classes += ('sort-' + (order ? 'asc' : 'desc') + ' ');
            }

            return classes;
        }
        return '';
    }
}
@Pipe({ name: 'fixedColumnClass' })
export class FixedColumnClassPipe implements PipeTransform {
    transform(header: any, index: number) {
        if (index == NaN) {
            return '';
        }
        if (header.fixed === true) {
            return 'fixed-side-' + index;
        }
        return '';
    }
}

@Pipe({ name: 'alignClass' })
export class AlignClassPipe implements PipeTransform {
    transform(h: any) {
        if (!h.align) {
            return '';
        }
        return 'text-' + h.align;

    }
}