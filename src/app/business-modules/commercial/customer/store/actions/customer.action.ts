import { createAction, props } from '@ngrx/store';

export enum CustomerActionTypes {
    SEARCH_LIST = '[CustomerAction] Search List',
    LOAD_LIST = '[CustomerAction] Load List',
    LOAD_LIST_SUCCESS = '[CustomerAction] Load List Success]'

};

export const SearchList = createAction(CustomerActionTypes.SEARCH_LIST, props<{ payload: any }>());
export const LoadListCustomer = createAction(CustomerActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListCustomerSuccess = createAction(CustomerActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());
