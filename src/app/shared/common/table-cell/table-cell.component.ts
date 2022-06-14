import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-table-cell',
    templateUrl: './table-cell.component.html',
})
export class TableCellComponent implements OnInit {
    @Input() field: string;
    @Input() item: any;
    @Input() type: CommonType.DataType;

    @Output() click: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    ngOnInit(): void { }

    onCLickLink() {
        if (!!this.item) {
            this.click.emit(this.item);
        }
    }
}
