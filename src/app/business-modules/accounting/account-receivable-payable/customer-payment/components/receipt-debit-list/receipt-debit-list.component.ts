import { OnInit, Component, ChangeDetectionStrategy, Input, ViewChild } from "@angular/core";
import { AppList } from "@app";
import { Store } from "@ngrx/store";
import { ReceiptInvoiceModel } from "@models";
import { ConfirmPopupComponent } from "@common";
import { InjectViewContainerRefDirective } from "@directives";

import { IReceiptState } from "../../store/reducers/customer-payment.reducer";
import { ReceiptDebitListState, ReceiptTypeState, ReceiptCreditListState, ReceiptIsAutoConvertPaidState, ReceiptExchangeRate, customerPaymentReceipLoadingState } from "../../store/reducers";
import { RemoveInvoice, ChangeADVType, InsertCreditToDebit, UpdateCreditItemValue, DeleteCreditInDebit } from "../../store/actions";

import { takeUntil, withLatestFrom, map } from "rxjs/operators";
import { Observable, BehaviorSubject } from "rxjs";
import { AccountingConstants } from "@constants";

@Component({
    selector: 'customer-payment-receipt-debit-list',
    templateUrl: './receipt-debit-list.component.html',
    styleUrls: ['./receipt-debit-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ARCustomerPaymentReceiptDebitListComponent extends AppList implements OnInit {
    @ViewChild(InjectViewContainerRefDirective) viewContainerInject: InjectViewContainerRefDirective;
    @Input() isReadonly: boolean = false;

    debitList$ = this._store.select(ReceiptDebitListState);
    creditList$: Observable<ReceiptInvoiceModel[]> = this._store.select(ReceiptCreditListState);

    agencyHeaders: CommonInterface.IHeaderTable[] = [
        { title: 'RefNo', field: '', sortable: true },
        { title: 'Type', field: '', width: 150 },
        { title: 'Invoice No', field: '' },
        { title: 'Unpaid USD', field: '', width: 150, align: this.right },
        { title: 'Unpaid VND', field: '', width: 150, align: this.right },
        { title: 'Paid Amount USD', field: '', width: 150, align: this.right, required: true, },
        { title: 'Paid Amount VND', field: '', width: 150, align: this.right, required: true },
        { title: 'NetOff USD', field: '', width: 150, align: this.right },
        { title: 'NetOff VND', field: '', width: 150, align: this.right },
        { title: 'Total Paid USD', field: '', width: 150, align: this.right },
        { title: 'Total Paid VND', field: '', width: 150, align: this.right },
        { title: 'NetOff Only', field: '', width: 150 },
        { title: 'Remain USD', field: '', width: 150, align: this.right },
        { title: 'Remain VND', field: '', width: 150, align: this.right },
        { title: 'Note', field: '', width: 200 },
        { title: 'BU Handle', field: '' },
        { title: 'Office', field: '' },
        { title: 'Job No', field: '', width: 150 },
        { title: 'MBL No', field: '', width: 150 },
        { title: 'HBL No', field: '', width: 150 },

    ];
    selectedIndexItem: number;
    selectedItem: ReceiptInvoiceModel;
    receiptType$: Observable<string> = this._store.select(ReceiptTypeState);

    selectedCredit: ReceiptInvoiceModel;

    isSubmitted: boolean = false;
    sumTotalObj = {
        totalUnpaidAmountUsd: 0,
        totalUnpaidAmountVnd: 0,
        totalPaidAmountVnd: 0,
        totalPaidAmountUsd: 0,
        totalPaidVnd: 0,
        totalPaidUsd: 0,
        totalRemainVnd: 0,
        totalRemainUsd: 0,
        totalNetOffVnd: 0,
        totalNetOffUsd: 0
    };

    isAutoConvert: boolean;
    receiptExchangeRate: number;

    creditHasNetOff$: BehaviorSubject<{ credits: string[] }> = new BehaviorSubject<{ credits: string[] }>({ credits: [] });



    constructor(
        private readonly _store: Store<IReceiptState>,
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'RefNo', field: '', sortable: true, width: 100 },
            { title: 'Type', field: '', width: 100 },
            { title: 'Invoice No', field: '', width: 100 },
            // { title: 'Credit No', field: '', width: 180 },
            { title: 'Unpaid USD', field: '', width: 150, align: this.right },
            { title: 'Unpaid VND', field: '', width: 150, align: this.right },
            { title: 'Paid Amount USD', field: '', width: 150, align: this.right, required: true },
            { title: 'Paid Amount VND', field: '', width: 150, align: this.right, required: true },
            { title: 'NetOff USD', field: '', width: 150, align: this.right },
            { title: 'NetOff VND', field: '', width: 150, align: this.right },
            { title: 'Total Paid USD', field: '', width: 150, align: this.right },
            { title: 'Total Paid VND', field: '', width: 150, align: this.right },
            { title: 'Remain USD', field: '', width: 150, align: this.right },
            { title: 'Remain VND', field: '', width: 150, align: this.right },
            { title: 'Note', field: '', width: 200 },
            { title: 'BU Handle', field: '' },
            { title: 'Office', field: '' },
        ];


        this.calculateSumTotalDebit();

        this._store.select(ReceiptIsAutoConvertPaidState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (isAutoConvert) => {
                    this.isAutoConvert = isAutoConvert;
                }
            )

        this._store.select(ReceiptExchangeRate)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (exchangeRate) => {
                    this.receiptExchangeRate = exchangeRate;
                }
            )

        this.isLoading = this._store.select(customerPaymentReceipLoadingState);
    }

    confirmDeleteInvoiceItem(item: ReceiptInvoiceModel, index: number) {
        this.selectedIndexItem = index;
        if (item.type === "OBH") {
            this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerInject.viewContainerRef, {
                title: 'Confirm Remove Invoice',
                body: 'Some Debit Values will change, do you want to remove you selections?',
                labelConfirm: 'Yes',
                labelCancel: 'No'
            }, () => {
                this.onDeleteInvoiceItem();
            })
        } else if (!!item.id) {
            this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerInject.viewContainerRef, {
                title: 'Confirm Remove Invoice',
                body: 'Some Debit Values will change, do you want to remove you selections?',
                labelConfirm: 'Yes',
                labelCancel: 'No'
            }, () => {
                this.onDeleteInvoiceItem();
            })
        } else {
            this.onDeleteInvoiceItem();
        }
    }

    onDeleteInvoiceItem() {
        if (this.selectedIndexItem === undefined) {
            return;
        }
        this._store.dispatch(RemoveInvoice({ index: this.selectedIndexItem }));
    }

    calculateTotalPaidAmount(item: ReceiptInvoiceModel, type: string) {
        item.isChangeValue = true; // ! Detect user changed -> Flag to Force Process Clear
        switch (type) {
            case 'paidVnd':
                if (!!this.isAutoConvert) {
                    if (item.paymentType === AccountingConstants.RECEIPT_PAYMENT_TYPE.OTHER) {
                        item.paidAmountUsd = +((+item.paidAmountVnd / this.receiptExchangeRate).toFixed(2));

                        // item.totalPaidUsd = +((+item.paidAmountVnd + (+item.netOffVnd ?? 0) / this.receiptExchangeRate).toFixed(2));
                    } else if (!!item.exchangeRateBilling) {
                        item.paidAmountUsd = +((+item.paidAmountVnd / item.exchangeRateBilling).toFixed(2));
                        // item.totalPaidUsd = +((+item.paidAmountVnd + (+item.netOffVnd ?? 0) / item.exchangeRateBilling).toFixed(2));
                    } else {
                        item.paidAmountUsd = +((+item.paidAmountVnd / this.receiptExchangeRate).toFixed(2));
                        // item.totalPaidUsd = +((+item.paidAmountVnd + (+item.netOffVnd ?? 0) / this.receiptExchangeRate).toFixed(2));
                    }
                }
                item.totalPaidVnd = ((+item.netOffVnd) ?? 0) + ((+item.paidAmountVnd) ?? 0);
                item.totalPaidUsd = ((+item.netOffUsd) ?? 0) + ((+item.paidAmountUsd) ?? 0);

                break;
            case 'paidUsd':
                if (!!this.isAutoConvert) {

                    if (item.paymentType === AccountingConstants.RECEIPT_PAYMENT_TYPE.OTHER) {
                        item.paidAmountVnd = +((+item.paidAmountUsd * this.receiptExchangeRate).toFixed(0));

                        // item.totalPaidVnd = +((+item.paidAmountUsd + (+item.netOffUsd ?? 0) * this.receiptExchangeRate).toFixed(0));
                    } else if (!!item.exchangeRateBilling) {
                        item.paidAmountVnd = +(+item.paidAmountUsd * item.exchangeRateBilling).toFixed(0);
                        // item.totalPaidVnd = +(+item.paidAmountUsd + (+item.netOffUsd ?? 0) * item.exchangeRateBilling).toFixed(0);
                    } else {
                        item.paidAmountVnd = +((+item.paidAmountUsd * this.receiptExchangeRate).toFixed(0));
                        // item.totalPaidVnd = +((+item.paidAmountUsd + (+item.netOffUsd ?? 0) * this.receiptExchangeRate).toFixed(0));
                    }
                }
                item.totalPaidUsd = ((+item.netOffUsd) ?? 0) + ((+item.paidAmountUsd) ?? 0);
                item.totalPaidVnd = ((+item.netOffVnd) ?? 0) + ((+item.paidAmountVnd) ?? 0);

                break;

            case 'netOffVnd':
                if (!!this.isAutoConvert) {
                    if (!!item.exchangeRateBilling) {
                        item.netOffUsd = +((+item.netOffVnd / item.exchangeRateBilling).toFixed(2));
                    } else {
                        item.netOffUsd = +((+item.netOffVnd / this.receiptExchangeRate).toFixed(2));
                    }
                }

                item.totalPaidVnd = ((+item.netOffVnd) ?? 0) + ((+item.paidAmountVnd) ?? 0);
                item.totalPaidUsd = ((+item.netOffUsd) ?? 0) + ((+item.paidAmountUsd) ?? 0);
                item.netOffVnd = +item.netOffVnd;

                break;
            case 'netOffUsd':
                if (!!this.isAutoConvert) {
                    if (!!item.exchangeRateBilling) {
                        item.netOffVnd = +((+item.netOffUsd * item.exchangeRateBilling).toFixed(2));
                    } else {
                        item.netOffVnd = +((+item.netOffUsd * this.receiptExchangeRate).toFixed(2));
                    }
                }
                item.totalPaidUsd = ((+item.netOffUsd) ?? 0) + ((+item.paidAmountUsd) ?? 0);
                item.totalPaidVnd = ((+item.netOffVnd) ?? 0) + ((+item.paidAmountVnd) ?? 0);
                item.netOffUsd = +item.netOffUsd;
                break;
            default:

                break;
        }
        this.calculateSumTotalDebit();
    }

    calculateSumTotalDebit() {
        this.debitList$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (debitList: ReceiptInvoiceModel[]) => {
                    if (!!debitList.length) {
                        this.sumTotalObj = this.calculateTotal(debitList);
                    }
                }
            )
    }

    calculateTotal(model: ReceiptInvoiceModel[]) {
        const totalData = {
            totalUnpaidAmountUsd: 0,
            totalUnpaidAmountVnd: 0,
            totalPaidAmountVnd: 0,
            totalPaidAmountUsd: 0,
            totalPaidVnd: 0,
            totalPaidUsd: 0,
            totalRemainVnd: 0,
            totalRemainUsd: 0,
            totalNetOffUsd: 0,
            totalNetOffVnd: 0
        };

        for (let index = 0; index < model.length; index++) {
            const item: ReceiptInvoiceModel = model[index];
            if (model[index].type !== AccountingConstants.RECEIPT_PAYMENT_TYPE.CREDIT && model[index].negative !== true) {
                totalData.totalUnpaidAmountUsd += (+(item.unpaidAmountUsd) ?? 0);
                totalData.totalUnpaidAmountVnd += (+(item.unpaidAmountVnd) ?? 0);
                totalData.totalPaidAmountUsd += (+(item.paidAmountUsd) ?? 0);
                totalData.totalPaidAmountVnd += (+(item.paidAmountVnd) ?? 0);
                totalData.totalPaidUsd += (+(item.totalPaidUsd) ?? 0);
                totalData.totalPaidVnd += (+(item.totalPaidVnd) ?? 0);
                totalData.totalNetOffUsd += (+item.netOffUsd ?? 0);
                totalData.totalNetOffVnd += (+item.netOffVnd ?? 0);

                if (model[index].paymentType !== AccountingConstants.RECEIPT_PAYMENT_TYPE.OTHER) {
                    totalData.totalRemainUsd = (+(totalData.totalUnpaidAmountUsd) ?? 0) - (+(totalData.totalPaidUsd) ?? 0);
                    totalData.totalRemainVnd = (+(totalData.totalUnpaidAmountVnd) ?? 0) - (+(totalData.totalPaidVnd) ?? 0);
                }
            }
        }
        return totalData
    }

    selectPaymentItem(index: number, item: ReceiptInvoiceModel) {
        this.selectedIndexItem = index;
        this.selectedItem = item;

    }

    changePaymentTypeADV(newADVType: string) {
        if (this.selectedIndexItem >= 0) {
            this._store.dispatch(ChangeADVType({ index: this.selectedIndexItem, newType: newADVType }));
        }
    }

    selectCreditPaymentItem(item: ReceiptInvoiceModel) {
        if (this.selectedIndexItem >= 0) {
            this._store.dispatch(InsertCreditToDebit(
                {
                    index: this.selectedIndexItem,
                    creditNo: item.refNo,
                    paidAmountVnd: this.selectedItem.paidAmountVnd,
                    paidAmountUsd: this.selectedItem.paidAmountUsd,
                    totalPaidVnd: this.selectedItem.totalPaidVnd,
                    totalPaidUsd: this.selectedItem.totalPaidUsd,
                    creditAmountVnd: item.paidAmountVnd,
                    creditAmountUsd: item.paidAmountUsd
                }
            ));
        }
    }

    deleteCreditItem(credit: string, index: number, item: ReceiptInvoiceModel, e: Event) {
        this.selectedItem = item;
        this.selectedIndexItem = index;
        e.preventDefault();
        e.stopImmediatePropagation();

        const indexCreditTodelete = (item.creditNos as string[]).findIndex(x => x === credit);

        item.creditNos = [...item.creditNos.slice(0, indexCreditTodelete), ...item.creditNos.slice(indexCreditTodelete + 1)];

        this._store.dispatch(DeleteCreditInDebit({
            index: this.selectedIndexItem,
            paidAmountVnd: this.selectedItem.paidAmountVnd,
            paidAmountUsd: this.selectedItem.paidAmountUsd,
            totalPaidVnd: this.selectedItem.totalPaidVnd,
            totalPaidUsd: this.selectedItem.totalPaidUsd,
            creditNo: credit
        }));

        this._store.dispatch(UpdateCreditItemValue({ searchKey: 'refNo', searchValue: credit, key: 'invoiceNo', value: null }));

    }

    onToggleNetOfOnly(isNetOff: boolean, item: ReceiptInvoiceModel) {
        let totalNetOffVNd: number = 0;
        let totalNetOffUsd: number = 0;
        let creditMapPriceValue: ICreditNetOffMapValue[];
        item.netOff = isNetOff;

        // if (!!item.creditNos.length) {
        //     this.creditList$
        //         .pipe(takeUntil(this.ngUnsubscribe))
        //         .subscribe((creditList: ReceiptInvoiceModel[]) => {
        //             creditMapPriceValue = creditList.map((item: ReceiptInvoiceModel) =>
        //                 ({ creditNo: item.refNo, netOffVnd: item.paidAmountVnd, netOffUsd: item.paidAmountUsd })
        //             )
        //             item.creditNos.forEach((credit: string) => {
        //                 const currentCreditMapping = creditMapPriceValue.find(x => x.creditNo == credit);
        //                 if (!!currentCreditMapping) {
        //                     totalNetOffVNd += currentCreditMapping.netOffVnd;
        //                     totalNetOffUsd += currentCreditMapping.netOffUsd;
        //                 }
        //             })

        //             if (isNetOff === true) {
        //                 item.paidAmountVnd = item.totalPaidVnd = totalNetOffVNd;
        //                 item.paidAmountUsd = item.totalPaidUsd = totalNetOffUsd;
        //             }
        //             else {
        //                 item.paidAmountVnd = item.totalPaidVnd = item.unpaidAmountVnd - totalNetOffVNd;
        //                 item.paidAmountUsd = item.totalPaidUsd = item.unpaidAmountUsd - totalNetOffUsd;
        //             }
        //             this.calculateSumTotalDebit();

        //         })
        // }
        if (!isNetOff) {
            return;
        }
        if (!!item.netOffVnd && !!item.netOffUsd) {
            item.paidAmountVnd = 0;
            item.paidAmountUsd = 0;
        } else {
            item.netOffVnd = item.paidAmountVnd;
            item.netOffUsd = item.paidAmountUsd;

            item.paidAmountVnd = item.paidAmountUsd = 0;
        }

        item.totalPaidVnd = item.paidAmountVnd + item.netOffVnd;
        item.totalPaidUsd = item.paidAmountUsd + item.netOffUsd;

        this.calculateSumTotalDebit();

    }

}

interface ICreditNetOffMapValue {
    creditNo: string;
    netOffUsd: number;
    netOffVnd: number;
}