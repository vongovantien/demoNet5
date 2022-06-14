import { createFeatureSelector, ActionReducerMap, createSelector } from '@ngrx/store';
import { accountReceivableReducer, IAccountReceivableReducerState } from './account-receivable.reducer';

export interface IAccountReceivableState {
    account: IAccountReceivableReducerState
}

// // * SELECTOR
export const accountReceivableState = createFeatureSelector<IAccountReceivableState>('account-receivable');
export const getAccountReceivableSearchState = createSelector(accountReceivableState, (state: IAccountReceivableState) => state.account?.dataSearch);
export const getAccountReceivablePagingState = createSelector(accountReceivableState, (state: IAccountReceivableState) => state.account?.pagingData);
export const getAccountReceivableListState = createSelector(accountReceivableState, (state: IAccountReceivableState) => state.account?.list);
export const getAccountReceivableLoadingListState = createSelector(accountReceivableState, (state: IAccountReceivableState) => state.account?.isLoading);

export const reducers: ActionReducerMap<IAccountReceivableState> = {
    account: accountReceivableReducer,
};

