import { createFeatureSelector, ActionReducerMap, createSelector } from '@ngrx/store';
import { combineBillingReducer, ICombineBillingReducerState } from './combine-billing.reducer';

export interface ICombineBillingState {
    billing: ICombineBillingReducerState
}
// * SELECTOR
export const combineBillingState = createFeatureSelector<ICombineBillingState>('combine-billing');

export const combineBillingDataState = createSelector(combineBillingState, (state: ICombineBillingState) => state?.billing);
export const getDataSearchCombineBillingState = createSelector(combineBillingState, (state: ICombineBillingState) => state?.billing?.dataSearch);
export const getCombineBillingPagingState = createSelector(combineBillingState, (state: ICombineBillingState) => state?.billing?.pagingData);
export const getCombineBillingListState = createSelector(combineBillingState, (state: ICombineBillingState) => state?.billing?.list);
export const getCombineBillingLoadingListState = createSelector(combineBillingState, (state: ICombineBillingState) => state?.billing?.isLoading);

export const reducers: ActionReducerMap<ICombineBillingState> = {
    billing: combineBillingReducer,
};

