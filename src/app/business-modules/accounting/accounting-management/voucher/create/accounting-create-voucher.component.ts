import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from '@app';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { AccountingRepo } from '@repositories';
import { Store } from '@ngrx/store';
import { IAccountingManagementState, InitPartner } from '../../store';
import { AccAccountingManagementModel } from '@models';
import { AccountingConstants, RoutingConstants } from '@constants';

import { AccountingManagementFormCreateVoucherComponent } from '../../components/form-create-voucher/form-create-voucher.component';
import { AccountingManagementListChargeComponent } from '../../components/list-charge/list-charge-accouting-management.component';

import _merge from 'lodash/merge';
import { catchError } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'app-accounting-create-voucher',
    templateUrl: './accounting-create-voucher.component.html',
})
export class AccountingManagementCreateVoucherComponent extends AppForm implements OnInit {

    @ViewChild(AccountingManagementFormCreateVoucherComponent) formCreateComponent: AccountingManagementFormCreateVoucherComponent;
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

    onSubmitSaveVoucher() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        if (!this.listChargeComponent.charges.length) {
            this._toastService.warning("Voucher don't have any charge in this period, Please check it again!");
            return;
        }

        if (!this.checkValidateExchangeRate()) {
            this._toastService.warning(this.invalidUpdateExchangeRate);
            return;
        }

        // if (!this.checkValidAmountRangeChange()) {
        //     this._toastService.warning(this.invalidFormText);
        //     return;
        // }

        const modelAdd: AccAccountingManagementModel = this.onSubmitData();
        modelAdd.type = AccountingConstants.ISSUE_TYPE.VOUCHER;

        modelAdd.charges = cloneDeep(this.listChargeComponent.charges);

        // * Format lại invoice date trước khi gửi lên do Ngx-Mask đổi format.
        modelAdd.charges.forEach(c => {
            if (!!c.invoiceDate) {
                const [day, month, year]: string[] = c.invoiceDate.split("/");
                c.invoiceDate = formatDate(new Date(+year, +month - 1, +day), 'yyyy-MM-dd', 'en');
            } else {
                c.invoiceDate = null;
            }
        });

        this.saveVoucher(modelAdd);
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
            // * not allow greater 1% and lower 1%.
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

    saveVoucher(body: AccAccountingManagementModel) {
        this._accountingRepo.addNewAcctMgnt(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                },
                (res: HttpErrorResponse) => {
                    if (res.error.message === 'Voucher ID has been existed') {
                        this.formCreateComponent.voucherId.setErrors({ existed: true });
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher`]);
    }

    checkValidAmountRangeChange() {
        return this.listChargeComponent.charges.every(x => (x.isValidAmount !== false && x.isValidVatAmount !== false));
    }

    ngOnDestroy() {
        this._store.dispatch(InitPartner());
    }
}
