import { ISearchAdvancePayment } from './../../components/form-search-advance-payment/form-search-advance-payment.component';
import { createAction, props } from '@ngrx/store';

export enum AdvancePaymentActionTypes {
    SEARCH_LIST = '[AdvancePayment] Search List',
    LOAD_LIST = '[AdvancePayment] Load List',
    LOAD_LIST_SUCCESS = '[AdvancePayment] Load List Success]'
};

type searchType = ISearchAdvancePayment;

export const SearchListAdvancePayment = createAction(AdvancePaymentActionTypes.SEARCH_LIST, props<Partial<searchType>>());
export const LoadListAdvancePayment = createAction(AdvancePaymentActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListAdvancePaymentSuccess = createAction(AdvancePaymentActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());

