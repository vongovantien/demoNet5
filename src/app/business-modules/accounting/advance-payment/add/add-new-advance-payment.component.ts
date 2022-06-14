import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { AppPage } from '@app';
import { AccountingRepo } from '@repositories';
import { RoutingConstants } from '@constants';

import { AdvancePaymentListRequestComponent } from '../components/list-advance-payment-request/list-advance-payment-request.component';
import { AdvancePaymentFormCreateComponent } from '../components/form-create-advance-payment/form-create-advance-payment.component';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListAdvancePaymentCarrierComponent } from '../components/list-advance-payment-carrier/list-advance-payment-carrier.component';
@Component({
    selector: 'app-advance-payment-new',
    templateUrl: './add-new-advance-payment.component.html',
})

export class AdvancePaymentAddNewComponent extends AppPage {

    @ViewChild(AdvancePaymentListRequestComponent) listRequestAdvancePaymentComponent: AdvancePaymentListRequestComponent;
    @ViewChild(ListAdvancePaymentCarrierComponent) listAdvancePaymentCarrierComponent: ListAdvancePaymentCarrierComponent;
    @ViewChild(AdvancePaymentFormCreateComponent, { static: true }) formCreateComponent: AdvancePaymentFormCreateComponent;
    params: any;
    ACTION: string = '';
    isAdvCarrier: boolean = false;

    constructor(
        private _toastService: ToastrService,
        private _accoutingRepo: AccountingRepo,
        protected _activedRoute: ActivatedRoute,
        protected cdr: ChangeDetectorRef,
        private _router: Router,

    ) {
        super();

    }

