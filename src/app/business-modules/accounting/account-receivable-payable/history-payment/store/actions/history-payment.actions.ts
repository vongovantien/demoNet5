import { createAction, props } from "@ngrx/store";

export enum HistoryPaymentActionTypes {
    INSERT_DATA_SEARCH_HISTORY_PAYMENT = '[HISTORY_PAYMENT] Insert data search',
    LOAD_LIST = '[HISTORY_PAYMENT] Load List',
    LOAD_LIST_SUCCESS = '[HISTORY_PAYMENT] Load List Success'
}
export const SearchListHistoryPayment = createAction(HistoryPaymentActionTypes.INSERT_DATA_SEARCH_HISTORY_PAYMENT, props<Partial<any>>());
export const LoadListHistoryPayment = createAction(HistoryPaymentActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListHistoryPaymentSuccess = createAction(HistoryPaymentActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());