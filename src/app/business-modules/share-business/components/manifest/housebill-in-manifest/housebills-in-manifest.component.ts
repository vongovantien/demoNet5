import { PopupBase } from 'src/app/popup.base';
import { SortService } from 'src/app/shared/services';
import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { ShareBusinessAddHblToManifestComponent } from '../popup/add-hbl-to-manifest.popup';
@Component({
    selector: 'housebills-in-manifest',
    templateUrl: 'housebills-in-manifest.component.html'
})

export class ShareBusinessHousebillsInManifestComponent extends PopupBase {
    @ViewChild(ShareBusinessAddHblToManifestComponent) addHblToManifestPopup: ShareBusinessAddHblToManifestComponent;
    headers: CommonInterface.IHeaderTable[];
    housebills: any[] = [];
    checkAll = false;
    manifest: any = {};
    @Input() isLocked: boolean = false;
    @Output() emitVolum = new EventEmitter<object>();

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
            { title: 'Freight Charge', field: 'freightPayment', sortable: true }
        ];
    }
    checkIsChecked() {
        let isChecked = false;
        isChecked = this.housebills.find(t => t.isChecked === true);
        if (!isChecked) {
            return false;
        }
        return true;
    }
    onRemove() {
        if (this.checkIsChecked() === false) {
            return;
        }
        this.housebills.forEach(x => {
            if (x.isChecked) {
                x.isRemoved = true;
                x.isChecked = false;
                x.manifestRefNo = null;
            }

        });
        this.getTotalWeight();
        this.addHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
        this.addHblToManifestPopup.checkAll = false;
    }
    getTotalWeight() {
        let totalCBM = 0;
        let totalGW = 0;
        this.housebills.forEach(x => {
            if (x.isRemoved === false) {
                totalGW = totalGW + x.gw;
                totalCBM = totalCBM + x.cbm;
            }
        });
        this.manifest.weight = totalGW;
        this.manifest.volume = totalCBM;
        this.emitVolum.emit(this.manifest);
        // this.formManifest.volume.setValue(this.manifest.volume);
        // this.formManifest.weight.setValue(this.manifest.weight);
    }
    showPopupAddHbl() {
        this.addHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
        this.addHblToManifestPopup.show();
    }
    sortHouseBills(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.housebills = this._sortService.sort(this.housebills, sortData.sortField, sortData.order);
        }
    }
    checkAllChange() {
        if (this.checkAll) {
            this.housebills.forEach(x => {
                x.isChecked = true;
            });
        } else {
            this.housebills.forEach(x => {
                x.isChecked = false;
            });
        }
    }
    removeAllChecked() { }
    onAdd() {
        if (this.checkIsChecked() === false) {
            return;
        }
        this.housebills.forEach(x => {
            if (x.isChecked) {
                x.isRemoved = false;
                x.isChecked = false;
            }
        });
        this.getTotalWeight();
        this.addHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
    }
}
