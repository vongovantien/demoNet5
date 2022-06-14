import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

import { PopupBase } from '@app';
import { PartnerOfAcctManagementResult } from '@models';

import { IAccountingManagementState, SelectPartner } from '../../../store';

@Component({
    selector: 'select-partner-popup',
    templateUrl: './select-partner.popup.html',
})
export class AccountingManagementSelectPartnerPopupComponent extends PopupBase implements OnInit {

    @Output() onSelect: EventEmitter<PartnerOfAcctManagementResult> = new EventEmitter<PartnerOfAcctManagementResult>();

    listPartners: PartnerOfAcctManagementResult[] = [];

    selectedPartner: PartnerOfAcctManagementResult;

    constructor(
        private _store: Store<IAccountingManagementState>
    ) {
        super();
    }

    ngOnInit(): void { }

    selectPartner(item: PartnerOfAcctManagementResult) {
        this.selectedPartner = item;
    }

    onSubmitSelectPartner() {
        if (!!this.selectedPartner) {
            this._store.dispatch(SelectPartner(this.selectedPartner));
            this.hide();
            this.onSelect.emit(this.selectedPartner);
        }
    }
}
