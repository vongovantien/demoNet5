import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AccountingRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { AccAccountingManagementModel } from '@models';
import { RoutingConstants, SystemConstants } from '@constants';
import { ICanComponentDeactivate } from '@core';

import { IAccountingManagementState, UpdateChargeList } from '../../store';
import { AccountingManagementCreateVATInvoiceComponent } from '../create/accounting-create-vat-invoice.component';

import { tap, switchMap, catchError, finalize, concatMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import isUUID from 'validator/lib/isUUID';
import _merge from 'lodash/merge';

@Component({
    selector: 'app-accounting-detail-vat-invoice',
    templateUrl: './accounting-detail-vat-invoice.component.html',
})
export class AccountingManagementDetailVatInvoiceComponent extends AccountingManagementCreateVATInvoiceComponent implements OnInit, ICanComponentDeactivate {

    vatInvoiceId: string;

    accountingManagement: AccAccountingManagementModel = new AccAccountingManagementModel();

    nextState: RouterStateSnapshot;
    isCancelFormPopupSuccess: boolean = false;

    constructor(
        protected _router: Router,
        protected _toastService: ToastrService,
        protected _accountingRepo: AccountingRepo,
        protected _store: Store<IAccountingManagementState>,
        private _activedRoute: ActivatedRoute,
        private _ngProgressService: NgProgress,
    ) {
        super(_toastService, _accountingRepo, _store, _router);
        this._progressRef = this._ngProgressService.ref();
    }


    ngOnInit(): void {
        this._activedRoute.params.pipe(
            tap((param: Params) => {
                this.vatInvoiceId = !!param.vatInvoiceId ? param.vatInvoiceId : '';
            }),
            switchMap(() => of(this.vatInvoiceId)),
        )
            .subscribe(
                (vatInvoiceId: string) => {
                    if (isUUID(vatInvoiceId)) {
                        this.getDetailVatInvoice(vatInvoiceId);
                    } else {
                        this.gotoList();
                    }
                }
            );
    }

    getDetailVatInvoice(id: string) {
        this._accountingRepo.getDetailAcctMngt(id)
            .subscribe(
                (res: AccAccountingManagementModel) => {
                    if (!!res) {
                        this.accountingManagement = new AccAccountingManagementModel(res);
                        this.updateFormInvoice(res);
                        this.updateChargeList(res);
                    }

                }
            );
    }

    updateFormInvoice(res: AccAccountingManagementModel) {
        const formData: AccAccountingManagementModel | any = {
            date: !!res.date ? { startDate: new Date(res.date), endDate: new Date(res.date) } : null,
        };
        this.formCreateComponent.formGroup.patchValue(Object.assign(_merge(res, formData)));

        if (this.accountingManagement.status !== 'New') {
            this.formCreateComponent.isReadonly = true;
        }

        this.currentFormValue = this.formCreateComponent.formGroup.getRawValue();

    }

    updateChargeList(res: AccAccountingManagementModel) {
        this._store.dispatch(UpdateChargeList({ charges: res.charges }));
        // this.listChargeComponent.charges = res.charges;
        // this.listChargeComponent.updateTotalAmount();

        if (this.accountingManagement.status !== 'New') {
            this.listChargeComponent.isReadOnly = true;
        }
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
        this._accountingRepo.checkVoucherIdExist(this.formCreateComponent.voucherId.value, this.vatInvoiceId)
            .pipe(
                switchMap(
                    (res: boolean) => {
                        if (res) {
                            this.formCreateComponent.voucherId.setErrors({ existed: true });
                            return of({ data: null, message: 'Voucher ID has been existed', status: false });
                        } else {
                            const modelAdd: AccAccountingManagementModel = this.onSubmitData();

                            modelAdd.charges = [...this.listChargeComponent.charges];

                            //  * Update field
                            modelAdd.id = this.vatInvoiceId;
                            modelAdd.status = this.accountingManagement.status;
                            modelAdd.type = this.accountingManagement.type;
                            modelAdd.companyId = this.accountingManagement.companyId;
                            modelAdd.officeId = this.accountingManagement.officeId;
                            modelAdd.departmentId = this.accountingManagement.departmentId;
                            modelAdd.groupId = this.accountingManagement.groupId;
                            modelAdd.userCreated = this.accountingManagement.userCreated;
                            modelAdd.datetimeCreated = this.accountingManagement.datetimeCreated;

                            this._progressRef.start();
                            return this._accountingRepo.updateAcctMngt(modelAdd)
                                .pipe(
                                    catchError(this.catchError),
                                    finalize(() => this._progressRef.complete()),
                                    concatMap((data: CommonInterface.IResult) => {
                                        if (data.status) {
                                            this._toastService.success(data.message);
                                            return this._accountingRepo.getDetailAcctMngt(this.vatInvoiceId);
                                        }
                                        return of({ data: null, message: 'Something getting error. Please check again!', status: false });
                                    })
                                );
                        }
                    }
                ),
            ).subscribe(
                (res: CommonInterface.IResult | AccAccountingManagementModel | any) => {
                    if (!!res && !res.status) {
                        this._toastService.error(res.message);
                    } else {
                        this.accountingManagement = new AccAccountingManagementModel(res);
                        this.updateFormInvoice((res as AccAccountingManagementModel));

                        // * Update list charge & total amount without dispatch action UpdateChargeList.
                        this.listChargeComponent.charges = res.charges;
                        this.listChargeComponent.updateTotalAmount();
                    }
                },
                (error: HttpErrorResponse) => {
                    if ((error.error as CommonInterface.IResult).data === SystemConstants.HTTP_CODE.EXISTED) {
                        this.formCreateComponent.serie.setErrors({ existed: true });
                        this.formCreateComponent.invoiceNoTempt.setErrors({ existed: true });
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/vat-invoice`]);
    }

    canDeactivate(currenctRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> {
        this.nextState = nextState; // * Save nextState for Deactivate service.

        // * USER CONFIRM CANCEL => GO OUT
        if (this.isCancelFormPopupSuccess || this.accountingManagement.status !== 'New') {
            return of(true);
        }
        const isEdited = JSON.stringify(this.currentFormValue) !== JSON.stringify(this.formCreateComponent.formGroup.getRawValue());

        // *  USER EDITED AND NOT CONFIRM
        if (isEdited && !this.isCancelFormPopupSuccess) {
            this.confirmCancelPopup.show();
            return;
        }
        return of(!isEdited);
    }

    handleCancelForm() {
        const isEdited = JSON.stringify(this.currentFormValue) !== JSON.stringify(this.formCreateComponent.formGroup.getRawValue());
        if (isEdited) {
            this.confirmCancelPopup.show();
        } else {
            this.isCancelFormPopupSuccess = true;
            this.gotoList();
        }
    }

    confirmCancel() {
        this.confirmCancelPopup.hide();
        this.isCancelFormPopupSuccess = true;

        if (this.nextState) {
            this._router.navigate([this.nextState.url.toString()]);
        } else {
            this.gotoList();
        }
    }



}
