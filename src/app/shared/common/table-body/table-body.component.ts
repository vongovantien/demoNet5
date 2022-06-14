import { Component, Input } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: '[app-table-body]',
    templateUrl: './table-body.component.html',
})
export class TableBodyComponent extends AppPage {

    @Input() data: any[] = [];
    @Input() headers: CommonInterface.IHeaderTable[] = [];

    constructor() {
        super();
    }

    ngOnInit(): void { }
}
