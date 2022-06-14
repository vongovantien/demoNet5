import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AccountingRepo } from '@repositories';
import { ReceiptInvoiceModel, ReceiptModel } from '@models';
import { SystemConstants, AccountingConstants, RoutingConstants } from '@constants';

import { ARCustomerPaymentCreateReciptComponent } from '../create-receipt/create-receipt.component';

import { of } from 'rxjs';
import { pluck, switchMap, tap, concatMap, takeUntil, filter } from 'rxjs/operators';
import { IAppState } from '@store';
import { Store } from '@ngrx/store';
import { GetInvoiceListSuccess, ResetInvoiceList, RegistTypeReceipt, SelectReceiptClass } from '../store/actions';
import { ARCustomerPaymentFormCreateReceiptComponent } from '../components/form-create-receipt/form-create-receipt.component';
import { InjectViewContainerRefDirective } from '@directives';
import { ConfirmPopupComponent } from '@common';

@Component({
    selector: 'app-detail-receipt',
    templateUrl: './detail-receipt.component.html',
})
export class ARCustomerPaymentDetailReceiptComponent extends ARCustomerPaymentCreateReciptComponent implements OnInit {
    @ViewChild(ARCustomerPaymentFormCreateReceiptComponent) formCreate: ARCustomerPaymentFormCreateReceiptComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    receiptId: string;
    receiptDetail: ReceiptModel;
    confirmMessage: string = '';
    actionTypeCreate: string;

    constructor(
        protected _router: Router,
        protected _toast: ToastrService,
        protected _accountingRepo: AccountingRepo,
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<IAppState>,
    ) {
        super(_router, _toast, _accountingRepo, _activedRoute, _store);
    }

    ngOnInit() {
        this.subscriptRouterChangeToGetDetailReceipt();

        this.initSubmitClickSubscription((actionType: string) => this.saveReceipt(actionType));
    }

    subscriptRouterChangeToGetDetailReceipt() {
        this._activedRoute.params
            .pipe(
                filter(x => !!x),
                pluck('id'),
                tap((id: string) => { this.receiptId = id }),
                switchMap((receiptId: string) => this._accountingRepo.getDetailReceipt(receiptId)),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (res: ReceiptModel) => {
                    if (!!res) {
                        if (res.id === SystemConstants.EMPTY_GUID) {
                            return;
                        }
                        this.updateDetailForm(res);
                    }
                },
            );
    }