    ngOnInit() { 
        combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([p, d]) => ({ ...p, ...d }))
        ).subscribe(
            (res: any) => {
                if(!!res.action && res.action === 'carrier'){
                    this.isAdvCarrier = true;
                    this.formCreateComponent.isAdvCarrier = this.isAdvCarrier;
                }
            }
        );

    }

    onChangeCurrency(currency: string) {
        if (!this.isAdvCarrier) {
            this.listRequestAdvancePaymentComponent.changeCurrency(currency);
            for (const item of this.listRequestAdvancePaymentComponent.listRequestAdvancePayment) {
                item.requestCurrency = currency;
            }
            this.listRequestAdvancePaymentComponent.currency = currency;
        }else{
            for (const item of this.listAdvancePaymentCarrierComponent.listAdvanceCarrier) {
                item.requestCurrency = currency;
                item.currencyId = currency;
            }
            this.listAdvancePaymentCarrierComponent.currency = currency;
        }
    }

    changeAdvanceFor(data: string){
        if(this.isAdvCarrier){
            this.listAdvancePaymentCarrierComponent.getListShipment(data);
        }
    }

    checkValidListAdvanceRequest(){
        if(!this.isAdvCarrier){
            if (!this.listRequestAdvancePaymentComponent.listRequestAdvancePayment.length) {
                this._toastService.warning(`Advance Payment don't have any request in this period, Please check it again! `, '');
                return true;
            }
            if (!this.checkValidateAmountAdvance()) {
                this._toastService.warning(`Total Advance Amount by cash is not exceed 100.000.000 VND `, '');
                return true;
            }
        }else{
            this.listAdvancePaymentCarrierComponent.isSubmitted = true;
            this.formCreateComponent.isSubmitted = true;
            if (!this.listAdvancePaymentCarrierComponent.listAdvanceCarrier.length) {
                this._toastService.warning(`Advance Payment don't have any detail in this period, Please check it again! `, '');
                return true;
            }
            if(!this.formCreateComponent.payee.value){
                return true;
            }
            if(!this.listAdvancePaymentCarrierComponent.checkValidate()){
                return true;
            }
            if (!this.checkValidateAmountAdvance()) {
                this._toastService.warning(`Total Advance Amount by cash is not exceed 100.000.000 VND `, '');
                return true;
            }
            this.formCreateComponent.isSubmitted = false;
        }
        return false;
    }

    saveAdvancePayment() {
        if (this.checkValidListAdvanceRequest()) {
            return;
        } else {
            const body = this.getFormData();
            this._accoutingRepo.addNewAdvancePayment(body)
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`${res.data.advanceNo + ' is added successfully'}`, 'Save Success !');
                            if (!this.isAdvCarrier) {
                                //  * go to detail page
                                this._router.navigate([`home/accounting/advance-payment/${res.data.id}`]);
                            } else {
                                this._router.navigate([`home/accounting/advance-payment/${res.data.id}`], {
                                    queryParams: Object.assign({}, { action: "carrier" })
                                });
                            }
                        } else {
                            this.handleError(null, (data: any) => {
                                this._toastService.error(data.message, data.title);
                            });
                        }
                    },
                );
        }
    }

    sendRequest() {
        if (this.checkValidListAdvanceRequest()) {
            return;
        } else {
            const body = this.getFormData();
            this._accoutingRepo.sendRequestAdvPayment(body)
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`${res.data.advanceNo + 'Save and Send Request successfully'}`, 'Save Success !');
                            if (!this.isAdvCarrier) {
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${res.data.id}/approve`]);
                            } else {
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${res.data.id}/approve`], {
                                    queryParams: Object.assign({}, { action: "carrier" })
                                });
                            }
                        } else {
                            this.handleError(null, (data: any) => {
                                this._toastService.error(data.message, data.title);
                            });
                        }
                    },
                );
        }
    }

    getFormData() {
        if (!this.isAdvCarrier) {
            const body = {
                advanceRequests: this.listRequestAdvancePaymentComponent.listRequestAdvancePayment,
                requester: this.formCreateComponent.requester.value || 'Admin',
                // statusApproval: this.formCreateComponent.statusApproval.value || '',
                paymentMethod: this.formCreateComponent.paymentMethod.value,
                advanceCurrency: this.formCreateComponent.currency.value || 'VND',
                requestDate: formatDate(this.formCreateComponent.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                deadlinePayment: formatDate(this.formCreateComponent.deadlinePayment.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                advanceNote: this.formCreateComponent.note.value || '',
                paymentTerm: this.formCreateComponent.paymentTerm.value || 9,
                bankAccountNo: this.formCreateComponent.bankAccountNo.value,
                bankAccountName: this.formCreateComponent.bankAccountName.value,
                bankName: this.formCreateComponent.bankName.value,
                payee: this.formCreateComponent.payee.value,
                bankCode: this.formCreateComponent.bankCode.value

            };
            return body;
        } else {
            this.listAdvancePaymentCarrierComponent.payeeId = this.formCreateComponent.payee.value;
            const body = {
                advanceRequests: this.listAdvancePaymentCarrierComponent.getListAdvRequest(),
                requester: this.formCreateComponent.requester.value || 'Admin',
                paymentMethod: this.formCreateComponent.paymentMethod.value,
                advanceCurrency: this.formCreateComponent.currency.value || 'VND',
                requestDate: formatDate(this.formCreateComponent.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                deadlinePayment: formatDate(this.formCreateComponent.deadlinePayment.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                advanceNote: this.formCreateComponent.note.value || '',
                paymentTerm: this.formCreateComponent.paymentTerm.value || 9,
                bankAccountNo: this.formCreateComponent.bankAccountNo.value,
                bankAccountName: this.formCreateComponent.bankAccountName.value,
                bankName: this.formCreateComponent.bankName.value,
                payee: this.formCreateComponent.payee.value,
                bankCode: this.formCreateComponent.bankCode.value,
                advanceFor: this.formCreateComponent.advanceFor.value
            };
            return body;
        }
    }

    checkValidateAmountAdvance(): boolean {
        if (!this.isAdvCarrier && this.listRequestAdvancePaymentComponent.totalAmount > 100000000 && this.formCreateComponent.paymentMethod.value === 'Cash') {
            return false;
        }
        if (this.isAdvCarrier && this.listAdvancePaymentCarrierComponent.calculateTotalAmount() > 100000000 && this.formCreateComponent.paymentMethod.value === 'Cash') {
            return false;
        }
        return true;
    }

    back() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}`]);
    }

}


