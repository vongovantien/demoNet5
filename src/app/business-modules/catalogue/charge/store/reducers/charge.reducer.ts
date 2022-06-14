import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions/';


// export interface IChargeSearchParamsState {
//     searchParams: any;

// }
// export const initialState: IChargeSearchParamsState = {
//     searchParams: {}
// };
export interface ChargeListState {
    charges: any
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
    
}

export const initialState: ChargeListState = {
    charges: { data: [], totalItems: 0, },
    isLoading: false,
    isLoaded: false,
    pagingData: { page: 1, pageSize: 15 },
    dataSearch: {}
};

const chargeReducer = createReducer(
    initialState,
    on(Types.SearchList, (state: ChargeListState, data: any) => ({
        ...state, dataSearch: { ...data.payload }
    })),
    on(
        Types.LoadListCharge, (state: ChargeListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListChargeSuccess, (state: ChargeListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, charges: payload, isLoading: false, isLoaded: true };
        }
    )
);

export function reducer(state: any | undefined, action: Action) {
    return chargeReducer(state, action);
};