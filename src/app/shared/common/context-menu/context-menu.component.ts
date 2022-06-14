import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { IDropdownPanel } from '../dropdown/dropdown.component';

@Component({
    selector: 'app-context-menu',
    template: `
    <ng-template>
        <div class="context-menu-wrapper" (click)="closed.emit()" (clickOutside)="clickOutside.emit()">
            <ng-content></ng-content>
        </div>
    </ng-template>
    
    `,
    styleUrls: ['./context-menu-component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppContextMenuComponent implements OnInit, IDropdownPanel {
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
    @Output() closed: EventEmitter<void> = new EventEmitter<any>();
    @Output() clickOutside: EventEmitter<void> = new EventEmitter<any>();
    constructor() { }

    ngOnInit(): void {
    }
}
