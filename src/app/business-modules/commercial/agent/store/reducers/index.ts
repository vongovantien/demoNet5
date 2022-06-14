import { createFeatureSelector, ActionReducerMap, createSelector } from "@ngrx/store";
import { AgentListState, reducer } from "./agent.reducer";

export * from './agent.reducer';
export interface IAgentState {
    com: AgentListState;
}


// * SELECTOR
export const commercialState = createFeatureSelector<IAgentState>('agent');
export const getAgentSearchParamsState = createSelector(commercialState, (state: IAgentState) => state && state.com && state.com.dataSearch);
export const getAgentDataListState = createSelector(commercialState, (state: IAgentState) => state.com?.agents);
export const getAgentPagingState = createSelector(commercialState, (state: IAgentState) => state?.com?.pagingData);

export const reducers: ActionReducerMap<IAgentState> = {
    com: reducer
};