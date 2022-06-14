import { createAction, props } from '@ngrx/store';
import { PartnerOfAcctManagementResult, ChargeOfAccountingManagementModel, AccAccountingManagementCriteria, AccAccountingManagement } from '@models';

export enum AccountingManagementActionTypes {

    INIT_PARTNER = '[Accounting Management] Init Partner',
    SELECT_PARTNER = '[Accounting Management] Select Partner',
    SELECT_REQUESTER = '[Accounting Management] Select Requester',

    UPDATE_CHARGE_LIST = '[Accounting Management] Update Charge List',
    UPDATE_EXCHANGE_RATE = '[Accounting Management] Update Exchange Rate',
    GET_AGREEMENT_INVOICE = '[Accounting Management] Get Agreement Invoice',

    SEARCH_LIST = '[Accounting Management] Search List',
    LOAD_LIST = '[Accounting Management] Load List',
    LOAD_LIST_SUCCESS = '[Accounting Management] Load Success',
    LOAD_LIST_FAIL = '[Accounting Management] Load Fail',
}

export interface ISyncExchangeRate {
    exchangeRate: number;
}

export interface IAccMngtContractInvoiceCriteria {
    partnerId: string;
    service: string;
    office: string;
}

export interface IAgreementInvoice {
    paymentTerm: number;
    contractNo: string;
    contractType: string;
}


export const SelectPartner = createAction(AccountingManagementActionTypes.SELECT_PARTNER, props<PartnerOfAcctManagementResult>());
export const InitPartner = createAction(AccountingManagementActionTypes.INIT_PARTNER);
export const SelectRequester = createAction(AccountingManagementActionTypes.SELECT_REQUESTER, props<PartnerOfAcctManagementResult>());
export const UpdateChargeList = createAction(AccountingManagementActionTypes.UPDATE_CHARGE_LIST, props<{ charges: ChargeOfAccountingManagementModel[] }>());
export const UpdateExchangeRate = createAction(AccountingManagementActionTypes.UPDATE_EXCHANGE_RATE, props<ISyncExchangeRate>());
export const GetAgreementForInvoice = createAction(AccountingManagementActionTypes.GET_AGREEMENT_INVOICE, props<IAgreementInvoice>());

export const SearchListAccountingMngt = createAction(AccountingManagementActionTypes.SEARCH_LIST, props<Partial<AccAccountingManagementCriteria>>());
export const LoadListAccountingMngt = createAction(AccountingManagementActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListAccountingMngtSuccess = createAction(AccountingManagementActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());
