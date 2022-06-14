import { Component, OnInit, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { ReceiptModel, ReceiptInvoiceModel, ReceiptCreditDebitModel, Partner } from '@models';
import { AppForm } from '@app';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RoutingConstants, SystemConstants, AccountingConstants } from '@constants';
import { InfoPopupComponent, ConfirmPopupComponent } from '@common';
import { AccountingRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { IAppState } from '@store';
import { Store } from '@ngrx/store';
import { InjectViewContainerRefDirective } from '@directives';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { ARCustomerPaymentFormCreateReceiptComponent } from '../components/form-create-receipt/form-create-receipt.component';
import { ARCustomerPaymentReceiptPaymentListComponent } from '../components/receipt-payment-list/receipt-payment-list.component';
import { ResetInvoiceList, RegistTypeReceipt, GetInvoiceListSuccess, SelectReceiptClass } from '../store/actions';
import { ReceiptCreditListState, ReceiptDebitListState, ReceiptTypeState } from '../store/reducers';

import { takeUntil, pluck, tap, switchMap } from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';

export enum SaveReceiptActionEnum {
    DRAFT_CREATE = 0,
    DRAFT_UPDATE = 1,
    DONE = 2,
    CANCEL = 3,
    BANK_CREATE = 4,
    BANK_DONE = 5,
}

@Component({
    selector: 'app-create-receipt',
    templateUrl: './create-receipt.component.html',
})
export class ARCustomerPaymentCreateReciptComponent extends AppForm implements OnInit {
    @ViewChild(ARCustomerPaymentFormCreateReceiptComponent) formCreate: ARCustomerPaymentFormCreateReceiptComponent;
    @ViewChild(ARCustomerPaymentReceiptPaymentListComponent) listInvoice: ARCustomerPaymentReceiptPaymentListComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    invalidBalance: string = 'Total Paid Amount is not matched with Final Paid Amount, Please check it and Click Process Clear to update new value!';
    type: string = null;
    paymentList: ReceiptInvoiceModel[] = [];

    receiptRefId: string = null;
    receiptRefDetail: ReceiptModel;
    titleReceipt: string;
    actionReceiptFromParams: string;

    constructor(
        protected readonly _router: Router,
        protected readonly _toastService: ToastrService,
        protected readonly _accountingRepo: AccountingRepo,
        protected readonly _activedRoute: ActivatedRoute,
        protected readonly _store: Store<IAppState>,

    ) {
        super();
    }

    ngOnInit(): void {
        this.initSubmitClickSubscription((action: string) => { this.saveReceipt(action) });

        this._activedRoute.params
            .pipe(
                pluck('type'),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((type: string) => {
                this._store.dispatch(RegistTypeReceipt({ data: type.toUpperCase() }));
                this.type = type.toUpperCase()
                this.titleReceipt = `Create ${this.type} Receipt`;
            })

        // * Listen Bank Fee/Other/Clear Debit Receipt     
        this._activedRoute.queryParams
            .pipe(
                tap((params: { id: string, action: string }) => {
                    this.receiptRefId = params.id;
                    this.actionReceiptFromParams = params['action'];
                }),
                switchMap((params: { id: string, action: string }) => {
                    if (!!params['id']) {
                        return this._accountingRepo.getDetailReceipt(params['id']);
                    }
                    return EMPTY;
                }),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        switch (this.actionReceiptFromParams) {
                            case 'debit':
                                this.titleReceipt = 'Create Clear Debit';
                                break;
                            case 'bank':
                            case 'other':
                                this.titleReceipt = "Create Bank Fee/Other";
                                break;
                            case 'copy-cancel':
                            case 'copy-done':
                                this.titleReceipt = "Copy Receipt";
                                break;
                            default:
                                break;
                        }
                        this.setFormReceiptDefault(res);
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
    }

    saveReceipt(actionString: string) {
        this.formCreate.isSubmitted = true;
        this.listInvoice.isSubmitted = true;
        this.listInvoice.receiptDebitList.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: this.invalidFormText
            })
            return;
        }

        if (!actionString) {
            return;
        }

        let action: number;
        switch (actionString) {
            case 'draft':
                action = SaveReceiptActionEnum.DRAFT_CREATE;
                break;
            case 'update':
                action = SaveReceiptActionEnum.DRAFT_UPDATE;
                break;
            case 'done':
                action = SaveReceiptActionEnum.DONE;
                break;
            case 'cancel':
                action = SaveReceiptActionEnum.CANCEL;
                break;
            default:
                break;
        }

        const receiptModel: ReceiptModel = this.getDataForm();

        this.paymentList = [];
        this.subscription = combineLatest([
            this._store.select(ReceiptDebitListState),
            this._store.select(ReceiptCreditListState)])
            .subscribe(x => {
                x.forEach((element: ReceiptInvoiceModel[]) => {
                    if (element.length > 0) {
                        element.map(item => {
                            this.paymentList.push(item);
                        })
                    }
                });
            })

        if (this.paymentList.length === 0) {
            this._toastService.warning("Receipt don't have any invoice in this period, Please check it again!");
            return;
        }
        if (this.listInvoice.currencyId.value === 'VND') {
            if (this.paymentList.some(x => (!x.paidAmountVnd && !x.netOff) && this.formCreate.class.value !== AccountingConstants.RECEIPT_CLASS.NET_OFF)) {
                this._toastService.warning("Paid amount vnd is required");
                return;
            }
        } else {
            if (this.paymentList.some(x => (!x.paidAmountUsd && !x.netOff) && this.formCreate.class.value !== AccountingConstants.RECEIPT_CLASS.NET_OFF)) {
                this._toastService.warning("Paid amount usd is required");
                return;
            }
        }

        if ((this.listInvoice.cusAdvanceAmountVnd.value > 0 || this.listInvoice.cusAdvanceAmountUsd.value > 0)
            && ![AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE,
            AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE_BANK,
            AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE_CASH].includes(this.listInvoice.paymentMethod.value)) {
            this.listInvoice.paymentMethod.setErrors({ method_invalid: true });
            this._toastService.warning("Cus Advance Amount >0 <br> so Payment Method must be one of Clear-advance/Clear-Advance-Cash/Clear-Advance-Bank", 'Payment method is incorrect', { enableHtml: true });
            return;
        }

        const DEBIT_LIST = this.paymentList.filter((x: ReceiptInvoiceModel) => x.type === AccountingConstants.RECEIPT_PAYMENT_TYPE.DEBIT);
        const OBH_LIST = this.paymentList.filter((x: ReceiptInvoiceModel) => x.type === AccountingConstants.RECEIPT_PAYMENT_TYPE.OBH);
        const CREDIT_LIST = this.paymentList.filter((x: ReceiptInvoiceModel) => x.paymentType === AccountingConstants.RECEIPT_PAYMENT_TYPE.CREDIT);
        const OTHER_LIST = this.paymentList.filter((x: ReceiptInvoiceModel) => x.paymentType === AccountingConstants.RECEIPT_PAYMENT_TYPE.OTHER);

        const paymentDebitObh = [...DEBIT_LIST, ...OBH_LIST, ...OTHER_LIST];
        let sumTotalPaidUsd: number = 0;
        let sumTotalPaidVnd: number = 0;
        let sumPaidAmountUsd: number = 0;
        let sumPaidAmountVnd: number = 0;

        for (let index = 0; index < paymentDebitObh.length; index++) {
            const element = paymentDebitObh[index];

            sumTotalPaidUsd += element.totalPaidUsd;
            sumTotalPaidVnd += element.totalPaidVnd;

            sumPaidAmountUsd += element.paidAmountUsd;
            sumPaidAmountVnd += element.paidAmountVnd;

            element.isValid = null;
        }

        sumTotalPaidUsd = +sumTotalPaidUsd.toFixed(2);
        sumTotalPaidVnd = +sumTotalPaidVnd.toFixed(0);

        sumPaidAmountUsd = +((+sumPaidAmountUsd).toFixed(2));
        sumPaidAmountVnd = +((+sumPaidAmountVnd).toFixed(0));

        if ((receiptModel.currencyId === 'VND' && Math.abs(receiptModel.paidAmountVnd) > Math.abs(sumPaidAmountVnd)) || (receiptModel.currencyId !== 'VND' && Math.abs(receiptModel.paidAmountUsd) > Math.abs(sumPaidAmountUsd))) {
            this._toastService.warning("Collect amount > Sum paid amount, please process clear");
            return;
        }
        if (Math.abs(sumTotalPaidVnd) > Math.abs(receiptModel.finalPaidAmountVnd) || Math.abs(sumTotalPaidUsd) > Math.abs(receiptModel.finalPaidAmountUsd)) {
            this._toastService.warning("Final paid amount < Sum total paid amount");
            return;
        }
        if (this.formCreate.class.value === AccountingConstants.RECEIPT_CLASS.CLEAR_DEBIT &&
            this.paymentList.filter((x: ReceiptInvoiceModel) => x.type === AccountingConstants.RECEIPT_PAYMENT_TYPE.DEBIT || x.type === AccountingConstants.RECEIPT_PAYMENT_TYPE.OBH).length === 0
        ) {
            this._toastService.warning("Receipt type is wrong, please you correct it!");
            return;
        }
        if (CREDIT_LIST.length && this.formCreate.class.value !== AccountingConstants.RECEIPT_CLASS.NET_OFF) {
            const isCreditHaveInvoice = DEBIT_LIST.some(x => !!x.netOffVnd || !!x.netOffUsd);
            if (!isCreditHaveInvoice) {
                this._toastService.warning("Some credit do not have net off invoice");
                return;
            }
        }

        if (this.paymentList.some(x => x.paymentType !== AccountingConstants.RECEIPT_PAYMENT_TYPE.OTHER && x.isChangeValue == true)) {
            this._toastService.warning('Please you do process clear firstly!');
            return;
        }
        const hasRowTotalInvalid: boolean = this.paymentList.some(x => x.totalPaidVnd > 0 && x.type == AccountingConstants.RECEIPT_PAYMENT_TYPE.DEBIT && (x.totalPaidVnd > x.unpaidAmountVnd || x.totalPaidUsd > x.unpaidAmountUsd));
        if (hasRowTotalInvalid) {
            const rowInvalid: ReceiptInvoiceModel[] = this.paymentList.filter(x => x.totalPaidVnd > 0 && x.type == AccountingConstants.RECEIPT_PAYMENT_TYPE.DEBIT && (x.totalPaidVnd > x.unpaidAmountVnd || x.totalPaidUsd > x.unpaidAmountUsd));
            rowInvalid.forEach(x => {
                x.isValid = false;
            })
            this._toastService.warning("Total paid must <= Unpaid");
            return;
        }
        receiptModel.payments = this.paymentList;
        this.onSaveDataReceipt(receiptModel, action);
    }

    getDataForm() {
        const dataForm: any = Object.assign({}, this.formCreate.formSearchInvoice.getRawValue(), this.listInvoice.form.getRawValue());
        const formMapValue: any = {
            fromDate: !!dataForm.date?.startDate ? formatDate(dataForm.date?.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: !!dataForm.date?.endDate ? formatDate(dataForm.date?.endDate, 'yyyy-MM-dd', 'en') : null,
            paymentDate: !!dataForm.paymentDate?.startDate ? formatDate(dataForm.paymentDate?.startDate, 'yyyy-MM-dd', 'en') : null,
            type: this.type || 'Customer',
            notifyDepartment: !!dataForm.notifyDepartment ? dataForm.notifyDepartment.toString() : null
        };

        const d = this.utility.mergeObject(dataForm, formMapValue);
        return d;
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreate.formSearchInvoice.valid
            || !this.listInvoice.form.valid
            || this.listInvoice.paidAmountVnd.value === null
            || this.listInvoice.paidAmountUsd.value === null
            || this.listInvoice.exchangeRate.value === null

        ) {
            valid = false;
        } else {
            if (this.listInvoice.paymentMethod.value === AccountingConstants.RECEIPT_PAYMENT_METHOD.CASH) {
                if (!this.formCreate.paymentRefNo.value) {
                    this.formCreate.paymentRefNo.setErrors({ required: true });
                    valid = false;
                } else {
                    this.removeValidators(this.formCreate.paymentRefNo);
                    valid = true;
                }
            } else if (this.formCreate.class.value?.includes('OBH') ||
                (
                    this.formCreate.class.value === AccountingConstants.RECEIPT_CLASS.CLEAR_DEBIT
                    && (this.listInvoice.paymentMethod.value === AccountingConstants.RECEIPT_PAYMENT_METHOD.COLL_INTERNAL
                        || this.listInvoice.paymentMethod.value === AccountingConstants.RECEIPT_PAYMENT_METHOD.OBH_INTERNAL)
                )) {
                if (!this.listInvoice.obhpartnerId.value) {
                    this.listInvoice.obhpartnerId.setErrors({ required: true });
                    valid = false;
                } else {
                    this.removeValidators(this.listInvoice.obhpartnerId);

                    valid = true;
                }
            }

        }

        return valid;
    }

    onSaveDataReceipt(model: ReceiptModel, action: number) {
        model.id = SystemConstants.EMPTY_GUID;
        model.referenceId = this.receiptRefId; // * Set Id cho phiếu ngân hàng.
        if (this.actionReceiptFromParams?.includes('copy')) {
            model.referenceId = null;
        }
        this._accountingRepo.saveReceipt(model, action)
            .subscribe(
                (res: CommonInterface.IResult) => {
                    console.log(res);
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._store.dispatch(ResetInvoiceList());
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${res.data.id}`]);
                        return;
                    }
                    this._toastService.error("Create data fail, Please check again!");
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

    confirmCancel() {
        let dataList = [];
        combineLatest([
            this._store.select(ReceiptDebitListState),
            this._store.select(ReceiptCreditListState)])
            .subscribe(x => {
                x.forEach((element: ReceiptInvoiceModel[]) => {
                    if (element.length > 0) {
                        element.map(item => dataList.push(item))
                    }
                });
            });

        if (dataList.length > 0) {
            this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: 'Do you want to exit without saving?',
            }, () => {
                this.gotoList();
            })
        } else {
            this.gotoList();
        }
    }

    confirmDoneReceipt() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: 'Noted: After you save the receipt, you can not edit. Are you sure do this action?',
            title: 'Alert',
            labelCancel: 'No',
            labelConfirm: 'Yes',
            iconConfirm: 'la la-save'
        }, () => {
            this.submitClick('done');
        })
    }

    confirmCancelReceipt() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Cancel Receipt',
            body: 'This Receipt will be canceled. Are you sure you want to continue?',
            labelConfirm: 'Yes',
            classConfirmButton: 'btn-danger',
            iconConfirm: 'la la-times'
        }, () => {
            this.submitClick('cancel');
        })
    }

    setFormReceiptDefault(receiptModel: ReceiptModel) {
        this.receiptRefDetail = receiptModel;
        this._store.dispatch(RegistTypeReceipt({ data: receiptModel.type.toUpperCase(), partnerId: receiptModel.customerId }));

        this.setFormCreateDefault(this.receiptRefDetail);
        this.setPaymentListFormDefault(this.receiptRefDetail);
    }

    setFormCreateDefault(res: ReceiptModel) {
        const formMapping = {
            date: !!res.fromDate && !!res.toDate ? { startDate: new Date(res.fromDate), endDate: new Date(res.toDate) } : null,
            customerId: res.customerId,
            agreementId: res.agreementId,
            class: this.actionReceiptFromParams === 'debit' ? AccountingConstants.RECEIPT_CLASS.CLEAR_DEBIT : res.class,
        };

        this.formCreate.formSearchInvoice.patchValue(formMapping);

        this.formCreate.customerName = res.customerName;
        this.formCreate.getContract();

        if (this.actionReceiptFromParams !== 'debit' && !this.actionReceiptFromParams.includes('copy')) {
            this.formCreate.isReadonly = true;
        }
        // let paymentRefNo: string = null;
        // switch (this.actionReceiptFromParams) {
        //     case 'bank':
        //         paymentRefNo = res.paymentRefNo + '_BANK';
        //         this.formCreate.isUpdate = true;
        //         break;
        //     case 'other':
        //         paymentRefNo = res.paymentRefNo + '_OTH001';
        //         this.formCreate.isUpdate = true;
        //         break;
        //     case 'debit':
        //         this.formCreate.isUpdate = false; // allow generate receipt
        //         break;
        //     default:
        //         break;
        // }

        // this.formCreate.formSearchInvoice.patchValue({
        //     paymentRefNo: paymentRefNo,
        //     referenceNo: res.paymentRefNo + '_' + res.class
        // });
    }

    setPaymentListFormDefault(res: ReceiptModel) {
        if (res.currencyId !== 'VND') {
            this.listInvoice.paidAmountUsd.enable();
            this.listInvoice.creditAmountUsd.enable();
            this.listInvoice.cusAdvanceAmountUsd.enable();
        }

        switch (this.actionReceiptFromParams) {
            case 'debit':
                this.setPaymentListFormForClearDebit(res);
                break;
            case 'bank':
                this.setPaymentListDefaultForBankFee(res);
                break;
            case 'copy-cancel':
            case 'copy-done':
                this.setPaymentListFormForCopy(res, this.actionReceiptFromParams);
                break;
            default:
                this.setListInvoiceDefaultForOther(res);
                break;
        }

    }

    setPaymentListDefaultForBankFee(res: ReceiptModel) {
        const formMapping = {
            type: res.type?.split(","),
            paymentDate: !!res.paymentDate ? { startDate: new Date(res.paymentDate), endDate: new Date(res.paymentDate) } : null,
            cusAdvanceAmountVnd: 0,
            cusAdvanceAmountUsd: 0,
            creditAmountUsd: 0,
            creditAmountVnd: 0,
            paidAmountVnd: 0,
            paidAmountUsd: 0,
            finalPaidAmountVnd: 0,
            finalPaidAmountUsd: 0,
            paymentMethod: AccountingConstants.RECEIPT_PAYMENT_METHOD.MANAGEMENT_FEE,
            notifyDepartment: !!res.notifyDepartment ? (res.notifyDepartment.split(',') || []).map(c => +c) : [],

        };
        this.listInvoice.form.patchValue(this.utility.mergeObject({ ...res }, formMapping));

        this._store.dispatch(ResetInvoiceList());
        this._store.dispatch(SelectReceiptClass({ class: res.class }));
        this._store.dispatch(GetInvoiceListSuccess({ invoices: this.generateDefaultDebitList(res) }));

        (this.listInvoice.partnerId as any) = { id: res.customerId };
    }

    setPaymentListFormForClearDebit(res: ReceiptModel) {
        const formMapping = {
            type: res.type?.split(","),
            paymentDate: !!res.paymentDate ? { startDate: new Date(res.paymentDate), endDate: new Date(res.paymentDate) } : null,
            creditAmountUsd: 0,
            creditAmountVnd: 0,
            paidAmountVnd: res.finalPaidAmountVnd,
            paidAmountUsd: res.finalPaidAmountUsd,
            cusAdvanceAmountVnd: res.class === AccountingConstants.RECEIPT_CLASS.ADVANCE ? res.finalPaidAmountVnd : 0,
            cusAdvanceAmountUsd: res.class === AccountingConstants.RECEIPT_CLASS.ADVANCE ? res.finalPaidAmountUsd : 0,
            notifyDepartment: !!res.notifyDepartment ? (res.notifyDepartment.split(',') || []).map(c => +c) : [],
            paymentMethod: res.class?.includes('OBH') ? AccountingConstants.RECEIPT_PAYMENT_METHOD.COLL_INTERNAL : AccountingConstants.RECEIPT_PAYMENT_METHOD.OTHER,
        };

        this.listInvoice.form.patchValue(this.utility.mergeObject({ ...res }, formMapping));

        if (res.class == AccountingConstants.RECEIPT_CLASS.COLLECT_OBH && !!res.receiptInternalOfficeCode) {
            this.listInvoice.obhPartners
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((partners: Partner[]) => {
                    if (!!partners.length) {
                        const partner: Partner = partners.find(x => x.internalCode === res.receiptInternalOfficeCode);
                        this.listInvoice.obhpartnerId.setValue(partner?.id);
                    }
                })
        } else if (res.class === AccountingConstants.RECEIPT_CLASS.ADVANCE) {
            this.listInvoice.paymentMethod.setValue(AccountingConstants.RECEIPT_PAYMENT_METHOD.CLEAR_ADVANCE);
        }

        this._store.dispatch(GetInvoiceListSuccess({ invoices: [] }));
        (this.listInvoice.partnerId as any) = { id: res.customerId };
    }

    setListInvoiceDefaultForOther(res: ReceiptModel) {
        const formMappingFormOther = {
            type: res.type?.split(","),
            paymentDate: !!res.paymentDate ? { startDate: new Date(res.paymentDate), endDate: new Date(res.paymentDate) } : null,
            cusAdvanceAmountVnd: 0,
            cusAdvanceAmountUsd: 0,
            creditAmountUsd: 0,
            creditAmountVnd: 0,
            paidAmountVnd: 0,
            paidAmountUsd: 0,
            finalPaidAmountVnd: 0,
            finalPaidAmountUsd: 0,
            paymentMethod: AccountingConstants.RECEIPT_PAYMENT_METHOD.OTHER_FEE,
            notifyDepartment: !!res.notifyDepartment ? (res.notifyDepartment.split(',') || []).map(c => +c) : [],
        };

        this.listInvoice.form.patchValue(this.utility.mergeObject({ ...res }, formMappingFormOther));

        this._store.dispatch(GetInvoiceListSuccess({ invoices: this.generateDefaultDebitList(res) }));

        (this.listInvoice.partnerId as any) = { id: res.customerId };
    }

    setPaymentListFormForCopy(res: ReceiptModel, typeCopy: string) {
        const formMapping = {
            type: res.type?.split(","),
            paymentDate: !!res.paymentDate ? { startDate: new Date(res.paymentDate), endDate: new Date(res.paymentDate) } : null,
            notifyDepartment: !!res.notifyDepartment ? (res.notifyDepartment.split(',') || []).map(c => +c) : []
        };

        this.listInvoice.form.patchValue(this.utility.mergeObject({ ...res }, formMapping));

        this._store.dispatch(ResetInvoiceList());
        this._store.dispatch(SelectReceiptClass({ class: res.class }));

        if (typeCopy === "copy-done") {
            this._store.dispatch(GetInvoiceListSuccess({ invoices: [...this.generateDefaultDebitList(res)] }));
        } else {
            this._store.dispatch(GetInvoiceListSuccess({ invoices: [...res.payments.filter((x: ReceiptInvoiceModel) => !x.negative)] }));
        }
        (this.listInvoice.partnerId as any) = { id: res.customerId };
    }

    generateDefaultDebitList(res: ReceiptModel) {
        const listPaymentWithUnpaid = res.payments.filter(x => (x.type === "DEBIT" || x.type === "OBH")
            && x.paymentStatus === AccountingConstants.PAYMENT_STATUS.PAID_A_PART);
        if (!listPaymentWithUnpaid.length) {
            return;
        }
        listPaymentWithUnpaid.forEach((c: ReceiptInvoiceModel) => {

            c.unpaidAmountVnd = c.paidAmountVnd = c.totalPaidVnd = c.balanceVnd;
            c.unpaidAmountUsd = c.paidAmountUsd = c.totalPaidUsd = c.balanceUsd;

            if (c.currencyId === 'VND') {
                c.unpaidAmount = c.unpaidAmountVnd;
            } else {
                c.unpaidAmount = c.unpaidAmountUsd;
            }
        })
        listPaymentWithUnpaid.forEach((x: ReceiptInvoiceModel) => {
            x.paidAmountVnd = x.unpaidAmountVnd;
            x.paidAmountUsd = x.unpaidAmountUsd;
            x.notes = "Bank Fee/Other Receipt";
            x.netOff = false;
            x.netOffVnd = 0;
            x.netOffUsd = 0;
            x.id = SystemConstants.EMPTY_GUID; // ? Reset ID Trường hợp phiếu ngân hàng.
        })

        return listPaymentWithUnpaid;
    }

    handleValidateReceiptResponse(res: HttpErrorResponse) {
        if (res.error.code === SystemConstants.HTTP_CODE.EXISTED) {
            this.formCreate.paymentRefNo.setErrors({ existed: true });
            return;
        }
        if (res.error?.code == 408) {
            this.listInvoice.cusAdvanceAmountVnd.setErrors({ validCus: true }); //? Adv vượt quá số tiền trên agreement.
            return;
        }
        if (res.error?.code == 407) {
            this.listInvoice.paidAmountVnd.setErrors({ validCus: true });
            return;
        }
    }
}
