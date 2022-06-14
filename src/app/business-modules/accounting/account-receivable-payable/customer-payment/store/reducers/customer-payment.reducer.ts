import { createReducer, on, Action } from "@ngrx/store";
import { ReceiptInvoiceModel, Receipt } from "@models";
import * as ReceiptActions from "../actions";
import { IAgreementReceipt } from "../../components/form-create-receipt/form-create-receipt.component";
import { AccountingConstants } from "@constants";


export interface IReceiptState {
    list: { data: Receipt[], totalItems: number };
    debitList: ReceiptInvoiceModel[],
    creditList: ReceiptInvoiceModel[],
    isLoading: boolean;
    isLoaded: boolean;
    type: string; // ? CUSTOMER/AGENCY
    partnerId: string;
    date: any; // * Ngày tím kiếm -> Điều kiện search
    agreement: Partial<IAgreementReceipt>;
    dataSearch: any;
    pagingData: any;
    isAutoConvertPaid: boolean;
    currency: string;
    class: string; // ? REceipt Type
    exchangeRate: number;
}


export const initialState: IReceiptState = {
    list: { data: [], totalItems: 0, },
    debitList: [],
    creditList: [],
    isLoaded: false,
    isLoading: false,
    partnerId: null,
    type: "CUSTOMER",
    date: null,
    agreement: {},
    dataSearch: null,
    pagingData: { page: 1, pageSize: 30 },
    isAutoConvertPaid: true,
    currency: 'VND',
    class: AccountingConstants.RECEIPT_CLASS.CLEAR_DEBIT,
    exchangeRate: 1
};

