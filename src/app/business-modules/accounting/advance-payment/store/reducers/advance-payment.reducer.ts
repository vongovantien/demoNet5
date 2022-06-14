import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions/';
export interface AdvancePaymentListState {
    advances: any
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
}

export const initialState: AdvancePaymentListState = {
    advances: { data: [], totalItems: 0, },
    isLoading: false,
    isLoaded: false,
    pagingData: { page: 1, pageSize: 15 },
    dataSearch: null
};



const advancePaymentReducer = createReducer(
    initialState,
    on(Types.SearchListAdvancePayment, (state: AdvancePaymentListState, payload: any) => {
        return { ...state, dataSearch: payload, pagingData: { page: 1, pageSize: 15 } }
    }),
    on(
        Types.LoadListAdvancePayment, (state: AdvancePaymentListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListAdvancePaymentSuccess, (state: AdvancePaymentListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, advances: payload, isLoading: false, isLoaded: true };
        }
    )
);

export function reducer(state: any | undefined, action: Action) {
    return advancePaymentReducer(state, action);
};