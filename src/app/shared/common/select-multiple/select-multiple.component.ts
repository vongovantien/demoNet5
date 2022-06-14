import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AppPage } from 'src/app/app.base';
@Component({
    selector: 'app-multiple-select',
    templateUrl: './select-multiple.component.html',
    styleUrls: ['./select-multiple.component.scss']
})

export class AppMultipleSelectComponent extends AppPage {
    @ViewChild('inputSearch') inputSearch: ElementRef;

    @Output() onChange: EventEmitter<any> = new EventEmitter<any[]>(); // * event will be fired when item was selected

    @Input() set source(value: { id: string, text: string }[]) {
        this.sources = value;
    }
    @Input() active: any[] = []; // * active item   
    @Input() placeHolder: string = 'Please select';

    isShow: boolean = false;  // * show data source
    isCheckAll: boolean = false;  // * check all

    private sources: any[] = [];

    constructor() {
        super();
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (!!this.active.length && !!this.sources.length) {
            const ids: any[] = this.active.map(i => i.id);
            for (const item of this.sources) {
                if (ids.includes(item.id)) {
                    item.isSelected = true;
                } else {
                    item.isSelected = false;
                }
            }
            this.isCheckAll = this.sources.every((item: any) => item.isSelected);
        }
    }

    onChangeCheckItem(data: any) {
        this.isCheckAll = this.sources.every((item: any) => item.isSelected);

        if (data.isSelected) {
            this.active.push(data);
        } else {
            const index: number = this.active.findIndex((item: any) => item.id === data.id);
            if (index !== -1) {
                this.active.splice(index, 1);
            }
        }
        this.onChange.emit(this.active);
    }

    checkUncheckAll() {
        this.active = [];
        for (const item of this.sources) {
            item.isSelected = this.isCheckAll;
        }

        this.isCheckAll ? this.active.push(...this.sources) : this.active = [];

        this.onChange.emit(this.active);
    }

    showContent() {
        this.isShow = !this.isShow;
        if (this.isShow) {
            setTimeout(() => {
                if (this.inputSearch) {
                    this.inputSearch.nativeElement.focus();
                }
            }, 200);
        }
    }

    onclickOutSide() {
        this.keyword = '';
        this.isShow = false;
    }
}
