import { Component, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { ConfirmPopupComponent, Permission403PopupComponent, LoadingPopupComponent } from "@common";
import { AccountingRepo, ExportRepo } from "@repositories";
import { AppList, IPermissionBase } from "@app";
import { ReceiptModel } from "@models";
import { SortService } from "@services";
import { RoutingConstants, AccountingConstants, SystemConstants } from "@constants";

import { catchError, map, takeUntil, withLatestFrom } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { IAppState } from "@store";
import { Store } from "@ngrx/store";
import { LoadListCustomerPayment, ResetInvoiceList, RegistTypeReceipt } from "./store/actions";
import { InjectViewContainerRefDirective, ContextMenuDirective } from "@directives";
import { customerPaymentReceipListState, customerPaymentReceipPagingState, customerPaymentReceipSearchState, customerPaymentReceipLoadingState } from "./store/reducers";
import { ARCustomerPaymentFormQuickUpdateReceiptPopupComponent, IModelQuickUpdateReceipt } from "./components/popup/form-quick-update-receipt-popup/form-quick-update-receipt.popup";
import { ICriteriaReceiptAdvance } from "../history-payment/components/list-invoice-payment/list-invoice-history-payment.component";
import { HttpResponse } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

enum PAYMENT_TAB {
    CUSTOMER = 'CUSTOMER',
    AGENCY = 'AGENCY',
    ARSUMMARY = 'ARSUMMARY',
    HISTORY = 'HISTORY'

}
@Component({
    selector: 'app-customer-payment',
    templateUrl: './customer-payment.component.html',
})
export class ARCustomerPaymentComponent extends AppList implements IPermissionBase {

    @ViewChild(InjectViewContainerRefDirective) viewContainer: InjectViewContainerRefDirective;
    @ViewChild(ARCustomerPaymentFormQuickUpdateReceiptPopupComponent) quickUpdatePopup: ARCustomerPaymentFormQuickUpdateReceiptPopupComponent;
    @ViewChildren(ContextMenuDirective) queryListMenuContext: QueryList<ContextMenuDirective>;
    CPs: ReceiptModel[] = [];

    selectedCPs: ReceiptModel = null;
    messageDelete: string = "";
    selectedTab: string = PAYMENT_TAB.CUSTOMER;

    dataSearch: any = {
        dateFrom: formatDate(new Date(new Date().setDate(new Date().getDate() - 29)), 'yyyy-MM-dd', 'en'),
        dateTo: formatDate(new Date(), 'yyyy-MM-dd', 'en')
    }

    selectedReceipt: ReceiptModel;
    selectedUpdateKey: string;

    constructor(
        private readonly _sortService: SortService,
        private readonly _toastService: ToastrService,
        private readonly _router: Router,
        private readonly _accountingRepo: AccountingRepo,
        private readonly _store: Store<IAppState>,
        private readonly _exportRepo: ExportRepo,
        private readonly _spinner: NgxSpinnerService
    ) {
        super();
        this.requestList = this.requestLoadListCustomerPayment;
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {

        this.headers = [
            { title: 'Receipt No', field: 'paymentRefNo', sortable: true },
            { title: 'Paid Date', field: 'paymentDate', sortable: true },
            { title: 'Customer Name', field: 'customerName', sortable: true },
            { title: 'Collect Amount', field: '', sortable: true },
            { title: 'Description', field: 'description', sortable: true },
            { title: 'Receipt Type', field: '', sortable: true },
            { title: 'Payment Method', field: 'paymentMethod', sortable: true },
            { title: 'Payment Amount', field: 'paidAmount', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Billing Date', field: 'billingDate', sortable: true },
            { title: 'Last Sync', field: 'lastSyncDate', sortable: true },
            { title: 'Creator', field: 'userNameCreated', sortable: true },
            { title: 'Create Date', field: 'datetimeCreated', sortable: true },
            { title: 'Modifie Date', field: 'datetimeModiflied', sortable: true },

        ];
        this.isLoading = this._store.select(customerPaymentReceipLoadingState)
        this.getCPs();


        this._store.select(customerPaymentReceipSearchState)
            .pipe(
                withLatestFrom(this._store.select(customerPaymentReceipPagingState)),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch })),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (data) => {
                    if (!!data.dataSearch) {
                        this.dataSearch = data.dataSearch;
                    }

                    this.page = data.page;
                    this.pageSize = data.pageSize;

                    this.requestLoadListCustomerPayment();
                }
            );
    }

    checkAllowDetail(data: ReceiptModel) {
        this._accountingRepo
            .checkAllowGetDetailCPS(data.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this._store.dispatch(ResetInvoiceList());
                    this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${data.id}`]);
                } else {
                    this.showPopupDynamicRender(Permission403PopupComponent, this.viewContainer.viewContainerRef, { center: true });
                }
            });
    }

    checkAllowDelete(data: ReceiptModel) {
        this._accountingRepo
            .checkAllowDeleteCusPayment(data.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.selectedCPs = new ReceiptModel(data);
                    this.messageDelete = `Do you want to delete Receipt ${data.paymentRefNo} ? `;
                    this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
                        title: 'Delete Receipt',
                        body: this.messageDelete,
                        labelConfirm: 'Yes',
                        classConfirmButton: 'btn-danger',
                        iconConfirm: 'la la-trash',
                        center: true
                    }, () => this.onConfirmDeleteCP())
                } else {
                    this.showPopupDynamicRender(Permission403PopupComponent, this.viewContainer.viewContainerRef, { center: true });
                }
            });
    }

    cancelReceipt(receipt: ReceiptModel) {
        if (!receipt) {
            return;
        }
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Cancel Receipt',
            body: `This Receipt ${receipt.paymentRefNo} will be canceled. Are you sure you want to continue?`,
            labelConfirm: 'Yes',
            classConfirmButton: 'btn-danger',
            iconConfirm: 'la la-times',
            center: true
        }, () => {
            this._accountingRepo.cancelReceipt(receipt.id)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success('Cancel Receipt Success!');
                            this.requestLoadListCustomerPayment();
                        } else {
                            this._toastService.warning(res.message);
                        }
                    },
                );
        })
    }

    getCPs() {
        // this.page = 1;
        this._store.select(customerPaymentReceipListState)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new ReceiptModel(item)) : [],
                        totalItems: data.totalItems,
                    };
                }),
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe(
                (res: any) => {
                    this.CPs = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
    }

    sortCPsList(sortField: string, order: boolean) {
        this.CPs = this._sortService.sort(this.CPs, sortField, order);
    }

    onConfirmDeleteCP() {
        this._accountingRepo
            .deleteCusPayment(this.selectedCPs.id)
            .subscribe((res: any) => {
                this._toastService.success(res.message);
                // * search cps when success.

                this.requestLoadListCustomerPayment();
            });
    }

    sortLocal(sort: string): void {
        this.CPs = this._sortService.sort(this.CPs, sort, this.order);
    }

    onSelectTab(tabName: PAYMENT_TAB | string) {
        switch (tabName) {
            case 'AR':
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`]);
                break;
            case 'HISTORY':
                this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/history-payment`]);
                break;

            default:
                break;
        }
        this.selectedTab = tabName;
    }

    gotoCreateReceipt(type: string) {
        this._store.dispatch(ResetInvoiceList());
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${type.toLowerCase()}/new`]);
    }

    requestLoadListCustomerPayment() {
        this._store.dispatch(LoadListCustomerPayment({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    showQuickUpdatePopup(type: string) {
        this.selectedUpdateKey = type;
        if (!!this.selectedReceipt) {
            this.quickUpdatePopup.setValueForm('paymentRefNo', this.selectedReceipt['paymentRefNo']);
            this.quickUpdatePopup.setValueForm('paymentMethod', this.selectedReceipt['paymentMethod']);
            this.quickUpdatePopup.setValueForm('obhpartnerId', this.selectedReceipt['obhpartnerId']);
            this.quickUpdatePopup.setValueForm('bankAccountNo', this.selectedReceipt['bankAccountNo']);
            this.quickUpdatePopup.setValueForm('paymentDate', !!this.selectedReceipt.paymentDate ? { startDate: new Date(this.selectedReceipt.paymentDate), endDate: new Date(this.selectedReceipt.paymentDate) } : null);
            this.quickUpdatePopup.receipt = Object.assign({}, this.selectedReceipt);
            this.quickUpdatePopup.show();

        }
    }

    onSelectReceipt(receipt: ReceiptModel) {
        this.selectedReceipt = receipt;

        const qContextMenuList = this.queryListMenuContext.toArray();
        if (!!qContextMenuList.length) {
            qContextMenuList.forEach((c: ContextMenuDirective) => c.close());
        }
    }

    onUpdateReceiptSuccess(data: { id: string, type: string, data: IModelQuickUpdateReceipt }) {
        if (data.id) {
            const receiptItem: ReceiptModel = this.CPs.find(x => x.id == data.id);
            if (!!receiptItem) {
                receiptItem[data.type] = data.data[data.type];
            }
        }
    }

    confirmSyncReceipt() {
        const currentReceipt = Object.assign({}, this.selectedReceipt);

        const confirmMessage = `Are you sure you want to send ${this.selectedReceipt.paymentRefNo} to accountant system?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Sync To Accountant System',
            body: confirmMessage,
            iconConfirm: 'la la-cloud-upload',
            labelConfirm: 'Yes',
            center: true
        }, () => {
            this.sendReceiptToAccountant(currentReceipt);
        });
    }

    sendReceiptToAccountant(receipt: ReceiptModel) {
        const receiptSyncIds: AccountingInterface.IRequestString[] = [];
        const receiptSyncId: AccountingInterface.IRequestString = {
            id: receipt.id,
            action: receipt.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
        };
        receiptSyncIds.push(receiptSyncId);

        this._accountingRepo.syncReceiptToAccountant(receiptSyncIds)
            .pipe(
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success(`Send ${receipt.paymentRefNo} to Accountant System Successful`);
                        this.requestLoadListCustomerPayment();

                    } else {
                        this._toastService.error("Send Data Fail");
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    exportAdvanceReceipt() {
        if (!this.dataSearch || !this.selectedReceipt) {
            this._toastService.warning('No Data To View, Please Select Partner and Apply');
            return;
        }
        const body: ICriteriaReceiptAdvance = {
            customerId: this.selectedReceipt.customerId,
            status: "Done",
            dateFrom: this.dataSearch.dateFrom,
            dateTo: this.dataSearch.dateTo,
            dateType: this.dataSearch.dateType,

        };
        this._spinner.show();
        this._exportRepo.exportAdvanceReceipt(body)
            .subscribe(
                (res: HttpResponse<any>) => {
                    if (res.body) {
                        const fileName = res.headers.get(SystemConstants.EFMS_FILE_NAME);
                        console.log(fileName);
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, fileName);
                        return;
                    }
                    this._toastService.warning('No Data To View');
                },
                () => { },
                () => {
                    this._spinner.hide();
                }
            );
    }

    confirmCopyReceipt() {
        if (!this.selectedReceipt || this.selectedReceipt?.status === 'Draft') {
            return;
        }
        const currentReceipt = Object.assign({}, this.selectedReceipt);

        const confirmMessage = `Are you sure you want to copy ${this.selectedReceipt.paymentRefNo} turn into new receipt?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Copy receipt',
            body: confirmMessage,
            iconConfirm: 'la la-copy',
            labelConfirm: 'Yes',
            center: true
        }, () => {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${currentReceipt?.type.toLowerCase()}/new`], { queryParams: { id: currentReceipt.id, action: `copy-${currentReceipt.status.toLowerCase()}` } });
        });
    }

    confirmCreateClearDebit() {
        if (!this.selectedReceipt) {
            return;
        }
        const currentReceipt = Object.assign({}, this.selectedReceipt);

        const confirmMessage = `Are you sure you want to create Receipt Clear Debit for <span class="text-primary font-weight-bold">${this.selectedReceipt.customerName} </span>?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainer.viewContainerRef, {
            title: 'Create Receipt Clear Debit',
            body: confirmMessage,
            iconConfirm: 'la la-save',
            labelConfirm: 'Yes',
        }, () => {
            this._store.dispatch(ResetInvoiceList());
            this._store.dispatch(RegistTypeReceipt({ data: currentReceipt.type.toUpperCase() }));
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/receipt/${currentReceipt.type.toLowerCase()}/new`], { queryParams: { id: currentReceipt.id, action: 'debit' } });

        });
    }

}

