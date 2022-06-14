import { Component, OnInit, ChangeDetectionStrategy, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'date-time-modified',
    templateUrl: './date-time-modified.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ShareBussinessDateTimeModifiedComponent implements OnInit {
    @Input() timeCreated: string;
    @Input() userCreated: string;
    @Input() timeModified: string;
    @Input() userModified: string;

    @Input() col: number = 4;
    constructor() { }

    ngOnInit() { }
}