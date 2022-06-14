import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { AppPage } from '@app';
import { Surcharge } from '@models';
import { AccountingRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { RoutingConstants } from '@constants';
import { DataService } from '@services';

import { SettlementListChargeComponent } from '../components/list-charge-settlement/list-charge-settlement.component';
import { SettlementFormCreateComponent } from '../components/form-create-settlement/form-create-settlement.component';

import { catchError, concatMap, finalize } from 'rxjs/operators';
@Component({
    selector: 'app-settle-payment-new',
    templateUrl: './add-settle-payment.component.html'
})

export class SettlementPaymentAddNewComponent extends AppPage {

    @ViewChild(SettlementListChargeComponent) requestSurchargeListComponent: SettlementListChargeComponent;
    @ViewChild(SettlementFormCreateComponent) formCreateSurcharge: SettlementFormCreateComponent;

    constructor(
        private _accountingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private cdRef: ChangeDetectorRef,
        private _dataService: DataService
    ) {
        super();
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.requestSurchargeListComponent.isShowButtonCopyCharge = true;
        this.cdRef.detectChanges(); // * Force to update view
        if (!!this.formCreateSurcharge) {
            this.requestSurchargeListComponent.requester = this.formCreateSurcharge.requester.value;
        }
    }

    onChangeCurrency(currency: string) {
        if (!!this.requestSurchargeListComponent) {
            this.requestSurchargeListComponent.changeCurrency(currency);
        }
    }

    getPayeeInfo(event: any) {
        if (event === true) {
            if (!!this.requestSurchargeListComponent.surcharges) {
                const partnerId = this.requestSurchargeListComponent.surcharges[0].type === 'OBH' ? this.requestSurchargeListComponent.surcharges[0].payerId
                    : this.requestSurchargeListComponent.surcharges[0].paymentObjectId;
                this.formCreateSurcharge.payee.setValue(partnerId);
                this.formCreateSurcharge.getBeneficiaryInfo();
            }
        }
    }

    saveSettlement() {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
        //     return;
        // }

        if (this.formCreateSurcharge.checkStaffPartner()) {
            this._toastService.warning('Payment Method "Net Off Shipment" not use for Staff, Please check again!');
            return;
        }
        // this.requestSurchargeListComponent.surcharges.forEach(s => {
        //     if (!!s.invoiceDate && typeof s.invoiceDate !== 'string') {
        //         s.invoiceDate = formatDate(s.invoiceDate, 'yyyy-MM-dd', 'en');
        //     }
        // });

        this.formatInvoiceDateSurcharge();

        const body: IDataSettlement = {
            settlement: this.getDataForm(),
            shipmentCharge: this.requestSurchargeListComponent.surcharges || []
        };

        this._accountingRepo.addNewSettlement(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}/${res.data.settlement.id}`]);
                    } else {
                        this._toastService.warning(res.message, '', { enableHtml: true });
                    }
                    this.requestSurchargeListComponent.selectedIndexSurcharge = null;
                },
                (error) => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.error?.data) {
                            this._dataService.setData('duplicateChargeSettlement', error.error);
                        }
                    }
                }
            );
    }

    saveAndSendRequest() {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
        //     return;
        // }

        if (this.formCreateSurcharge.checkStaffPartner()) {
            this._toastService.warning('Payment Method "Net Off Shipment" not use for Staff, Please check again!');
            return;
        }

        this.formatInvoiceDateSurcharge();
        const body: IDataSettlement = {
            settlement: this.getDataForm(),
            shipmentCharge: this.requestSurchargeListComponent.surcharges || []
        };

        let settlementResult: any = {};
        this._accountingRepo.checkValidToSendRequestSettle(body)
            .pipe(catchError(this.catchError), finalize(() => this.isLoading = false),
                concatMap((res: CommonInterface.IResult) => {
                    if (!res.status && !!res.message) {
                        this._toastService.warning(res.message, '', { enableHtml: true });
                        return;
                    }
                    else {
                        return this._accountingRepo.saveAndSendRequestSettlemntPayment(body).pipe(
                            catchError(this.catchError),
                            concatMap((res: CommonInterface.IResult) => {
                                if (!res.status) {
                                    this._toastService.warning(res.message, '', { enableHtml: true });
                                    this.requestSurchargeListComponent.selectedIndexSurcharge = null;
                                } else {
                                    settlementResult = res.data.settlement;
                                    let approve: any = {
                                        settlementNo: settlementResult.settlementNo,
                                        requester: settlementResult.requester,
                                        requesterAprDate: new Date()
                                    }
                                    return this._accountingRepo.updateAndSendMailApprovalSettlement(approve);
                                }
                            })
                        );
                    }
                }
                ))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res.status) {
                        this._toastService.warning(res.message, '', { enableHtml: true });
                    }
                    else {
                        this._toastService.success(`${settlementResult.settlementNo}`, ' Send request successfully');
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}/${settlementResult.id}/approve`]);
                    }
                    this.requestSurchargeListComponent.selectedIndexSurcharge = null;
                },
                (error) => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.error?.data) {
                            this._dataService.setData('duplicateChargeSettlement', error.error);
                        }
                    }
                }
            );
    }

    getDataForm() {
        const dataSettle = {
            id: "00000000-0000-0000-0000-000000000000",
            settlementNo: this.formCreateSurcharge.settlementNo.value,
            requester: this.formCreateSurcharge.requester.value,
            requestDate: formatDate(this.formCreateSurcharge.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
            paymentMethod: this.formCreateSurcharge.paymentMethod.value.value,
            settlementCurrency: this.formCreateSurcharge.currency.value,
            note: this.formCreateSurcharge.note.value,
            payee: this.formCreateSurcharge.payee.value,
            settlementType: this.requestSurchargeListComponent.isDirectSettlement ? 'DIRECT' : (this.requestSurchargeListComponent.isExistingSettlement ? 'EXISTING' : null),
            bankAccountNo: this.formCreateSurcharge.bankAccountNo.value,
            bankAccountName: this.formCreateSurcharge.beneficiaryName.value,
            bankName: this.formCreateSurcharge.bankNameDescription.value,
            bankCode: this.formCreateSurcharge.bankCode.value,
            dueDate: !!this.formCreateSurcharge.dueDate.value && !!this.formCreateSurcharge.dueDate.value.startDate ? formatDate(this.formCreateSurcharge.dueDate.value.startDate, 'yyyy-MM-dd', 'en') : null
        };

        return dataSettle;
    }

    back() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}`]);
    }

    formatInvoiceDateSurcharge() {
        this.requestSurchargeListComponent.surcharges.forEach(s => {
            if (!!s.invoiceDate && typeof s.invoiceDate !== 'string') {
                if (Object.prototype.toString.call(s.invoiceDate) === '[object Date]') {
                    s.invoiceDate = formatDate(s.invoiceDate, 'yyyy-MM-dd', 'en');
                }
            }
        });
    }
}
interface IDataSettlement {
    settlement: any;
    shipmentCharge: Surcharge[];
}

