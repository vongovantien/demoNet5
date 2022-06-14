import { createAction, props } from "@ngrx/store";

export enum AccountReceivableActionTypes {
    INSERT_DATA_SEARCH_ACCOUNT_RECEIVABLE = '[ACCOUNT_RECEIVABLE] Insert data search',
    LOAD_LIST= '[ACCOUNT_RECEIVABLE] Load List',
    LOAD_LIST_SUCCESS = '[ACCOUNT_RECEIVABLE] Load List Success ',
}

export const SearchListAccountReceivable = createAction(AccountReceivableActionTypes.INSERT_DATA_SEARCH_ACCOUNT_RECEIVABLE, props<Partial<AccountingInterface.IAccReceivableSearch>>());
export const LoadListAccountReceivable = createAction(AccountReceivableActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListAccountReceivableSuccess = createAction(AccountReceivableActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());