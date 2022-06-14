import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ReportPreviewComponent } from '@common';
import { SysImage } from '@models';
import { SettlementShipmentAttachFilePopupComponent } from './../popup/shipment-attach-files/shipment-attach-file-settlement.popup';

@Component({
    selector: 'shipment-item',
    templateUrl: './shipment-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettlementShipmentItemComponent {
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(SettlementShipmentAttachFilePopupComponent) shipmentAttachFilePopup: SettlementShipmentAttachFilePopupComponent;

    @Output() onCheck: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPrintPlUSD: EventEmitter<any> = new EventEmitter<any>();
    @Output() onPrintPlVND: EventEmitter<any> = new EventEmitter<any>();
    @Output() onViewFiles: EventEmitter<any> = new EventEmitter<any>();

    @Input() data: ISettlementShipmentGroup = null;

    initCheckbox: boolean = false;
    isCheckAll: boolean = false;

    constructor(
    ) {

    }

    ngOnInit() {
    }

    showPaymentManagement($event: Event): any {
        this.onClick.emit();
        return false;
    }

    checkUncheckAllRequest($event: Event) {
        this.initCheckbox = !this.initCheckbox;
        this.isCheckAll = this.initCheckbox;
        this.onCheck.emit(this.isCheckAll);

        return false;
    }

    previewPLsheet($event: Event, currency: string) {
        if (currency === 'VND') {
            this.onPrintPlVND.emit();
            return false;
        }
        this.onPrintPlUSD.emit();
        return false;
    }

    showShipmentAttachFile($event: Event) {
        this.onViewFiles.emit();
        return false;
    }
}

export interface ISettlementShipmentGroup {
    advanceAmount: number;
    advanceNo: string;
    balance: number;
    chargeSettlements: any[]
    currencyShipment: string;
    customNo: string;
    hbl: string;
    hblId: string;
    jobId: string;
    mbl: string;
    settlementNo: string;
    shipmentId: string;
    totalAmount: number;
    type: string;
    isSelected?: boolean;
    files: SysImage[];
    isLocked: boolean;
}
