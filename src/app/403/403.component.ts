import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-403-page',
    templateUrl: './403.component.html'
})

export class ForbiddenPageComponent implements OnInit {
    constructor(
        private _router: Router
    ) { }

    ngOnInit() { }

    goBack() {
        this._router.navigate(["home"]);
    }
}