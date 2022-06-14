import { createFeatureSelector, ActionReducerMap, createSelector } from '@ngrx/store';
import { historyPaymentReducer, IHistoryPaymentReducerState } from './history-payment.reducer';

export interface IHistoryPaymentState {
    account: IHistoryPaymentReducerState
}
// // * SELECTOR
export const historyPaymentState = createFeatureSelector<IHistoryPaymentState>('history-payment');
export const getDataSearchHistoryPaymentState = createSelector(historyPaymentState, (state: IHistoryPaymentState) => state.account?.dataSearch);
export const getHistoryPaymentPagingState = createSelector(historyPaymentState, (state: IHistoryPaymentState) => state.account?.pagingData);
export const getHistoryPaymentListState = createSelector(historyPaymentState, (state: IHistoryPaymentState) => state.account?.list);
export const getHistoryPaymentLoadingListState = createSelector(historyPaymentState, (state: IHistoryPaymentState) => state.account?.isLoading);

export const reducers: ActionReducerMap<IHistoryPaymentState> = {
    account: historyPaymentReducer,
};

