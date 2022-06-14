import { Component, Input, HostBinding, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Highlightable, FocusableOption, FocusOrigin } from '@angular/cdk/a11y';

@Component({
    selector: '[combogrid-item]',
    templateUrl: './combo-grid-item.component.html',
    host: {
        'tabindex': '-1'
    },
    styles: [
        `:host:focus {
        background: lightblue;
        color: #000;
        outline: none;
     }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppCombogridItemComponent implements FocusableOption, Highlightable {

    @Input() data;
    @Input() keyword: string;
    @Input() headers: any[] = [];

    private _isActive = false;

    constructor(private host: ElementRef) { }

    ngOnInit() { }

    focus(focus: FocusOrigin) {
        this.host.nativeElement.focus();
    }

    @HostBinding('class.data-selected-row')
    get isActive() {
        return this._isActive;
    }

    emitSelected(item: any) {

    }

    setActiveStyles() {
        this._isActive = true;
    }

    setInactiveStyles() {
        this._isActive = false;
    }
}
