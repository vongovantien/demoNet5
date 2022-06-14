import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppList } from 'src/app/app.list';

@Component({
    selector: '[app-table-header]',
    templateUrl: './table-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableHeaderComponent extends AppList {

    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() headers: CommonInterface.IHeaderTable[] = [];
    @Input() align: string = this.left;

    constructor() {
        super();
        this.requestSort = this.sortHeader;
    }

    ngOnInit() { }

    sortHeader() {
        this.onClick.emit(<CommonInterface.ISortData>{ sortField: this.sort, order: this.order });
    }
}
