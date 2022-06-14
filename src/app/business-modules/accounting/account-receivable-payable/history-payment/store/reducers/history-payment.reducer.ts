import { createReducer, on, Action } from "@ngrx/store";
import * as HisPayActions from "../actions";

export interface IHistoryPaymentReducerState {
    list:any;
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch:any;
    pagingData: { page: number, pageSize: number };
}

export const initialState: IHistoryPaymentReducerState = {
    list: { data: [], totalItems: 0, },
    isLoaded: false,
    isLoading: false,
    dataSearch:null,
    pagingData:{ page: 1, pageSize: 15 }
};

export const historyPaymentMangReducer = createReducer(
    initialState,
    on(HisPayActions.SearchListHistoryPayment, (state: IHistoryPaymentReducerState,payload:any) => ({
        ...state,dataSearch:payload, pagingData: { page: 1, pageSize: 15 }
    })),
    on(HisPayActions.LoadListHistoryPayment, (state: IHistoryPaymentReducerState, payload: CommonInterface.IParamPaging) => ({
        ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size }
    })),
    on(HisPayActions.LoadListHistoryPaymentSuccess, (state: IHistoryPaymentReducerState, payload: CommonInterface.IResponsePaging) => ({
        ...state,list:payload, isLoading: false, isLoaded: true
    }))
);

export function historyPaymentReducer(state: IHistoryPaymentReducerState | undefined, action: Action) {
    return historyPaymentMangReducer(state, action);
}