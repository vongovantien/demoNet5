import { createFeatureSelector, ActionReducerMap, createSelector } from '@ngrx/store';
import { SOAReducer, ISOAReducerState } from './soa.reducer';

export interface ISOAState {
    soa: ISOAReducerState
}
// * SELECTOR
export const SOAState = createFeatureSelector<ISOAState>('soa');

export const SOADataState = createSelector(SOAState, (state: ISOAState) => state?.soa);
export const getDataSearchSOAState = createSelector(SOAState, (state: ISOAState) => state?.soa?.dataSearch);
export const getSOAPagingState = createSelector(SOAState, (state: ISOAState) => state?.soa?.pagingData);
export const getSOAListState = createSelector(SOAState, (state: ISOAState) => state?.soa?.list);
export const getSOALoadingListState = createSelector(SOAState, (state: ISOAState) => state?.soa?.isLoading);

export const reducers: ActionReducerMap<ISOAState> = {
    soa: SOAReducer,
};