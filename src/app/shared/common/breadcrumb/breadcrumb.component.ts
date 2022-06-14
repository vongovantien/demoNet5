import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, AfterViewInit {

    breadcrumbs: IBreadCrumb[] = [];

    constructor(
        private _activedRoute: ActivatedRoute,
    ) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.breadcrumbs = this.createBreadcrumbs(this._activedRoute.root);
        }, 50);

    }

    createBreadcrumbs(route: ActivatedRoute, path: string = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                path += decodeURI(`/${routeURL}`);
            }

            const label = child.snapshot.data['name'];
            if (!!(label)) {
                breadcrumbs.push({
                    name: label,
                    path: path
                });
            }
            return this.createBreadcrumbs(child, path, breadcrumbs);
        }
    }
}

interface IBreadCrumb {
    path: string;
    name: string;
}
