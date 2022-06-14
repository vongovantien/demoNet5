import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: '[app-table-none-record]',
    template: `
            <td [attr.colspan]="colspan">
                <div class="no-data">
                    <i class="flaticon-coins"></i>
                    <span class="no-data-text">{{title}}</span>
                </div>
            </td>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableNoneRecordComponent {
    @Input() colspan: number = 100;
    @Input() title: string = 'No records found';
}

