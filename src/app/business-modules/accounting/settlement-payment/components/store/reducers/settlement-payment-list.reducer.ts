import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions/';
import { ISearchSettlePayment } from '../../form-search-settlement/form-search-settlement.component';


export interface SettlePaymentListState {
    settlements: any;
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: ISearchSettlePayment;
    pagingData: { page: number, pageSize: number };

}
export const initialState: SettlePaymentListState = {
    settlements: { data: [], totalItems: 0 },
    isLoading: false,
    isLoaded: false,
    dataSearch: null,
    pagingData: { page: 1, pageSize: 15 }
};

const settlementPaymentListReducer = createReducer(
    initialState,
    on(Types.SearchListSettlePayment, (state: SettlePaymentListState, payload: any) => ({
        ...state, dataSearch: payload, pagingData: { page: 1, pageSize: 15 }
    })),
    on(
        Types.LoadListSettlePayment, (state: SettlePaymentListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListSettlePaymentSuccess, (state: SettlePaymentListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, settlements: payload, isLoading: false, isLoaded: true };
        }
    )
);

export function settlePaymentListreducer(state: any | undefined, action: Action) {
    return settlementPaymentListReducer(state, action);
};