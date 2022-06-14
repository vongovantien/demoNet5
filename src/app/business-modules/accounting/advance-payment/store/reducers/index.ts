import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { reducer, AdvancePaymentListState } from "./advance-payment.reducer";

export * from './advance-payment.reducer';
export interface IAdvancePaymentState {
    list: AdvancePaymentListState;
}


// * SELECTOR
export const advancePayment = createFeatureSelector<IAdvancePaymentState>('advance-payment');
export const advancePaymentState = createSelector(advancePayment, (state: IAdvancePaymentState) => state.list);
export const getAdvancePaymentSearchParamsState = createSelector(advancePayment, (state: IAdvancePaymentState) => state.list?.dataSearch);
export const getAdvancePaymentListState = createSelector(advancePayment, (state: IAdvancePaymentState) => state.list?.advances);
export const getAdvancePaymentListPagingState = createSelector(advancePayment, (state: IAdvancePaymentState) => state.list.pagingData);
export const getAdvancePaymentListLoadingState = createSelector(advancePayment, (state: IAdvancePaymentState) => state.list.isLoading);
export const reducers: ActionReducerMap<IAdvancePaymentState> = {
    list: reducer
};