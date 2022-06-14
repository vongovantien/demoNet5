import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions';


// export interface ICustomerSearchParamsState {
//     searchParams: any;

// }
// export const initialState: ICustomerSearchParamsState = {
//     searchParams: {}
// };

export interface CustomerListState {
    customers: any
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
    
}

export const initialState: CustomerListState = {
    customers: { data: [], totalItems: 0, },
    isLoading: false,
    isLoaded: false,
    pagingData: { page: 1, pageSize: 15 },
    dataSearch: {}
};


const customerReducer = createReducer(
    initialState,
    on(Types.SearchList, (state: CustomerListState, data: any) => ({
        ...state, dataSearch: { ...data.payload }
    })),
    on(
        Types.LoadListCustomer, (state: CustomerListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListCustomerSuccess, (state: CustomerListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, customers: payload, isLoading: false, isLoaded: true };
        }
    )

);

export function reducer(state: any | undefined, action: Action) {
    return customerReducer(state, action);
};