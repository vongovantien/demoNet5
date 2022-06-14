import { createAction, props } from '@ngrx/store';

export enum ChargeActionTypes {
    SEARCH_LIST = '[ChargeAction] Search List',
    LOAD_LIST = '[ChargeAction] Load List',
    LOAD_LIST_SUCCESS = '[ChargeAction] Load List Success]'
};

export const SearchList = createAction(ChargeActionTypes.SEARCH_LIST, props<{ payload: any }>());
export const LoadListCharge = createAction(ChargeActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListChargeSuccess = createAction(ChargeActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());