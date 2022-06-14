import { createAction, props } from '@ngrx/store';

export enum AgentActionTypes {
    SEARCH_LIST = '[AgentAction] Search List',
    LOAD_LIST = '[AgentAction] Load List',
    LOAD_LIST_SUCCESS = '[AgentAction] Load List Success]'
};

export const SearchList = createAction(AgentActionTypes.SEARCH_LIST, props<{ payload: any }>());
export const LoadListAgent = createAction(AgentActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListAgentSuccess = createAction(AgentActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());