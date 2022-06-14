import { Component, Input } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'process-approve',
    templateUrl: './process-approve.component.html',
    styleUrls: ['./process-approve.component.scss']
})

export class ProcessApporveComponent extends AppPage {

    @Input() approveInfo;

    constructor() {
        super();
    }

    ngOnInit() { }
}
