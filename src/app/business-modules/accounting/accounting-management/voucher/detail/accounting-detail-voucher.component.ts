import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountingRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { AccAccountingManagementModel, ChargeOfAccountingManagementModel } from '@models';
import { formatDate } from '@angular/common';
import { RoutingConstants, AccountingConstants } from '@constants';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ICanComponentDeactivate } from '@core';

import { IAccountingManagementState, UpdateChargeList } from '../../store';
import { AccountingManagementCreateVoucherComponent } from '../create/accounting-create-voucher.component';

import { Observable, of } from 'rxjs';
import { isUUID } from 'validator';
import _merge from 'lodash/merge';
import { tap, switchMap, catchError, finalize, concatMap } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';
@Component({
    selector: 'app-accounting-detail-voucher',
    templateUrl: './accounting-detail-voucher.component.html',
})
export class AccountingManagementDetailVoucherComponent extends AccountingManagementCreateVoucherComponent implements OnInit, ICanComponentDeactivate {
    @ViewChild('confirmSyncVoucher') confirmVoucherPopup: ConfirmPopupComponent;
    @ViewChild('validateSyncedVoucherPopup') validateSyncedPopup: InfoPopupComponent;
    voucherId: string;
    accountingManagement: AccAccountingManagementModel = new AccAccountingManagementModel();

    voucherSync: any[] = [];

    nextState: RouterStateSnapshot;
    isCancelFormPopupSuccess: boolean = false;
    messageValidate: string = '';

    constructor(
        protected _router: Router,
        protected _toastService: ToastrService,
        protected _accountingRepo: AccountingRepo,
        protected _store: Store<IAccountingManagementState>,
        private _activedRoute: ActivatedRoute,
        private _ngProgressService: NgProgress,
        private _spinner: NgxSpinnerService
    ) {
        super(_toastService, _accountingRepo, _store, _router);
    }


    ngOnInit(): void {
        this._activedRoute.params.pipe(
            tap((param: Params) => {
                this.voucherId = !!param.voucherId ? param.voucherId : '';
            }),
            switchMap(() => of(this.voucherId)),
        )
            .subscribe(
                (voucherId: string) => {
                    if (isUUID(voucherId)) {
                        this.getDetailVoucher(voucherId);
                    } else {
                        this.gotoList();
                    }
                }
            );
    }

    getDetailVoucher(id: string, isDispatchChargeList: boolean = true) {
        this._accountingRepo.getDetailAcctMngt(id)
            .subscribe(
                (res: AccAccountingManagementModel) => {
                    this.accountingManagement = new AccAccountingManagementModel(res);
                    this.updateFormVoucher(res);
                    if (isDispatchChargeList) {
                        this.updateChargeList(res);
                    }

                    if (this.accountingManagement.syncStatus === AccountingConstants.SYNC_STATUS.SYNCED) {
                        this.formCreateComponent.isReadonly = true;
                        this.listChargeComponent.isReadOnly = true;
                    }
                }
            );
    }

    updateFormVoucher(res: AccAccountingManagementModel) {
        const formData: AccAccountingManagementModel | any = {
            date: !!res.date ? { startDate: new Date(res.date), endDate: new Date(res.date) } : null,
        };
        this.formCreateComponent.formGroup.patchValue(Object.assign(_merge(res, formData)));

        this.currentFormValue = this.formCreateComponent.formGroup.getRawValue();
    }

    updateChargeList(res: AccAccountingManagementModel) {
        // this.listChargeComponent.charges = res.charges;
        // this.listChargeComponent.updateTotalAmount();

        this._store.dispatch(UpdateChargeList({ charges: res.charges }));

    }

