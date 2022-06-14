import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppList } from 'src/app/app.list';


@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPaginationComponent extends AppList implements OnInit {

    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

    @Input() set data(data: any) {
        this._data = data;
    }

    @Input() set total(total: number) {
        this._totalItems = total;
    }

    @Input() set itemPerPage(size: number) {
        this._pageSize = size;
    }
    @Input() set pageNum(currenctPage: number) {
        this._page = currenctPage;
    }

    get pageNum() { return this._page; }
    get itemPerPage() { return this._pageSize; }
    get total() { return this._totalItems; }
    get data() { return this._data; }


    private _page: number = this.page;
    private _pageSize: number = this.pageSize;
    private _totalItems: number = this.totalItems;
    private _data: any = this.dataSearch;

    constructor() {
        super();
        this.requestList = this.onChangePaging;
    }

    pageChanged(event: any): void {
        if (this.pageNum !== event.page || this.itemPerPage !== event.itemsPerPage) {
            this.pageNum = event.page;
            this.itemPerPage = event.itemsPerPage;

            this.requestList();
        }
    }

    itemPerPageChanged(pageSize: number, data?: any) {
        this.itemPerPage = pageSize;
        this.pageNum = 1;  // TODO reset page to initial
        // this.total = 0;

        this.requestList(data);
    }

    onChangePaging() {
        this.onChange.emit({ page: this.pageNum, pageSize: this.itemPerPage, data: this.data });
    }

}
