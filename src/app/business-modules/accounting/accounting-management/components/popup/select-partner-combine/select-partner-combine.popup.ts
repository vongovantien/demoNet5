import { PopupBase } from "@app";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { CombineBillingCriteria } from "@models";

@Component({
    selector: 'select-partner-combine-popup',
    templateUrl: './select-partner-combine.popup.html',
})

export class AccountingManagementSelectPartnerCombinePopupComponent extends PopupBase {
    @Output() onSelect: EventEmitter<CombineBillingCriteria> = new EventEmitter<CombineBillingCriteria>();

    listPartners: CombineBillingCriteria[] = [];
    selectedPartner: CombineBillingCriteria;
    constructor(

    ) {
        super();
    }

    ngOnInit(): void { }

    selectPartner(item: CombineBillingCriteria) {
        this.selectedPartner = item;
    }

    onSubmitSelectPartner() {
        if (!!this.selectedPartner) {
            this.hide();
            this.onSelect.emit(this.selectedPartner);
        }
    }
}