import { createAction, props } from "@ngrx/store";

export enum CombineBillingActionTypes {
    INSERT_DATA_SEARCH_COMBINE_BILLING = '[COMBINE_BILLING] Insert data search',
    LOAD_LIST = '[COMBINE_BILLING] Load List',
    LOAD_LIST_SUCCESS = '[COMBINE_BILLING] Load List Success'
}
export const SearchListCombineBilling = createAction(CombineBillingActionTypes.INSERT_DATA_SEARCH_COMBINE_BILLING, props<Partial<any>>());
export const LoadListCombineBilling = createAction(CombineBillingActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListCombineBillingSuccess = createAction(CombineBillingActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());