import { Component, OnInit } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'app-unlock',
    templateUrl: './other.component.html'
})

export class OtherComponent extends AppPage implements OnInit {
    constructor() {
        super();
    }

    ngOnInit() { }
}
