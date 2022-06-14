import { Component, Input } from '@angular/core';

@Component({
    selector: '[app-table-collapse-row]',
    templateUrl: './table-collapse-row.component.html'
})

export class TableCollapseRowComponent {
    @Input() id: string;
    @Input() parentId: string;
    

    ngOnInit() { }
}