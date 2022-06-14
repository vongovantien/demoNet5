import { Component, ViewChild } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-sub-header',
    templateUrl: './sub-header.component.html',
    styleUrls: ['./sub-header.component.scss']
})

export class SubHeaderComponent {

    @ViewChild(BreadcrumbComponent, { static: true }) breadcrumComponent: BreadcrumbComponent;

    constructor() {
    }

    ngOnInit() { }

    resetBreadcrumb(name: string) {
        setTimeout(() => {
            this.breadcrumComponent.breadcrumbs[this.breadcrumComponent.breadcrumbs.length - 1].name = name;
        }, 200);
    }
}