import { createFeatureSelector, ActionReducerMap, createSelector } from '@ngrx/store';
import { accountPayablePaymentReducer, IAccountPayablePaymentReducerState } from './account-payable-detail.reducer';

export interface IAccountPayablePaymentState {
    account: IAccountPayablePaymentReducerState
}

// // * SELECTOR
export const accountPayablePaymentState = createFeatureSelector<IAccountPayablePaymentState>('account-payable');
export const getAccountPayablePaymentSearchState = createSelector(accountPayablePaymentState, (state: IAccountPayablePaymentState) => state.account?.dataSearch);
export const getAccountPayablePaymentPagingState = createSelector(accountPayablePaymentState, (state: IAccountPayablePaymentState) => state.account?.pagingData);
export const getAccountPayablePaymentListState = createSelector(accountPayablePaymentState, (state: IAccountPayablePaymentState) => state?.account?.list);
export const getAccountPayablePaymentLoadingListState = createSelector(accountPayablePaymentState, (state: IAccountPayablePaymentState) => state?.account?.isLoading);

export const reducers: ActionReducerMap<IAccountPayablePaymentState> = {
    account: accountPayablePaymentReducer,
};

