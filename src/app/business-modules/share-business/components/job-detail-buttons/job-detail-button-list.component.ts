import { AppPage } from 'src/app/app.base';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'job-detail-button-list',
    templateUrl: './job-detail-button-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ShareBussinessJobDetailButtonListComponent extends AppPage implements OnInit {

    @Input() shipmentDetail: any;
    @Input() isDuplicate: boolean = false;
    @Input() selectedTab: string = 'SHIPMENT';

    @Output() onLock: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPreviewPL: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDuplicate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

    constructor() { super(); }

    ngOnInit() { }

    lockShipment() {
        this.onLock.emit();
    }

    previewPLsheet(currency: string) {
        this.onPreviewPL.emit(currency);
    }

    showDuplicateConfirm() {
        this.onDuplicate.emit()
    }

    prepareDeleteJob() {
        this.onDelete.emit();
    }

    onSaveJob() {
        this.onSave.emit();
    }

    handleCancelForm() {
        this.onCancel.emit();
    }


}