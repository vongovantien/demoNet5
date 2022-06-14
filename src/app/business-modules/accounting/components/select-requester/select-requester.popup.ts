import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { PartnerOfAcctManagementResult } from '@models';
import { Store } from '@ngrx/store';
import { SelectRequester, IAccountingManagementState } from '../../accounting-management/store';
import { Router } from '@angular/router';

@Component({
    selector: 'select-requester-popup',
    templateUrl: './select-requester.popup.html',
})
export class ShareAccountingManagementSelectRequesterPopupComponent extends PopupBase implements OnInit {
    @Input() isPayee: boolean = false;
    @Output() onSelect: EventEmitter<PartnerOfAcctManagementResult> = new EventEmitter<PartnerOfAcctManagementResult>();

    listRequesters: PartnerOfAcctManagementResult[] = [];

    selectedRequester: PartnerOfAcctManagementResult;

    constructor(
        private _store: Store<IAccountingManagementState>,
    ) {
        super();
    }

    ngOnInit(): void { }

    selectRequester(item: PartnerOfAcctManagementResult) {
        this.selectedRequester = item;
    }

    onSubmitSelectPartner() {
        if (!!this.selectedRequester) {
            this._store.dispatch(SelectRequester(this.selectedRequester));
            this.onSelect.emit(this.selectedRequester);
        }
    }
}
