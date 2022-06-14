import { Component, Output, EventEmitter } from '@angular/core';
import { PopupBase } from '@app';
import { ReceiptInvoiceModel } from '@models';
import { AccountingRepo } from '@repositories';
import { catchError, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';
import { GetInvoiceListSuccess, ResetInvoiceList, AddDebitCreditToReceipt } from '../../store/actions';
import { ToastrService } from 'ngx-toastr';
import { ReceiptCreditListState, ReceiptDebitListState, ReceiptTypeState, ReceiptPartnerCurrentState } from '../../store/reducers';
import { SortService } from '@services';
import { AgencyReceiptModel } from 'src/app/shared/models/accouting/agency-receipt.model';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';

@Component({
    selector: 'customer-agent-debit-popup',
    templateUrl: 'customer-agent-debit.popup.html',
})

export class ARCustomerPaymentCustomerAgentDebitPopupComponent extends PopupBase {
    @Output() onAddToReceipt: EventEmitter<any> = new EventEmitter<any>();

    type: string = null;

    listDebit: ReceiptInvoiceModel[] = [];
    listCreditInvoice: ReceiptInvoiceModel[] = [];
    listDebitInvoice: ReceiptInvoiceModel[] = [];

    headersAgency: CommonInterface.IHeaderTable[] = [
        { title: 'Reference No', field: 'referenceNo', sortable: true },
        { title: 'VoucherId', field: 'voucherId', sortable: true },
        { title: 'Type', field: 'type', sortable: true },
        { title: 'Invoice No', field: 'invoiceNo', sortable: true },
        { title: 'JOB', field: 'jobNo', sortable: true, width: 150 },
        { title: 'HBL', field: 'hbl', sortable: true, width: 150 },
        { title: 'MBL', field: 'mbl', sortable: true, width: 150 },
        { title: 'Unpaid VND', field: 'unpaidAmountVnd', sortable: true, width: 150 },
        { title: 'Unpaid USD', field: 'unpaidAmountUsd', sortable: true, width: 150 },
        { title: 'PartnerId', field: 'taxCode', sortable: true },
        { title: 'Partner Name', field: 'partnerName', sortable: true },
        { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
        { title: 'Payment Term', field: 'paymentTerm', sortable: true },
        { title: 'Due Date', field: 'dueDate', sortable: true },
        { title: 'Bu Handle', field: 'departmentName', sortable: true },
        { title: 'Office', field: 'officeName', sortable: true },
    ];

    agencyDebitModel: AgencyReceiptModel = new AgencyReceiptModel();
    checkAllAgency = false;
    isCheckAllAgent: boolean = false;
    TYPELIST: string = 'LIST';
    partnerId: string;

    sumTotalObj: ITotalObject = {
        totalDebitVnd: 0,
        totalDebitUsd: 0,
        totalDebitOBHVnd: 0,
        totalDebitOBHUsd: 0,
        totalCreditVnd: 0,
        totalCreditUsd: 0,
        totalBalanceVnd: 0,
        totalBalanceUsd: 0,
    };
    sumTotalObjectPaymentReceipt: ITotalObject = {
        totalDebitVnd: 0,
        totalDebitUsd: 0,
        totalDebitOBHVnd: 0,
        totalDebitOBHUsd: 0,
        totalCreditVnd: 0,
        totalCreditUsd: 0,
        totalBalanceVnd: 0,
        totalBalanceUsd: 0,
    };
    currentPaymentReceiptCurrent: ReceiptInvoiceModel[] = [];

    constructor(
        private readonly _sortService: SortService,
        private readonly _accountingRepo: AccountingRepo,
        private readonly _store: Store<IAppState>,
        private readonly _toastService: ToastrService,
    ) {
        super();
        this.requestSort = this.sortDebit;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Reference No', field: 'referenceNo', sortable: true },
            { title: 'VoucherId', field: 'voucherId', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Unpaid VND', field: 'unpaidAmountVnd', sortable: true, width: 150 },
            { title: 'Unpaid USD', field: 'unpaidAmountUsd', sortable: true, width: 150 },
            { title: 'Tax Code', field: 'taxCode', sortable: true },
            { title: 'Partner Name', field: 'partnerName', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Payment Term', field: 'paymentTerm', sortable: true },
            { title: 'Due Date', field: 'dueDate', sortable: true },
            { title: 'Bu Handle', field: 'departmentName', sortable: true },
            { title: 'Office', field: 'officeName', sortable: true },
        ];

        this._store.select(ReceiptTypeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((type: string) => {
                const typeArr = (type || '').split(";").filter(x => Boolean(x)).map(x => x.trim());
                if (typeArr.length === 1 && (typeArr.includes("CUSTOMER") || typeArr.includes("AGENT"))) {
                    this.type = type;
                } else {
                    this.type = typeArr[0];
                }
            })

        this._store.select(ReceiptPartnerCurrentState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (id) => {
                    this.sumTotalObj = this.resetTotalObj(this.sumTotalObj);
                    this.sumTotalObjectPaymentReceipt = this.resetTotalObj(this.sumTotalObjectPaymentReceipt);
                    this.partnerId = id;
                }
            )

        combineLatest([
            this._store.select(ReceiptDebitListState),
            this._store.select(ReceiptCreditListState)])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
                this.currentPaymentReceiptCurrent.length = 0;
                x.forEach((element: ReceiptInvoiceModel[]) => {
                    this.currentPaymentReceiptCurrent.push(...element);
                });
                this.currentPaymentReceiptCurrent = this.currentPaymentReceiptCurrent.filter(x => x.paymentType !== 'OTHER');
                if (!!this.currentPaymentReceiptCurrent.length) {
                    this.sumTotalObjectPaymentReceipt = this.calculateSumDataObject(this.currentPaymentReceiptCurrent);
                }
            })
    }

    onChangeCheckAll(type: string) {
        switch (type) {
            case 'CUSTOMER':
                if (this.isCheckAll) {
                    this.listDebit.forEach(x => {
                        x.isSelected = true;
                    });
                } else {
                    this.listDebit.forEach(x => {
                        x.isSelected = false;
                    });
                }
                break;
            case 'AGENT':
                if (this.isCheckAllAgent) {
                    this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
                        x.isSelected = true;
                        for (let i = 0; i < x.invoices.length; i++) {
                            x.invoices[i].isSelected = true;
                        }
                    })
                    return;
                }
                this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
                    x.isSelected = false;
                    for (let i = 0; i < x.invoices.length; i++) {
                        x.invoices[i].isSelected = false;
                    }
                })
                break;
            default:
                break;
        }
    }

    onChangeItemCheck(type: string, view?: string, groupShipment?: any) {
        switch (type) {
            case 'CUSTOMER':
                this.isCheckAll = this.listDebit.every(x => x.isSelected);
                break;
            case 'AGENT':
                if (view === 'LIST') {
                    const items = [];
                    for (let index = 0; index < groupShipment.length; index++) {
                        const element = groupShipment[index];
                        items.push(...element.invoices);
                    }
                    this.isCheckAllAgent = items.every(x => x.isSelected);
                } else {
                    groupShipment.isSelected = groupShipment.invoices.every(x => x.isSelected);
                    this.isCheckAllAgent = this.agencyDebitModel.groupShipmentsAgency.every(x => x.isSelected);
                }
                break;
            default:
                break;
        }
    }

    onChecItemInGroupAgent(groupShipment: IDataGroupShipmentAgency) {
        groupShipment.invoices.forEach(x => {
            if (groupShipment.isSelected) {
                x.isSelected = true;
            }
            else {
                x.isSelected = false;
            }
        })
        this.isCheckAllAgent = this.agencyDebitModel.groupShipmentsAgency.every(x => x.isSelected);
    }

    onApply(body) {
        if (this.type.includes("CUSTOMER")) {
            this._accountingRepo.getDataIssueCustomerPayment(body)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: ReceiptInvoiceModel[]) => {
                        if (!!res) {
                            this.listDebit = res || [];
                            this.sumTotalObj = this.calculateSumDataObject(this.listDebit);
                            this.filterList();
                        }
                    },
                );
        } else {
            this._accountingRepo.getDataIssueAgencyPayment(body)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: AgencyReceiptModel) => {
                        if (!!res) {
                            this.agencyDebitModel = res;
                            const invoiceToCalculate: ReceiptInvoiceModel[] = [];
                            this.agencyDebitModel.groupShipmentsAgency.forEach((element: IDataGroupShipmentAgency) => {
                                element.isSelected = false;
                                element.invoices.forEach(x => {
                                    x.isSelected = false;
                                });
                                invoiceToCalculate.push(...element.invoices);
                            });
                            if (!!invoiceToCalculate.length) {
                                this.sumTotalObj = this.calculateSumDataObject(invoiceToCalculate);
                            }

                            this.filterList();
                        }
                    },
                );
        }
    }

    private filterListCredit() {
        this._store.select(ReceiptCreditListState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((result: ReceiptInvoiceModel[]) => {
                if (!!result.length) {
                    this.listCreditInvoice = result || [];
                    this.listDebit = this.listDebit.filter(s =>
                        result.filter(x => x.refNo === s.refNo && x.type == s.type).length == 0
                    );
                    this.sumTotalObj = this.calculateSumDataObject(this.listDebit);

                    if (this.type === "AGENT") {
                        this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
                            x.invoices.forEach(invoice => {
                                for (let i = 0; i < result.length; i++) {

                                    if (result[i].isSelected === true && invoice.refNo === result[i].refNo && invoice.jobNo === result[i].jobNo && invoice.mbl === result[i].mbl && invoice.hbl === result[i].hbl) {
                                        invoice.isSelected = true;
                                    }
                                    if ((invoice.refNo === result[i].refNo && invoice.jobNo === result[i].jobNo && invoice.mbl === result[i].mbl && invoice.hbl === result[i].hbl) || invoice.refNo === result[i].refNo) {
                                        const index = x.invoices.indexOf(invoice);
                                        x.invoices.splice(index, 1);
                                    }
                                    if (invoice.isSelected === true && this.checkAllAgency) {
                                        const index = x.invoices.indexOf(invoice);
                                        x.invoices.splice(index, 1);
                                    }
                                }
                            });
                        });
                        this.agencyDebitModel.groupShipmentsAgency = this.agencyDebitModel.groupShipmentsAgency.filter(x => x.invoices.length > 0);
                        const items: ReceiptInvoiceModel[] = [];
                        for (let index = 0; index < this.agencyDebitModel.groupShipmentsAgency.length; index++) {
                            const element: IDataGroupShipmentAgency = this.agencyDebitModel.groupShipmentsAgency[index];
                            items.push(...element.invoices);
                        }

                        if (!!items.length) {
                            this.sumTotalObj = this.calculateSumDataObject(items);
                        }
                    }
                }
            });
    }

    private filterListDebit() {
        this._store.select(ReceiptDebitListState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((result: ReceiptInvoiceModel[]) => {
                if (!!result.length) {
                    this.listDebitInvoice = result || [];
                    this.listDebit = this.listDebit.filter(s =>
                        result.filter(x => x.refNo === s.refNo && x.type == s.type).length == 0
                    );
                    this.sumTotalObj = this.calculateSumDataObject(this.listDebit);

                    if (this.type === "AGENT") {
                        this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
                            x.invoices.forEach(invoice => {
                                result.forEach(t => {
                                    if (t.isSelected === true && invoice.refNo === t.refNo && invoice.jobNo === t.jobNo && invoice.mbl === t.mbl && invoice.hbl === t.hbl) {
                                        invoice.isSelected = true;
                                    }
                                    if ((invoice.refNo === t.refNo && invoice.jobNo === t.jobNo && invoice.mbl === t.mbl && invoice.hbl === t.hbl)) {
                                        const index = x.invoices.indexOf(invoice);
                                        x.invoices.splice(index, 1);
                                    }
                                    if (invoice.isSelected === true && this.checkAllAgency) {
                                        const index = x.invoices.indexOf(invoice);
                                        x.invoices.splice(index, 1);
                                    }
                                })
                            });
                        });

                        this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
                            if (x.isSelected) {
                                x.invoices = [];
                            }
                        })

                        this.agencyDebitModel.groupShipmentsAgency = this.agencyDebitModel.groupShipmentsAgency.filter(x => x.invoices.length > 0);

                        const items: ReceiptInvoiceModel[] = [];
                        for (let index = 0; index < this.agencyDebitModel.groupShipmentsAgency.length; index++) {
                            const element: IDataGroupShipmentAgency = this.agencyDebitModel.groupShipmentsAgency[index];
                            items.push(...element.invoices);
                        }

                        if (!!items.length) {
                            this.sumTotalObj = this.calculateSumDataObject(items);
                        }
                    }

                }
            })
    }

    filterList() {
        this.filterListCredit();
        this.filterListDebit();
    }

    getAgencyDebitGroup() {
        const arr = [];
        this.agencyDebitModel.groupShipmentsAgency.forEach(x => {
            for (let i = 0; i < x.invoices.length; i++) {
                arr.push(x.invoices[i]);
            }
        });
        return arr;
    }

    addToReceipt() {
        // const partnerId = this.partnerId.value;
        let datatoReceiptGroup = [];
        let datatoReceiptList = [];
        let datatoReceipt = this.listDebit;
        if (this.TYPELIST === 'GROUP' && this.type === 'AGENT') {
            datatoReceiptGroup = this.getAgencyDebitGroup();
            datatoReceipt = datatoReceiptGroup;
        }
        if (this.TYPELIST === 'LIST' && this.type === 'AGENT') {
            datatoReceiptList = this.getAgencyDebitGroup();
            datatoReceipt = datatoReceiptList;
        }
        datatoReceipt = datatoReceipt.filter(x => x.isSelected === true);
        if (datatoReceipt.length === 0) {
            this._toastService.warning('No data to add receipt!');
            return;
        }

        if (((this.listDebitInvoice.length > 0 && this.listDebitInvoice[0].partnerId !== this.partnerId)
            || (this.listCreditInvoice.length > 0 && this.listCreditInvoice[0].partnerId !== this.partnerId)
        )) {
            this._store.dispatch(ResetInvoiceList());
        }

        // * Set Default
        datatoReceipt.forEach(element => {
            element.paidAmountVnd = element.unpaidAmountVnd;
            element.paidAmountUsd = element.unpaidAmountUsd;
            element.totalPaidVnd = element.paidAmountVnd;
            element.totalPaidUsd = element.paidAmountUsd;
            element.creditNos = []
            element.isValid = null;
        });

        this._store.dispatch(GetInvoiceListSuccess({ invoices: datatoReceipt }));
        this._store.dispatch(AddDebitCreditToReceipt({ data: datatoReceipt }));
        this.onAddToReceipt.emit(this.partnerId);
        // this.hide();
    }

    switchToGroup() {
        if (this.TYPELIST === 'GROUP') {
            this.TYPELIST = 'LIST';
        } else {
            this.TYPELIST = 'GROUP';
        }
    }

    sortDebit(sort: string) {
        if (this.type === 'AGENT') {
            this.agencyDebitModel.groupShipmentsAgency = this._sortService.sort(this.agencyDebitModel.groupShipmentsAgency, sort, this.order);
            return;
        }
        this.listDebit = this._sortService.sort(this.listDebit, sort, this.order);
    }


    reset() {
        this.listDebit = [];
        this.agencyDebitModel = new AgencyReceiptModel();
    }

    calculateSumDataObject(model: ReceiptInvoiceModel[]): ITotalObject {
        const totalObject: ITotalObject = {
            totalDebitVnd: 0,
            totalDebitUsd: 0,
            totalDebitOBHVnd: 0,
            totalDebitOBHUsd: 0,
            totalCreditVnd: 0,
            totalCreditUsd: 0,
            totalBalanceVnd: 0,
            totalBalanceUsd: 0,
        };
        if (!model.length) {
            return totalObject;
        }
        for (let index = 0; index < model.length; index++) {
            const element = model[index];
            switch (element.paymentType) {
                case 'CREDIT':
                    totalObject.totalCreditVnd += element.unpaidAmountVnd;
                    totalObject.totalCreditUsd += element.unpaidAmountUsd;
                    break;
                case 'DEBIT':
                    totalObject.totalDebitVnd += element.unpaidAmountVnd;
                    totalObject.totalDebitUsd += element.unpaidAmountUsd;
                    break;
                case 'OBH':
                    totalObject.totalDebitOBHVnd += element.unpaidAmountVnd;
                    totalObject.totalDebitOBHUsd += element.unpaidAmountUsd;
                    break;
                default:
                    break;
            }
            totalObject.totalBalanceVnd = (totalObject.totalDebitOBHVnd + totalObject.totalDebitVnd) - totalObject.totalCreditVnd;
            totalObject.totalBalanceUsd = (totalObject.totalDebitOBHUsd + totalObject.totalDebitUsd) - totalObject.totalCreditUsd;
        }

        return totalObject;
    }

    resetTotalObj(totalObject: ITotalObject): ITotalObject {
        for (const key in totalObject) {
            totalObject[key] = 0;
        }

        return totalObject;
    }
}

interface ITotalObject {
    totalDebitVnd: number,
    totalDebitUsd: number,
    totalDebitOBHVnd: number,
    totalDebitOBHUsd: number,
    totalCreditVnd: number,
    totalCreditUsd: number,
    totalBalanceVnd: number,
    totalBalanceUsd: number,
}

interface IDataIssueAgencyPayment {
    groupShipmentsAgency: IDataGroupShipmentAgency[];
    invoices: ReceiptInvoiceModel[];
}

interface IDataGroupShipmentAgency {
    hbl: string;
    hblid: string;
    jobNo: string;
    mbl: string;
    unpaidAmountUsd: number;
    unpaidAmountVnd: number;
    invoices: ReceiptInvoiceModel[]
    isSelected?: boolean;
}


