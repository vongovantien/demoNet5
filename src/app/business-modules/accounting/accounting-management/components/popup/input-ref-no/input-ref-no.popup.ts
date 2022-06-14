import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { PopupBase } from '@app';
import { AccountingRepo } from '@repositories';
import { SystemConstants } from '@constants';
import { PartnerOfAcctManagementResult } from '@models';

import { AccountingManagementSelectPartnerPopupComponent } from '../select-partner/select-partner.popup';
import { IAccountingManagementState, SelectPartner, SelectRequester } from '../../../store';
import { ShareAccountingManagementSelectRequesterPopupComponent } from 'src/app/business-modules/accounting/components/select-requester/select-requester.popup';

@Component({
    selector: 'input-ref-no-popup',
    templateUrl: './input-ref-no.popup.html',
})

export class AccountingManagementInputRefNoPopupComponent extends PopupBase implements OnInit {

    @ViewChild(AccountingManagementSelectPartnerPopupComponent) selectPartnerPopup: AccountingManagementSelectPartnerPopupComponent;
    @ViewChild(ShareAccountingManagementSelectRequesterPopupComponent) selectRequesterPopup: ShareAccountingManagementSelectRequesterPopupComponent;

    @Input() set type(t: string) {
        this._type = t;
        if (this._type !== 'invoice') {
            this.optionsType.length = 0;
            this.optionsType = [
                { title: 'Settlement', value: 'settlementCodes' },
                { title: 'SOA', value: 'soaNos' },
                { title: 'Job ID', value: 'jobNos' },
                { title: 'HBL', value: 'hbls' },
                { title: 'MBL', value: 'mbls' },
                { title: 'C/D Note', value: 'cdNotes' },
            ];
            this.selectedOpion = this.optionsType[5];

        }
    }

    get type() { return this._type; }

    private _type: string = 'invoice'; // * Default.

    optionsType: CommonInterface.ICommonTitleValue[] = [
        { title: 'Debit Note', value: 'cdNotes' },
        { title: 'SOA', value: 'soaNos' },
        { title: 'Job ID', value: 'jobNos' },
        { title: 'HBL', value: 'hbls' },
        { title: 'MBL', value: 'mbls' },
    ];

    selectedOpion: CommonInterface.ICommonTitleValue = this.optionsType[0];

    constructor(
        private _accountingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _store: Store<IAccountingManagementState>
    ) {
        super();
    }

    ngOnInit() { }

    searchRef() {
        if (!this.selectedOpion) {
            return;
        }
        const body: AccountingInterface.IPartnerOfAccountingManagementRef = {
            cdNotes: null,
            soaNos: null,
            jobNos: null,
            hbls: null,
            mbls: null,
            settlementCodes: null
        };

        switch (this.selectedOpion.value) {
            case 'cdNotes':
                body.cdNotes = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            case 'soaNos':
                body.soaNos = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            case 'jobNos':
                body.jobNos = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            case 'hbls':
                body.hbls = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            case 'mbls':
                body.mbls = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            case 'settlementCodes':
                body.settlementCodes = this.keyword.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: string) => item.trim());
                break;
            default:
                break;
        }
        if (this.type === 'invoice') {
            this.getChargeInvoice(body);
        } else {
            this.getChargeVoucher(body);
        }

    }

    getChargeInvoice(body: AccountingInterface.IPartnerOfAccountingManagementRef) {
        this._accountingRepo.getChargeSellForInvoiceByCriteria(body)
            .subscribe(
                (res: PartnerOfAcctManagementResult[]) => {
                    if (!!res && !!res.length) {
                        if (res.length === 1) {
                            this._store.dispatch(SelectPartner(res[0]));

                            // Search agreement.
                            this.hide();
                            return;
                        } else {
                            this.selectPartnerPopup.listPartners = res;
                            this.selectPartnerPopup.selectedPartner = null;

                            this.selectPartnerPopup.show();
                        }

                    } else {
                        this._toastService.warning("Not found data charge");
                    }
                }
            );
    }

    getChargeVoucher(body: AccountingInterface.IPartnerOfAccountingManagementRef) {
        this._accountingRepo.getChargeForVoucherByCriteria(body)
            .subscribe(
                (res: PartnerOfAcctManagementResult[]) => {
                    if (!!res && !!res.length) {
                        if (res.length === 1) {
                            if (this.selectedOpion.value === 'settlementCodes') {
                                this._store.dispatch(SelectRequester(res[0]));
                                this.hide();
                            } else {
                                this._store.dispatch(SelectPartner(res[0]));
                                this.hide();
                            }
                            return;
                        } else {
                            if (this.selectedOpion.value === 'settlementCodes') {
                                if (res.some(x => !!x.partnerId)) {
                                    this.selectRequesterPopup.listRequesters = res.filter(x => !!x.partnerId);
                                    this.selectRequesterPopup.isPayee = true;

                                    if (this.selectRequesterPopup.listRequesters.length === 1) {
                                        this._store.dispatch(SelectRequester(this.selectRequesterPopup.listRequesters[0]));
                                        this.hide();
                                        return;
                                    }
                                } else {
                                    this.selectRequesterPopup.isPayee = false;
                                    this.selectRequesterPopup.listRequesters = res;
                                }

                                this.selectRequesterPopup.selectedRequester = null;
                                this.selectRequesterPopup.show();
                            } else {
                                this.selectPartnerPopup.listPartners = res;
                                this.selectPartnerPopup.selectedPartner = null;
                                this.selectPartnerPopup.show();
                            }
                        }
                    } else {
                        this._toastService.warning("Not found data charge");
                    }

                }
            );
    }
}


