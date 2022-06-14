import { createReducer, on, Action } from "@ngrx/store";
import * as actions from "../actions";

export interface ISOAReducerState {
    list: { data: any[], totalItems: number };
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch:any;
    pagingData: { page: number, pageSize: number };
}

export const initialState: ISOAReducerState = {
    list: { data: [], totalItems: 0, },
    isLoaded: false,
    isLoading: false,
    dataSearch:{},
    pagingData:{ page: 1, pageSize: 15 }
};

export const SOAMangReducer = createReducer(
    initialState,
    on(actions.SearchListSOA, (state: ISOAReducerState,payload:any) => ({
        ...state,dataSearch:payload, pagingData: { page: 1, pageSize: 15 }
    })),
    on(actions.LoadListSOA, (state: ISOAReducerState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(actions.LoadListSOASuccess, (state: ISOAReducerState, payload: CommonInterface.IResponsePaging) => ({
        ...state,list:payload, isLoading: false, isLoaded: true
    }))
);

export function SOAReducer(state: ISOAReducerState | undefined, action: Action) {
    return SOAMangReducer(state, action);
}