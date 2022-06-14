import { createReducer, on, Action } from "@ngrx/store";
import * as AccountPayableActions from "../actions";

export interface IAccountPayablePaymentReducerState {
    list:any;
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
}

export const initialState: IAccountPayablePaymentReducerState = {
    list: { data: [], totalItems: 0, },
    isLoaded: false,
    isLoading: false,
    dataSearch: null,
    pagingData: { page: 1, pageSize: 50 }
};

export const accountPayablePaymentPaymentMangReducer = createReducer(
    initialState,
    on(AccountPayableActions.SearchListAccountPayableDetail, (state: IAccountPayablePaymentReducerState, payload: any) => ({
        ...state, dataSearch: payload, pagingData: { page: 1, pageSize: 50 }
    })),
    on(AccountPayableActions.LoadListAccountPayableDetail, (state: IAccountPayablePaymentReducerState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(AccountPayableActions.LoadListAccountPayableSuccess, (state: IAccountPayablePaymentReducerState, payload: CommonInterface.IResponsePaging) => ({
        ...state, list: payload, isLoading: false, isLoaded: true
    })),

);

export function accountPayablePaymentReducer(state: IAccountPayablePaymentReducerState | undefined, action: Action) {
    return accountPayablePaymentPaymentMangReducer(state, action);
}