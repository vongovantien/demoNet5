import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'select-attach-file-popup',
    templateUrl: './select-attach-file.popup.html',
    styleUrls: ['./select-attach-file.popup.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountingSelectAttachFilePopupComponent extends PopupBase implements OnInit {
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Input() type: string = '';

    templates = [
        { title: 'Preview multiple(VN)', value: 1, type: 'ADV' },
        { title: 'Preview multiple(EN)', value: 2, type: 'ADV' },
        { title: 'Preview multiple(VN)', value: 3, type: 'SM' },
        { title: 'Preview multiple(EN)', value: 4, type: 'SM' },
        { title: 'Preview General', value: 5, type: 'SM' },
        { title: 'Preview Payment SOA Template', value: 6, type: 'SM' },
    ];

    fileTemplates = [];
    template = null;

    constructor() {
        super();
    }

    ngOnInit(): void { }

    onShowPopup() {
        this.fileTemplates = this.templates.filter(x => x.type === this.type);
    }

    selectTemplate(template) {
        this.template = template;
    }

    onSubmit() {
        this.isSubmitted = true;
        if (!this.template) {
            return;
        }
        this.isSubmitted = true;

        this.onSelect.emit(this.template.value);
        this.hide();
    }
}
