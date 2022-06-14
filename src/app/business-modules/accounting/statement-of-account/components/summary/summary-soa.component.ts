import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'soa-summary',
    templateUrl: './sumarry-soa.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class StatementOfAccountSummaryComponent extends AppPage {
    @Input() data: any = null;
    constructor() {
        super();
    }

    ngOnInit() { }
}