import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { CustomerListState, reducer } from "./customer.reducer";

export * from './customer.reducer';
export interface ICustomerState {
    com: CustomerListState;
}


// * SELECTOR
export const commercialState = createFeatureSelector<ICustomerState>('customer');
export const getCustomerSearchParamsState = createSelector(commercialState, (state: ICustomerState) => state && state.com && state.com.dataSearch);
export const getCustomerListState = createSelector(commercialState, (state: ICustomerState) => state.com?.customers);

export const reducers: ActionReducerMap<ICustomerState> = {
    com: reducer
};