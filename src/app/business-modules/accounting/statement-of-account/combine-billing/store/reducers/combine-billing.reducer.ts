import { createReducer, on, Action } from "@ngrx/store";
import * as actions from "../actions";

export interface ICombineBillingReducerState {
    list: { data: any[], totalItems: number };
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch:any;
    pagingData: { page: number, pageSize: number };
}

export const initialState: ICombineBillingReducerState = {
    list: { data: [], totalItems: 0, },
    isLoaded: false,
    isLoading: false,
    dataSearch:null,
    pagingData:{ page: 1, pageSize: 15 }
};

export const combineBillingMangReducer = createReducer(
    initialState,
    on(actions.SearchListCombineBilling, (state: ICombineBillingReducerState,payload:any) => ({
        ...state,dataSearch:payload, pagingData: { page: 1, pageSize: 15 }
    })),
    on(actions.LoadListCombineBilling, (state: ICombineBillingReducerState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(actions.LoadListCombineBillingSuccess, (state: ICombineBillingReducerState, payload: CommonInterface.IResponsePaging) => ({
        ...state,list:payload, isLoading: false, isLoaded: true
    }))
);

export function combineBillingReducer(state: ICombineBillingReducerState | undefined, action: Action) {
    return combineBillingMangReducer(state, action);
}