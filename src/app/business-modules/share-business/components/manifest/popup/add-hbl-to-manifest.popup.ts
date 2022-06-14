import { Component, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SortService } from 'src/app/shared/services';
@Component({
    selector: 'add-hbl-to-manifest-popup-share',
    templateUrl: 'add-hbl-to-manifest.popup.html'
})

export class ShareBusinessAddHblToManifestComponent extends PopupBase {
    houseBills: any[] = [];
    houseBillsRemove: any[] = [];
    checkAll = false;
    headers: CommonInterface.IHeaderTable[];
    @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();
    constructor(
        private _sortService: SortService
    ) {

        super();

    }
    onCancel() {
        this.hide();
    }
    ngOnInit() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'No of Pieces', field: 'packages', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Destination', field: 'podName', sortable: true },
            { title: 'Shipper', field: 'shipperName', sortable: true },
            { title: 'Consignee', field: 'consigneeName', sortable: true },
            { title: 'Description', field: 'desOfGoods', sortable: true },
            { title: 'Freight Charge', field: 'freightPayment', sortable: true },

        ];
    }


    sortHouseBills(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.houseBills = this._sortService.sort(this.houseBills, sortData.sortField, sortData.order);
        }
    }

    removeAllChecked() {
        this.checkAll = false;
    }

    OnAdd() {
        this.onAdd.emit('');
        this.hide();
    }

    checkAllChange() {
        if (this.checkAll) {
            this.houseBills.forEach(x => {
                x.isChecked = true;
            });
        } else {
            this.houseBills.forEach(x => {
                x.isChecked = false;
            });
        }
    }


}
