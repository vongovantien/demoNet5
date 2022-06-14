import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions';


// export interface IAgentSearchParamsState {
//     searchParams: any;

// }
// export const initialState: IAgentSearchParamsState = {
//     searchParams: {}
// };

export interface AgentListState {
    agents: any
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
    
}


export const initialState: AgentListState = {
    agents: { data: [], totalItems: 0, },
    isLoading: false,
    isLoaded: false,
    pagingData: { page: 1, pageSize: 15 },
    dataSearch: {}
};



const agentReducer = createReducer(
    initialState,
    on(Types.SearchList, (state: AgentListState, data: any) => ({
        ...state, dataSearch: { ...data.payload }
    })),
    on(
        Types.LoadListAgent, (state: AgentListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListAgentSuccess, (state: AgentListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, agents: payload, isLoading: false, isLoaded: true };
        }
    )


);

export function reducer(state: any | undefined, action: Action) {
    return agentReducer(state, action);
};