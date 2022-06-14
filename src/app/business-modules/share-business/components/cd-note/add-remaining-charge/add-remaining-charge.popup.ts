import { Component, Output, EventEmitter } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { ChargeCdNote } from "src/app/shared/models/document/chargeCdNote.model";
import { SortService } from "src/app/shared/services";
import { TransactionTypeEnum } from "@enums";

@Component({
    selector: 'add-remaining-charge-popup',
    templateUrl: './add-remaining-charge.popup.html'
})
export class ShareBussinessCdNoteAddRemainingChargePopupComponent extends PopupBase {
    @Output() onAddCharge: EventEmitter<any> = new EventEmitter<any>();

    headers: CommonInterface.IHeaderTable[];
    isCheckAllCharge: boolean = false;
    listChargePartnerAddMore: ChargeCdNote[] = [];
    listChargePartner: ChargeCdNote[] = [];
    partner: string = "";

    transactionType: TransactionTypeEnum = 0;
    constructor(private _sortService: SortService) {
        super();
        this.requestSort = this.sortRemainingCharge;
    }

    ngOnInit() {
    }

    setHeader() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
            { title: 'Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'nameEn', sortable: true },
            { title: 'Quantity', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unit', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: "Credit Value", field: 'credit', sortable: true },
            { title: "Debit Value", field: 'debit', sortable: true },
            { title: 'Note', field: 'notes', sortable: true }
        ];
    }

    addCharge() {
        let chargesSelected = [];
        const grpChargeSelected = [];
        if (this.listChargePartnerAddMore.length > 0) {
            for (const charges of this.listChargePartnerAddMore) {
                chargesSelected = charges.listCharges.filter(group => group.isSelected);
                if (chargesSelected.length > 0) {
                    grpChargeSelected.push({ id: charges.id, hwbno: charges.hwbno, isDeleted: false, listCharges: chargesSelected });
                }
            }
        }
        const result = [];
        for (const group of grpChargeSelected) {
            if (this.listChargePartner.length > 0) {
                for (const item of this.listChargePartner) {
                    item.isDeleted = false;
                    if (item.hwbno === group.hwbno && item.id === group.id) {
                        for (const charge of group.listCharges) {
                            charge.canEdit = true;
                            item.listCharges.push(charge);
                        }
                    }
                }
            } else {
                result.push({ id: group.id, hwbno: group.hwbno, isDeleted: false, listCharges: group.listCharges });
            }
        }
        this.listChargePartner = this.listChargePartner.length > 0 ? this.listChargePartner : result;
        this.onAddCharge.emit(this.listChargePartner);

        this.isCheckAllCharge = false;
        this.closePopup();
    }

    closePopup() {
        this.isCheckAllCharge = false;
        this.hide();
    }

    checkUncheckAllCharge() {
        for (const group of this.listChargePartnerAddMore) {
            group.isSelected = this.isCheckAllCharge;
            for (const item of group.listCharges) {
                item.isSelected = this.isCheckAllCharge;
            }
        }
    }

    onChangeCheckBoxGrpCharge(charges: any) {
        this.isCheckAllCharge = this.listChargePartnerAddMore.every((item: any) => item.isSelected);
        for (const charge of charges.listCharges) {
            charge.isSelected = charges.isSelected;
        }
    }

    onChangeCheckBoxItemCharge(chargeGroup: any) {
        chargeGroup.isSelected = chargeGroup.listCharges.every((item: any) => item.isSelected);
        this.isCheckAllCharge = this.listChargePartnerAddMore.every((item: any) => item.isSelected);
    }

    sortRemainingCharge(sort: string): void {
        this.listChargePartnerAddMore.forEach(element => {
            element.listCharges = this._sortService.sort(element.listCharges, sort, this.order);
        });
    }

}