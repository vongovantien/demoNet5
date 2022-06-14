import { Component, OnInit } from '@angular/core';

@Component({
    selector: '[app-table-row-loading]',
    template: 
    `
        <td colspan="100">
            <div class="on-loading text-center">
                <div class="m-loader m-loader--brand">
                </div><span>Loading</span>
            </div>
        </td>
    `
})

export class TableRowLoadingComponent implements OnInit {
    ngOnInit() { }
}
