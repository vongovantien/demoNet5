import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { Surcharge } from '@models';
import { SortService } from '@services';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'charge-form-shipment-popup',
    templateUrl: './charge-form-shipment.popup.html',
    styles: [`
        .charge-from-shipment .table-wrapper{
                height: 400px;
                max-height: 550px;
        }
    `]
})

export class SettlementChargeFromShipmentPopupComponent extends PopupBase implements OnInit {

    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();

    charges: Surcharge[] = [];

    constructor(
        private _sortService: SortService
    ) {
        super();
        this.requestSort = this.sortSurcharge;
    }

    ngOnInit() {
        this.headers = [
            { title: 'JobId-MBL-HBL', field: '', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'Qty', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unitId', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Amount', field: 'total', sortable: true },
            { title: 'Payer', field: 'payer', sortable: true },
            { title: 'OBH Partner', field: 'obhPartnerName', sortable: true },
            { title: 'InvoiceNo', field: 'invoiceNo', sortable: true },
            { title: 'Series No', field: 'seriesNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
        ];
    }

    saveChargeList() {
        const listChargesToSave = cloneDeep(this.charges);
        for (const charge of listChargesToSave) {
            const date = charge.invoiceDate;
            if (typeof date !== 'string') {
                if (Object.prototype.toString.call(date) !== '[object Date]') {
                    if (!charge.invoiceDate.startDate) {
                        charge.invoiceDate = null;
                    } else {
                        charge.invoiceDate = new Date(date.startDate);
                    }
                }
            }
        }
        this.onUpdate.emit(listChargesToSave);
        this.hide();
    }

    sortSurcharge(key: string) {
        this.charges = this._sortService.sort(this.charges, key, this.order);
    }
}
