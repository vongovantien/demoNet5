import { Component, ViewChild } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AccountingRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';
import { SettlementDetailChargesPaymentComponent } from './detail-charges-payment/detail-charges-payment.component';

@Component({
    selector: 'payment-management-popup',
    templateUrl: './payment-management.popup.html'
})

export class SettlementPaymentManagementPopupComponent extends PopupBase {
    @ViewChild(SettlementDetailChargesPaymentComponent) detailChargesPaymentComponent: SettlementDetailChargesPaymentComponent;
    data: IPaymentManagement = null;
    constructor(
        private _accountingRepo: AccountingRepo,
        private _progressService: NgProgress,
    ) {
        super();

        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.data = {
            jobId: '',
            hbl: '',
            mbl: '',
            balance: '',
            totalSettlement: '',
            totalAdvance: '',
            advancePayment: [],
            settlementPayment: [],
            chargesSettlementPayment: []
        };
    }

    getDataPaymentManagement(jobId: string, hbl: string, mbl: string, requester: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._accountingRepo.getPaymentManagement(jobId, mbl, hbl, requester)
            .pipe(catchError(this.catchError), finalize(() => { this._progressRef.complete(); this.isLoading = false; }))
            .subscribe(
                (response: IPaymentManagement) => {
                    this.data = response;
                }
            );
    }

    viewTabDetail(){
        this.detailChargesPaymentComponent.chargesSettlementPayment = this.data.chargesSettlementPayment;
    }

    closePopup() {
        this.hide();
    }
}


interface IPaymentManagement {
    jobId: string;
    hbl: string;
    mbl: string;
    balance: string;
    totalAdvance: string;
    totalSettlement: string;
    settlementPayment: any[];
    advancePayment: any[];
    chargesSettlementPayment: any[];
}
