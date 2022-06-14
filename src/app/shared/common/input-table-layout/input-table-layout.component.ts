import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-input-table-layout',
    templateUrl: './input-table-layout.component.html'
})
export class InputTableLayoutComponent implements OnInit {
    @Input() item: any;
    @Input() column: any;

    constructor() { }

    ngOnInit() {
    }

}
