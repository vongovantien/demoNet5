import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { CompanyReducer, ICompanyState } from './company.reducer';


export * from './company.reducer';
export interface ISystemState {
    company: ICompanyState;
}
export const reducers: ActionReducerMap<ISystemState> = {
    company: CompanyReducer
};

// * Create Selector
export const systemState = createFeatureSelector<ISystemState>('company');

// * Company State
export const getCompanyState = createSelector(systemState, (state: ISystemState) => state.company);
export const getCompanyTotalItemState = createSelector(systemState, (state: ISystemState) => state.company.totalItems);
export const getCompanyPageState = createSelector(systemState, (state: ISystemState) => state.company.page);
export const getCompanySizemState = createSelector(systemState, (state: ISystemState) => state.company.size);



