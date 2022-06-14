import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppForm } from 'src/app/app.form';
import { ToastrService } from 'ngx-toastr';
import { AccAccountingManagementModel } from '@models';
import { Store } from '@ngrx/store';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { formatDate } from '@angular/common';
import { AccountingRepo } from '@repositories';

import { AccountingManagementFormCreateVATInvoiceComponent } from '../../components/form-create-vat-invoice/form-create-vat-invoice.component';
import { AccountingManagementListChargeComponent } from '../../components/list-charge/list-charge-accouting-management.component';
import { IAccountingManagementState, InitPartner } from '../../store';

import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';
import { AccountingConstants, RoutingConstants, SystemConstants } from '@constants';
import { Router } from '@angular/router';


@Component({
    selector: 'app-accounting-create-vat-invoice',
    templateUrl: './accounting-create-vat-invoice.component.html',
})
export class AccountingManagementCreateVATInvoiceComponent extends AppForm implements OnInit {

    @ViewChild(AccountingManagementFormCreateVATInvoiceComponent) formCreateComponent: AccountingManagementFormCreateVATInvoiceComponent;
    @ViewChild(AccountingManagementListChargeComponent) listChargeComponent: AccountingManagementListChargeComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmCancelPopup: ConfirmPopupComponent;

    invalidUpdateExchangeRate: string = 'You can only adjust the exchange rate increase or decrease by 1% compared to the general exchange rate!';

    constructor(
        protected _toastService: ToastrService,
        protected _accountingRepo: AccountingRepo,
        protected _store: Store<IAccountingManagementState>,
        protected _router: Router,
    ) {
        super();
    }

    ngOnInit(): void {
    }

    onSubmitSaveInvoice() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        if (!this.listChargeComponent.charges.length) {
            this._toastService.warning("VAT Invoice don't have any charge in this period, Please check it again!");
            return;
        }

        if (!this.checkValidateExchangeRate()) {
            this._toastService.warning(this.invalidUpdateExchangeRate);
            return;
        }

        const modelAdd: AccAccountingManagementModel = this.onSubmitData();
        modelAdd.type = AccountingConstants.ISSUE_TYPE.INVOICE;

        modelAdd.charges = [...this.listChargeComponent.charges];

        this.saveInvoice(modelAdd);
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid) {
            valid = false;
        }
        return valid;
    }

    checkValidateExchangeRate() {
        let valid: boolean = true;
        if (this.formCreateComponent.totalExchangeRate.value != null) {
            const exchangeRate = +this.formCreateComponent.totalExchangeRate.value;
            const validRangeExchangeRate: number[] = [
                (exchangeRate + exchangeRate * 0.01) as number,
                (exchangeRate - exchangeRate * 0.01) as number
            ];
            valid = this.listChargeComponent.charges
                .filter(x => x.currency !== 'VND')
                .every(c => c.exchangeRate <= validRangeExchangeRate[0] && c.exchangeRate >= validRangeExchangeRate[1]);
        }
        return valid;
    }

    onSubmitData(): AccAccountingManagementModel {
        const form: { [name: string]: any } = this.formCreateComponent.formGroup.getRawValue();
        const formData = {
            date: !!form.date && !!form.date.startDate ? formatDate(form.date.startDate, 'yyyy-MM-dd', 'en') : null,
        };

        return new AccAccountingManagementModel(Object.assign(_merge(form, formData)));
    }

    saveInvoice(body: AccAccountingManagementModel) {
        this._accountingRepo.addNewAcctMgnt(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                },
                (res: HttpErrorResponse) => {
                    if (res.error.message === 'Voucher ID has been existed') {
                        this.formCreateComponent.voucherId.setErrors({ existed: true });
                    }
                    if ((res.error as CommonInterface.IResult).data === SystemConstants.HTTP_CODE.EXISTED) {
                        this.formCreateComponent.serie.setErrors({ existed: true });
                        this.formCreateComponent.invoiceNoTempt.setErrors({ existed: true });
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice`]);
    }

    ngOnDestroy() {
        this._store.dispatch(InitPartner());
    }
}
