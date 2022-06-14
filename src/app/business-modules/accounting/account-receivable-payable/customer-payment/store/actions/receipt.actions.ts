import { createAction, props } from "@ngrx/store";
import { ReceiptInvoiceModel, Receipt } from "@models";
import { IAcctReceiptCriteria } from "../../components/form-search/form-search-customer-payment.component";

export enum ReceiptActionTypes {
    INIT_INVOICE = '[AR Receipt] Init Invoice List',
    GET_INVOICE = '[AR Receipt] Get Invoice',
    GET_INVOICE_SUCCESS = '[AR Receipt] Get Invoice Success',
    REGIST_TYPE_RECEIPT = '[AR Receipt] Get Type Receipt',
    GET_INVOICE_FAIL = '[AR Receipt] Get Invoice Fail',
    GET_DEBIT_INVOICE = '[AR Receipt] Get Debit Invoice',
    RESET_INVOICE = '[AR Receipt] Reset Invoice List',

    PROCESS_CLEAR_INVOICE = '[AR Receipt] Process Clear Invoice Invoice',
    REMOVE_INVOICE = '[AR Receipt] Remove Invoice',
    REMOVE_CREDIT = '[AR Receipt] Remove Credit',
    INSERT_ADVANCE = '[AR Receipt] Insert Advance',
    SELECT_PARTNER_RECEIPT = '[AR Receipt] Select Partner',
    SELECT_DATE_RECEIPT = '[AR Receipt] Select Date Receipt',
    SELECT_AGREEMENT = '[AR Receipt] select Agreement',
    TOGGLE_AUTO_CONVERT_PAID = '[AR Receipt] Toggle Auto Convert Paid',
    SELECT_CURRENCY = '[AR Receipt] Select Receipt Currency',
    SELECT_CLASS = '[AR Receipt] Select Receipt Class',
    CHANGE_ADV_TYPE = '[AR Receipt] Change ADV Type',
    INSERT_CREDIT_TO_DEBIT = '[AR Receipt] Insert Credit To Debit',
    UPDATE_CREDIT_ITEM_VALUE = '[AR Receipt] Update Credit Item Value',
    UPDATE_EXCHANGE_RATE = '[AR Receipt] Update Exchange Rate',
    DELETE_CREDIT_IN_DEBIT_ITEM = '[AR Receipt] Delete Credit In Debit Item',
    ADD_DEBIT_CREDIT_TO_RECEIPT = '[AR Receipt] Add debit Credit To Receipt',

    INSERT_DATA_SEARCH_CUSTOMER_PAYMENT = '[AR Receipt] Insert data search',
    LOAD_LIST = '[AR Receipt] Load List',
    LOAD_LIST_SUCCESS = '[AR Receipt] Load List Success',
    LOAD_LIST_FAIL = '[AR Receipt] Load List Fail'
    // TODO another action receipt.
}

export const InitInvoiceList = createAction(ReceiptActionTypes.INIT_INVOICE);
export const GetInvoiceList = createAction(ReceiptActionTypes.GET_INVOICE);
export const GetInvoiceListSuccess = createAction(ReceiptActionTypes.GET_INVOICE_SUCCESS, props<{ invoices: ReceiptInvoiceModel[] }>());
export const RegistTypeReceipt = createAction(ReceiptActionTypes.REGIST_TYPE_RECEIPT, props<{ data: string, partnerId?: string }>())
export const GetInvoiceListFail = createAction(ReceiptActionTypes.GET_INVOICE_FAIL);
export const ResetInvoiceList = createAction(ReceiptActionTypes.RESET_INVOICE);

export const ProcessClearSuccess = createAction(ReceiptActionTypes.PROCESS_CLEAR_INVOICE, props<{ data: ProcessClearInvoiceModel }>())
export const RemoveInvoice = createAction(ReceiptActionTypes.REMOVE_INVOICE, props<{ index: number }>())
export const RemoveCredit = createAction(ReceiptActionTypes.REMOVE_CREDIT, props<{ index: number }>())
export const InsertAdvance = createAction(ReceiptActionTypes.INSERT_ADVANCE, props<{ data: ReceiptInvoiceModel }>());

export const SelectPartnerReceipt = createAction(ReceiptActionTypes.SELECT_PARTNER_RECEIPT, props<{ id: string, partnerGroup: string }>());
export const SelectReceiptDate = createAction(ReceiptActionTypes.SELECT_DATE_RECEIPT, props<{ date: any }>());
export const SelectReceiptAgreement = createAction(ReceiptActionTypes.SELECT_AGREEMENT, props<{ [key: string]: any; }>());
export const ToggleAutoConvertPaid = createAction(ReceiptActionTypes.TOGGLE_AUTO_CONVERT_PAID, props<{ isAutoConvert: boolean }>());
export const SelectReceiptCurrency = createAction(ReceiptActionTypes.SELECT_CURRENCY, props<{ currency: string }>());
export const SelectReceiptClass = createAction(ReceiptActionTypes.SELECT_CLASS, props<{ class: string }>());
export const ChangeADVType = createAction(ReceiptActionTypes.CHANGE_ADV_TYPE, props<{ index: number, newType: string }>());
export const InsertCreditToDebit = createAction(ReceiptActionTypes.INSERT_CREDIT_TO_DEBIT, props<ISelectCreditToDebit>());
export const UpdateCreditItemValue = createAction(ReceiptActionTypes.UPDATE_CREDIT_ITEM_VALUE, props<{ searchKey: string, searchValue: string, key: string, value: string }>());
export const UpdateReceiptExchangeRate = createAction(ReceiptActionTypes.UPDATE_EXCHANGE_RATE, props<{ exchangeRate: number }>());
export const DeleteCreditInDebit = createAction(ReceiptActionTypes.DELETE_CREDIT_IN_DEBIT_ITEM, props<ISelectCreditToDebit>());
export const AddDebitCreditToReceipt = createAction(ReceiptActionTypes.ADD_DEBIT_CREDIT_TO_RECEIPT, props<{ data: ReceiptInvoiceModel[] }>());

export const SearchListCustomerPayment = createAction(ReceiptActionTypes.INSERT_DATA_SEARCH_CUSTOMER_PAYMENT, props<Partial<IAcctReceiptCriteria>>());
export const LoadListCustomerPayment = createAction(ReceiptActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListCustomerPaymentSuccess = createAction(ReceiptActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());
export const LoadListCustomerPaymentFail = createAction(ReceiptActionTypes.LOAD_LIST_FAIL);

export interface ProcessClearInvoiceModel {
    invoices: ReceiptInvoiceModel[],
    cusAdvanceAmountVnd: number,
    cusAdvanceAmountUsd: number,
}

export interface ISelectCreditToDebit {
    index: number
    // creditNo: string;
    // creditAmountVnd: number;
    // creditAmountUsd: number;
    [key: string]: any
}