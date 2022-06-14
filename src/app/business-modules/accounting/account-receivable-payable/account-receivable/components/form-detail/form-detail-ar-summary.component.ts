import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'form-detail-account-receivable',
    templateUrl: './form-detail-ar-summary.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountReceivableFormDetailSummaryComponent implements OnInit {
    @Input() accReceivableDetail;
    constructor() { }

    ngOnInit(): void { }
}
