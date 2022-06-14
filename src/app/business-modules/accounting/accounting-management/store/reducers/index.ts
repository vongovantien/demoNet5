
import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { IAccountingManagementPartnerState, reducer } from "./accounting-management-partner.reducer";
import { IAccountingManagementListState, acctMngtListReducer } from "./accounting-management.reducer";

export * from './accounting-management-partner.reducer';
export interface IAccountingManagementState {
    partner: IAccountingManagementPartnerState;
    list: IAccountingManagementListState;
}


// * SELECTOR
export const accountingManagementState = createFeatureSelector<IAccountingManagementState>('accounting-management');

export const accountingManagementListState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state.list.accMngts);
export const accountingManagementDataSearchState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state.list && state.list.dataSearch);
export const accountingManagementListLoadingState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state.list.isLoading);

export const getAccoutingManagementPartnerState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state.partner);
export const getAccoutingManagementPaymentTermState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state.partner.paymentTerm);
export const getAccountingManagementPartnerChargeState = createSelector(accountingManagementState, (state: IAccountingManagementState) => state.partner.charges);
export const getAccountingManagementGeneralExchangeRate = createSelector(accountingManagementState, (state: IAccountingManagementState) => state && state?.partner.generalExchangeRate);

export const reducers: ActionReducerMap<IAccountingManagementState> = {
    partner: reducer,
    list: acctMngtListReducer
};

