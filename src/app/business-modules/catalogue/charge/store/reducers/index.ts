import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { ChargeListState, reducer } from "./charge.reducer";

export * from './charge.reducer';
export interface IChargeState {
    chg: ChargeListState;
}


// * SELECTOR
export const chargeState = createFeatureSelector<IChargeState>('charge');
export const getChargeSearchParamsState = createSelector(chargeState, (state: IChargeState) => state && state.chg && state.chg.dataSearch);
export const getChargeDataListState = createSelector(chargeState, (state: IChargeState) => state.chg?.charges);

export const reducers: ActionReducerMap<IChargeState> = {
    chg: reducer
};