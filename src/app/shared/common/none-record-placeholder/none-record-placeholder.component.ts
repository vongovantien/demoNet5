import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'none-record-placeholder',
    template: `
                <div class="no-data bg-white">
                    <i class="flaticon-coins"></i>
                    <span class="no-data-text">{{title}}</span>
                </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoneRecordPlaceholderComponent {
    @Input() title: string = 'No records found';
}

