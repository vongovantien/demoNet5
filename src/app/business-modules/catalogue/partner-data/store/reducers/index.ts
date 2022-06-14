import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { PartnerListState, reducer } from "./partnerData.reducer";

export * from './partnerData.reducer';
export interface IPartnerDataState {
    com: PartnerListState;
}


// * SELECTOR
export const partnerState = createFeatureSelector<IPartnerDataState>('partnerData');
export const getPartnerDataSearchParamsState = createSelector(partnerState, (state: IPartnerDataState) => state && state.com && state.com.dataSearch);
export const getPartnerDataListState = createSelector(partnerState, (state: IPartnerDataState) => state.com?.partners);
export const getPartnerDataListPagingState = createSelector(partnerState, (state: IPartnerDataState) => state.com.pagingData);
export const getPartnerDataListLoadingState = createSelector(partnerState, (state: IPartnerDataState) => state.com.isLoading);

export const reducers: ActionReducerMap<IPartnerDataState> = {
    com: reducer
};
