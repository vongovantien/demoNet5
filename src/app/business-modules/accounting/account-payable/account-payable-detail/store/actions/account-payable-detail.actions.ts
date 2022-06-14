import { createAction, props } from "@ngrx/store";

export enum AccountPayablePaymentActionTypes {
    INSERT_DATA_SEARCH_ACCOUNT_PAYABLE_DETAIL = '[ACCOUNT_PAYABLE_DETAIL] Insert data search',
    LOAD_LIST= '[ACCOUNT_PAYABLE_DETAIL] Load List',
    LOAD_LIST_SUCCESS = '[ACCOUNT_PAYABLE_DETAIL] Load List Success ',
}

export const SearchListAccountPayableDetail = createAction(AccountPayablePaymentActionTypes.INSERT_DATA_SEARCH_ACCOUNT_PAYABLE_DETAIL, props<Partial<any>>());
export const LoadListAccountPayableDetail = createAction(AccountPayablePaymentActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListAccountPayableSuccess = createAction(AccountPayablePaymentActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());