export const receiptManagementReducer = createReducer(
    initialState,
    on(ReceiptActions.InitInvoiceList, (state: IReceiptState) => ({
        ...state
    })),
    on(ReceiptActions.GetInvoiceList, (state: IReceiptState) => ({ ...state, isLoading: true })),
    on(ReceiptActions.GetInvoiceListSuccess, (state: IReceiptState, payload: any) => ({
        ...state,
        isLoading: false,
        creditList: [...payload.invoices.filter(x => x.paymentType === 'CREDIT'), ...state.creditList],
        debitList: [...payload.invoices.filter(x => x.paymentType === 'DEBIT' || x.paymentType === 'OBH' || x.paymentType === 'OTHER'), ...state.debitList]
    })),
    on(ReceiptActions.RegistTypeReceipt, (state: IReceiptState, payload: any) => ({
        ...state,
        type: payload.data,
        partnerId: !!payload.partnerId ? payload.partnerId : null
    })),
    on(ReceiptActions.ResetInvoiceList, (state: IReceiptState) => ({ ...state, isLoading: true, creditList: [], debitList: [], agreement: {} })),
    on(ReceiptActions.InsertAdvance, (state: IReceiptState, payload: any) => ({
        ...state,
        debitList: [...state.debitList, payload.data]
    })),
    on(ReceiptActions.RemoveInvoice, (state: IReceiptState, payload: any) => ({
        ...state, debitList: [...state.debitList.slice(0, payload.index), ...state.debitList.slice(payload.index + 1)]
    })),
    on(ReceiptActions.RemoveCredit, (state: IReceiptState, payload: { index: number }) => {
        const currentCredit: ReceiptInvoiceModel = state.creditList[payload.index];
        if (!!currentCredit.invoiceNo) {
            const newDebitList: ReceiptInvoiceModel[] = [...state.debitList];

            for (let index = 0; index < newDebitList.length; index++) {
                const element = newDebitList[index];
                if ((element.creditNos || []).includes(currentCredit.refNo)) {
                    const indexCreditDelete: number = element.creditNos.findIndex(c => c === currentCredit.refNo);
                    if (indexCreditDelete !== -1) {
                        element.creditNos.splice(indexCreditDelete, 1);
                        element.paidAmountVnd = +(element.totalPaidVnd += currentCredit.paidAmountVnd).toFixed(0);
                        element.paidAmountUsd = +(element.totalPaidUsd += currentCredit.paidAmountUsd).toFixed(2);
                    }
                }
            }

            return { ...state, creditList: [...state.creditList.slice(0, payload.index), ...state.creditList.slice(payload.index + 1)], debitList: [...newDebitList] };
        }

        return { ...state, creditList: [...state.creditList.slice(0, payload.index), ...state.creditList.slice(payload.index + 1)] };
    }),
    on(ReceiptActions.ProcessClearSuccess, (state: IReceiptState, payload: any) => {
        if (state.currency === 'VND') {
            if (payload.data.cusAdvanceAmountVnd > 0) {
                return {
                    ...state, debitList: [...payload.data.invoices, {
                        type: 'ADV',
                        paidAmountVnd: payload.data.cusAdvanceAmountVnd,
                        paidAmountUsd: payload.data.cusAdvanceAmountUsd,
                        unpaidAmountUsd: 0,
                        unpaidAmountVnd: 0,
                        totalPaidVnd: 0,
                        totalPaidUsd: 0,
                        paymentType: 'OTHER',
                        refNo: null,
                        currencyId: 'VND'
                    }]
                };
            }
        } else if (payload.data.cusAdvanceAmountUsd > 0) {
            return {
                ...state, debitList: [...payload.data.invoices, {
                    type: 'ADV',
                    paidAmountVnd: payload.data.cusAdvanceAmountVnd,
                    paidAmountUsd: payload.data.cusAdvanceAmountUsd,
                    unpaidAmountUsd: 0,
                    unpaidAmountVnd: 0,
                    totalPaidVnd: 0,
                    totalPaidUsd: 0,
                    paymentType: 'OTHER',
                    refNo: null,
                    currencyId: 'USD'
                }]
            };
        }

        return { ...state, debitList: [...payload.data.invoices] }
    }),
    on(ReceiptActions.SelectPartnerReceipt, (state: IReceiptState, payload: { id: string, partnerGroup: string }) => ({
        ...state, partnerId: payload.id, type: payload.partnerGroup
    })),
    on(ReceiptActions.SelectReceiptDate, (state: IReceiptState, payload: { date: any }) => ({
        ...state, date: payload.date
    })),
    on(ReceiptActions.SelectReceiptAgreement, (state: IReceiptState, payload: { [key: string]: any }) => ({
        ...state, agreement: { ...payload }
    })),
    on(ReceiptActions.SearchListCustomerPayment, (state: IReceiptState, payload: any) => ({
        ...state, dataSearch: payload, pagingData: { page: 1, pageSize: 30 }
    })),
    on(ReceiptActions.LoadListCustomerPayment, (state: IReceiptState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(ReceiptActions.LoadListCustomerPaymentSuccess, (state: IReceiptState, payload: CommonInterface.IResponsePaging) => ({
        ...state, list: payload, isLoading: false, isLoaded: true
    })),
    on(ReceiptActions.LoadListCustomerPaymentFail, (state: IReceiptState) => ({
        ...state, isLoading: false, isLoaded: true
    })),
    on(ReceiptActions.ToggleAutoConvertPaid, (state: IReceiptState, payload: { isAutoConvert: boolean }) => ({
        ...state, isAutoConvertPaid: payload.isAutoConvert
    })),
    on(ReceiptActions.SelectReceiptCurrency, (state: IReceiptState, payload: { currency: string }) => ({
        ...state, currency: payload.currency
    })),
    on(ReceiptActions.SelectReceiptClass, (state: IReceiptState, payload: { class: string }) => ({
        ...state, class: payload.class
    })),
    on(ReceiptActions.ChangeADVType, (state: IReceiptState, payload: { index: number, newType: string }) => {
        const newArrayDebit = [...state.debitList];
        newArrayDebit[payload.index].type = payload.newType;

        return { ...state, debitList: newArrayDebit }
    }),
    on(ReceiptActions.InsertCreditToDebit, (state: IReceiptState, payload: ReceiptActions.ISelectCreditToDebit) => {
        const newArrayDebit: ReceiptInvoiceModel[] = [...state.debitList];
        const currentDebitItem = newArrayDebit[payload.index];

        currentDebitItem.creditNos = [...currentDebitItem.creditNos, payload.creditNo];
        currentDebitItem.paidAmountUsd = payload.paidAmountUsd;
        currentDebitItem.paidAmountVnd = payload.paidAmountVnd;
        currentDebitItem.totalPaidUsd = payload.totalPaidUsd;
        currentDebitItem.totalPaidVnd = payload.totalPaidVnd;

        payload.creditAmountVnd = (+payload.creditAmountVnd);
        payload.creditAmountUsd = (+payload.creditAmountUsd)

        // * if NetOff has default value
        if (currentDebitItem.netOff === true) {
            currentDebitItem.paidAmountVnd = currentDebitItem.totalPaidVnd = +(payload.creditAmountVnd).toFixed(0);
            currentDebitItem.paidAmountUsd = currentDebitItem.totalPaidUsd = +(payload.creditAmountUsd).toFixed(2);
        } else {
            currentDebitItem.paidAmountVnd = +(payload.paidAmountVnd - payload.creditAmountVnd).toFixed(0);
            currentDebitItem.paidAmountUsd = +(payload.paidAmountUsd - payload.creditAmountUsd).toFixed(2);

            currentDebitItem.totalPaidVnd = +((currentDebitItem.paidAmountVnd + payload.creditAmountVnd).toFixed(0));
            currentDebitItem.totalPaidUsd = +(currentDebitItem.paidAmountUsd + payload.creditAmountUsd).toFixed(2);
        }

        // * Update value for creditItem Correcsponding
        const newArrayCredit: ReceiptInvoiceModel[] = [...state.creditList];
        const indexCreditToUpdate: number = newArrayCredit.findIndex(x => x.refNo === payload.creditNo);
        if (indexCreditToUpdate != -1) {
            newArrayCredit[indexCreditToUpdate].invoiceNo = newArrayDebit[payload.index].invoiceNo;
        }

        return { ...state, debitList: newArrayDebit, creditList: newArrayCredit }
    }),
    on(ReceiptActions.UpdateCreditItemValue, (state: IReceiptState, payload: { searchKey: string, searchValue: string, key: string, value: string }) => {
        const newArrayCredit: ReceiptInvoiceModel[] = [...state.creditList];

        const indexCreditItemToUpdate: number = newArrayCredit.findIndex(x => x[payload.searchKey] === payload.searchValue);
        if (indexCreditItemToUpdate !== -1) {
            newArrayCredit[indexCreditItemToUpdate][payload.key] = payload.value;
        }

        return { ...state, creditList: [...newArrayCredit] }
    }),
    on(ReceiptActions.UpdateReceiptExchangeRate, (state: IReceiptState, payload: { exchangeRate: number }) => ({
        ...state, exchangeRate: payload.exchangeRate
    })),
    on(ReceiptActions.DeleteCreditInDebit, (state: IReceiptState, payload: ReceiptActions.ISelectCreditToDebit) => {
        const newDebitList: ReceiptInvoiceModel[] = [...state.debitList];
        const currentdebit: ReceiptInvoiceModel = newDebitList[payload.index];

        const currentCreditToDelete = state.creditList.find(x => x.refNo === payload.creditNo);
        if (!!currentCreditToDelete && !currentdebit.netOff) {
            currentdebit.paidAmountUsd = +(payload.paidAmountUsd + currentCreditToDelete.paidAmountUsd).toFixed(2);
            currentdebit.paidAmountVnd = +(payload.paidAmountVnd + currentCreditToDelete.paidAmountVnd).toFixed(0);
            if (currentdebit.creditNos.length === 0) {
                currentdebit.totalPaidUsd = currentdebit.paidAmountUsd;
                currentdebit.totalPaidVnd = currentdebit.paidAmountVnd;
            } else {
                currentdebit.totalPaidUsd = +(payload.totalPaidUsd - currentCreditToDelete.paidAmountUsd).toFixed(2);
                currentdebit.totalPaidVnd = +(payload.totalPaidVnd - currentCreditToDelete.paidAmountVnd).toFixed(0);
            }
        }
        return { ...state, debitList: [...newDebitList] }
    })
);

export function receiptReducer(state: IReceiptState | undefined, action: Action) {
    return receiptManagementReducer(state, action);
}