    getDetailReceipt(id: string) {
        this._accountingRepo.getDetailReceipt(id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: ReceiptModel) => {
                    if (!!res) {
                        if (res.id === SystemConstants.EMPTY_GUID) {
                            this.gotoList();
                            return;
                        }
                        this.updateDetailForm(res);
                    } else this.gotoList();
                },
                (err) => this.gotoList()
            )
    }

    updateDetailForm(res: ReceiptModel) {
        this.receiptDetail = res;
        this._store.dispatch(RegistTypeReceipt({ data: res.type.toUpperCase(), partnerId: res.customerId }));

        this.updateFormCreate(this.receiptDetail);
        this.updateListInvoice(this.receiptDetail);
    }

    updateFormCreate(res: ReceiptModel) {
        const formMapping = {
            date: !!res.fromDate && !!res.toDate ? { startDate: new Date(res.fromDate), endDate: new Date(res.toDate) } : null,
            customerId: res.customerId,
            agreementId: res.agreementId,
            paymentRefNo: res.paymentRefNo
        };

        this.formCreate.formSearchInvoice.patchValue(this.utility.mergeObject({ ...res }, formMapping));
        this.formCreate.customerName = res.customerName;
        this.formCreate.receiptReference = res.referenceNo;
        // this.formCreate.contractNo = res.contractNo;
        this.formCreate.getContract();
    }

    updateListInvoice(res: ReceiptModel) {
        let valueUSD = 0;
        let valueVND = 0;
        res.payments.filter((x: ReceiptInvoiceModel) => x.type === 'CREDIT').reduce((amount: number, item: ReceiptInvoiceModel) => valueUSD += item.unpaidAmountUsd, 0);
        res.payments.filter((x: ReceiptInvoiceModel) => x.type === 'CREDIT').reduce((amount: number, item: ReceiptInvoiceModel) => valueVND += item.unpaidAmountVnd, 0);
        const formMapping = {
            type: res.type?.split(","),
            paymentDate: !!res.paymentDate ? { startDate: new Date(res.paymentDate), endDate: new Date(res.paymentDate) } : null,
            notifyDepartment: !!res.notifyDepartment ? (res.notifyDepartment.split(',') || []).map(c => +c) : []
        };

        this.listInvoice.form.patchValue(this.utility.mergeObject({ ...res }, formMapping));

        // * Mapping credit to credit[]
        this._store.dispatch(ResetInvoiceList());
        this._store.dispatch(GetInvoiceListSuccess({ invoices: res.payments }));
        this._store.dispatch(SelectReceiptClass({ class: res.class }));
        (this.listInvoice.partnerId as any) = { id: res.customerId };
        this.listInvoice.obhPartnerName = res.obhPartnerName;

        if (res.status === AccountingConstants.RECEIPT_STATUS.DONE || res.status === AccountingConstants.RECEIPT_STATUS.CANCEL) {
            this.listInvoice.isReadonly = true;
            this.formCreate.isReadonly = true;
        }

        if (res.class === AccountingConstants.RECEIPT_CLASS.CLEAR_DEBIT || res.class === AccountingConstants.RECEIPT_CLASS.NET_OFF) {
            this.formCreate.isShowGetDebit = true;
        } else {
            this.formCreate.isShowGetDebit = false;
        }
    }


    onSaveDataReceipt(model: ReceiptModel, action: number) {
        model.id = this.receiptDetail.id;
        model.userCreated = this.receiptDetail.userCreated;
        model.userModified = this.receiptDetail.userModified;
        model.datetimeCreated = this.receiptDetail.datetimeCreated;
        model.datetimeModified = this.receiptDetail.datetimeModified;
        model.status = this.receiptDetail.status;
        model.syncStatus = this.receiptDetail.syncStatus;
        model.lastSyncDate = this.receiptDetail.lastSyncDate;

        if (!action) { return; };
        this._accountingRepo.saveReceipt(model, action)
            .pipe(
                concatMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._store.dispatch(ResetInvoiceList());
                        return this._accountingRepo.getDetailReceipt(this.receiptId);
                    }
                    of(res);
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res && res.status === false) {
                        this._toastService.error(res.message);
                        return;
                    }
                    this.updateDetailForm(res);
                },
                (res: HttpErrorResponse) => {
                    this.handleValidateReceiptResponse(res);
                }
            )
    };

    gotoList() {
        this._store.dispatch(ResetInvoiceList());
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}`]);
    }

    confirmSync() {
        this.confirmMessage = `Are you sure you want to send data to accountant system?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Sync To Accountant System',
            body: 'Are you sure you want to send data to accountant system',
            iconConfirm: 'la la-cloud-upload',
            labelConfirm: 'Yes'
        }, () => {
            this.sendReceiptToAccountant();
        });
    }

    sendReceiptToAccountant() {
        const receiptSyncIds: AccountingInterface.IRequestString[] = [];
        const receiptSyncId: AccountingInterface.IRequestString = {
            id: this.receiptDetail.id,
            action: this.receiptDetail.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
        };
        receiptSyncIds.push(receiptSyncId);

        this._accountingRepo.syncReceiptToAccountant(receiptSyncIds)
            .pipe(
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success("Send Data to Accountant System Successful");
                        this._store.dispatch(ResetInvoiceList());
                        this.getDetailReceipt(this.receiptId);
                    } else {
                        this._toastService.error("Send Data Fail");
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    confirmCancel() {
        if (this.receiptDetail.status === AccountingConstants.RECEIPT_STATUS.CANCEL || this.receiptDetail.status === AccountingConstants.RECEIPT_STATUS.DONE) {
            this.gotoList();
        } else {
            this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: 'Do you want to exit without saving?',
            }, () => {
                this.gotoList();
            })
        }
    }

    confirmCreateReceiptBankFeeOther(type: string) {
        this.actionTypeCreate = type;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Create Bank Fee Receipt',
            body: `Are you sure you want to create bank fee receipt for <span class="text-primary font-weight-bold">${this.receiptDetail.customerName} </span>?`,
            iconConfirm: 'la la-save',
            labelConfirm: 'Yes',
            center: true

        }, () => {
            this.createReceiptWithActionType();
        });
    }

    createReceiptWithActionType() {
        // * Go to create 
        this._store.dispatch(ResetInvoiceList());
        this._store.dispatch(RegistTypeReceipt({ data: this.receiptDetail.type.toUpperCase() }));
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${this.receiptDetail.type.toLowerCase()}/new`], { queryParams: { id: this.receiptId, action: this.actionTypeCreate } });
    }


    confirmCreateClearDebit() {
        this.actionTypeCreate = 'debit';
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Create Receipt Clear Debit',
            body: `Are you sure you want to create Receipt Clear Debit for <span class="text-primary font-weight-bold">${this.receiptDetail.customerName} </span>?`,
            iconConfirm: 'la la-save',
            labelConfirm: 'Yes',
        }, () => {
            this.createReceiptWithActionType();
        });
    }

}
