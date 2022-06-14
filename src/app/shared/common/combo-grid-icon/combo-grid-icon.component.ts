import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'combo-grid-icon',
    templateUrl: './combo-grid-icon.component.html',
    styleUrls: ['./combo-grid-icon.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AppComboGridIconComponent implements OnInit {

    isShowDelete: boolean = false;
    isShowDropdown: boolean = true;

    @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDropdown: EventEmitter<any> = new EventEmitter<any>();

    @Input() set showDelete(isShowDelete: boolean) {
        this.isShowDelete = isShowDelete;
    }

    @Input() set showDropdown(isShowDropdown: boolean) {
        this.isShowDropdown = isShowDropdown;
    }

    constructor() { }

    ngOnInit() { }

    onClickClearIcon() {
        this.onDelete.emit();
    }

    onClickDopdownIcon() {
        this.onDropdown.emit();
    }
}
