import { Component, OnInit, TemplateRef, EventEmitter, ViewChild, Output, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-dropdown',
    template: `
    <ng-template>
        <div (click)="closed.emit()" class="dropdown-menu-wrapper"  (mouseenter)="visible$.next(true)" (mouseleave)="visible$.next(false)">
            <ng-content></ng-content>
        </div>
    </ng-template>
    `,
    styles: [`
        .dropdown-menu-wrapper{
             border: 0;
            -webkit-box-shadow: 0 0 15px 1px rgb(69 65 78 / 20%);
                    box-shadow: 0 0 15px 1px rgb(69 65 78 / 20%);
            margin: 0;
            min-width: 10rem;
            padding: .5rem 0;
            font-size: 1rem;
            /* color: #212529; */
            color: #575962;
            text-align: left;
            list-style: none;   
            background-clip: padding-box;
            background: #fff
           
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDropdownComponent implements OnInit, IDropdownPanel {
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
    @Output() closed: EventEmitter<void> = new EventEmitter<any>();

    constructor() { }
    visible$: Subject<boolean> = new Subject<boolean>();

    ngOnInit(): void { }
}

export interface IDropdownPanel {
    templateRef: TemplateRef<any>;
    readonly closed: EventEmitter<void>;
    readonly clickOutside?: EventEmitter<void>;
    readonly visible$?: Subject<boolean>;
}
