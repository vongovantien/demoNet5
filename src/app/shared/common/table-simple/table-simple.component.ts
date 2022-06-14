import { Component, Output, Input, EventEmitter } from '@angular/core';
import { AppList } from 'src/app/app.list';

@Component({
    selector: 'app-table-simple',
    templateUrl: './table-simple.component.html',
})
export class AppTableComponent extends AppList {

    @Input() data: any;
    @Input() headers: CommonInterface.IHeaderTable[];

    @Output() onSort: EventEmitter<CommonInterface.ISortData> = new EventEmitter<CommonInterface.ISortData>();


    constructor() {
        super();
        this.requestSort = this.sortData;
    }

    ngOnInit(): void { }

    sortData() {
        this.onSort.emit(<CommonInterface.ISortData>{ sortField: this.sort, order: this.order });
    }

}