    onSubmitSaveVoucher() {
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

        // if (!this.checkValidAmountRangeChange()) {
        //     this._toastService.warning(this.invalidFormText);
        //     return;
        // }

        this._accountingRepo.checkVoucherIdDuplicate(this.formCreateComponent.voucherId.value, this.voucherId)
            .pipe(
                switchMap(
                    (res: boolean) => {
                        if (res) {
                            this.formCreateComponent.voucherId.setErrors({ existed: true });
                            return of({ data: null, message: "Voucher ID " + this.formCreateComponent.voucherId.value + " existed in " + (new Date()).getFullYear(), status: false });
                        } else {
                            const modelAdd: AccAccountingManagementModel = this.onSubmitData();
                            modelAdd.charges = cloneDeep(this.listChargeComponent.charges);

                            modelAdd.charges.forEach(c => {
                                if (!!c.invoiceDate) {
                                    const [day, month, year]: string[] = c.invoiceDate.split("/");
                                    c.invoiceDate = formatDate(new Date(+year, +month - 1, +day), 'yyyy-MM-dd', 'en');
                                } else {
                                    c.invoiceDate = null;
                                }
                            });
                            //  * Update field
                            modelAdd.id = this.voucherId;
                            modelAdd.status = this.accountingManagement.status;
                            modelAdd.type = this.accountingManagement.type;
                            modelAdd.companyId = this.accountingManagement.companyId;
                            modelAdd.officeId = this.accountingManagement.officeId;
                            modelAdd.departmentId = this.accountingManagement.departmentId;
                            modelAdd.groupId = this.accountingManagement.groupId;
                            modelAdd.userCreated = this.accountingManagement.userCreated;
                            modelAdd.datetimeCreated = this.accountingManagement.datetimeCreated;
                            modelAdd.syncStatus = this.accountingManagement.syncStatus;
                            modelAdd.lastSyncDate = this.accountingManagement.lastSyncDate;
                            modelAdd.reasonReject = this.accountingManagement.reasonReject;

                            return this._accountingRepo.updateAcctMngt(modelAdd)
                                .pipe(
                                    catchError(this.catchError),
                                    concatMap((data: CommonInterface.IResult) => {
                                        if (data.status) {
                                            this._toastService.success(data.message);
                                            return this._accountingRepo.getDetailAcctMngt(this.voucherId);
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
                        this.updateFormVoucher((res as AccAccountingManagementModel));

                        // * Update list charge & total amount without dispatch action UpdateChargeList.
                        this.listChargeComponent.charges = this.formatInvoiceDate(res.charges);

                        this.listChargeComponent.updateTotalAmount();
                    }
                },
            );
    }

    saveVoucher(body: AccAccountingManagementModel) {
        this._accountingRepo.updateAcctMngt(body)
            .pipe(
                catchError(this.catchError),
                concatMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        return this._accountingRepo.getDetailAcctMngt(this.voucherId);
                    }
                    of(res);
                })
            )
            .subscribe(
                (res: CommonInterface.IResult | AccAccountingManagementModel | any) => {
                    if (!!res && res.status === false) {
                        this._toastService.error(res.message);
                    } else {
                        this.updateFormVoucher(res);
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/voucher`]);
    }

    formatInvoiceDate(charges: ChargeOfAccountingManagementModel[]) {
        charges.forEach(c => {
            if (!!c.invoiceDate) {
                c.invoiceDate = formatDate(new Date(c.invoiceDate), 'dd/MM/yyyy', 'en');
            } else {
                c.invoiceDate = null;
            }
        });
        return charges;
    }

    confirmSync() {
        this._accountingRepo.checkVoucherSynced(this.voucherId)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.messageValidate = "Existing charge has been synchronized to the accounting system! Please you check again!";
                        this.validateSyncedPopup.show();
                    } else {
                        if (this.accountingManagement.syncStatus === AccountingConstants.SYNC_STATUS.SYNCED) {
                            return;
                        }
                        this.voucherSync = [{ id: this.accountingManagement.id, action: this.accountingManagement.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD' }];
                        this.confirmVoucherPopup.show();
                    }
                },
            );
    }

    onSyncBravo() {
        this.confirmVoucherPopup.hide();
        this._spinner.show();
        this._accountingRepo.syncVoucherToAccountant(this.voucherSync)
            .pipe(
                finalize(() => this._spinner.hide()),
                catchError(this.catchError)
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success("Sync Data to Accountant System Successful");

                        this.getDetailVoucher(this.voucherId, false);
                    } else {
                        this._toastService.error("Sync Data Fail");
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    canDeactivate(currenctRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): Observable<boolean> {
        this.nextState = nextState; // * Save nextState for Deactivate service.
        // * USER CONFIRM CANCEL => GO OUT
        if (this.isCancelFormPopupSuccess
            || this.accountingManagement.status !== 'New'
            || this.accountingManagement.syncStatus === AccountingConstants.SYNC_STATUS.SYNCED) {
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
