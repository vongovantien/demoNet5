import { createReducer, on, Action } from "@ngrx/store";
import * as AccountReceivableActions from "../actions";

export interface IAccountReceivableReducerState {
    list:any;
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
}

export const initialState: IAccountReceivableReducerState = {
    list: { data: [], totalItems: 0, },
    isLoaded: false,
    isLoading: false,
    dataSearch: null,
    pagingData: { page: 1, pageSize: 50 }
};

export const accountReceivableMangReducer = createReducer(
    initialState,
    on(AccountReceivableActions.SearchListAccountReceivable, (state: IAccountReceivableReducerState, payload: any) => ({
        ...state, dataSearch: payload, pagingData: { page: 1, pageSize: 50 }
    })),
    on(AccountReceivableActions.LoadListAccountReceivable, (state: IAccountReceivableReducerState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(AccountReceivableActions.LoadListAccountReceivableSuccess, (state: IAccountReceivableReducerState, payload: CommonInterface.IResponsePaging) => ({
        ...state, list: payload, isLoading: false, isLoaded: true
    })),

);

export function accountReceivableReducer(state: IAccountReceivableReducerState | undefined, action: Action) {
    return accountReceivableMangReducer(state, action);
}