import { AccAccountingManagementCriteria } from "@models";
import { Action, createReducer, on } from "@ngrx/store";
import * as accountingManagementActions from '../actions/accounting-management.action';

export interface IAccountingManagementListState {
    accMngts: CommonInterface.IResponsePaging;
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: Partial<AccAccountingManagementCriteria>;
}

export const initialState: IAccountingManagementListState = {
    accMngts: { data: [], totalItems: 0, page: 1, size: 15 },
    isLoading: false,
    isLoaded: false,
    dataSearch: null
};

export const accountingManagementListReducer = createReducer(
    initialState,
    on(
        accountingManagementActions.SearchListAccountingMngt, (state: IAccountingManagementListState, payload: Partial<AccAccountingManagementCriteria>) => {
            return { ...state, dataSearch: payload, isLoading: true };
        }
    ),
    on(
        accountingManagementActions.LoadListAccountingMngt, (state: IAccountingManagementListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true };
        }
    ),
    on(
        accountingManagementActions.LoadListAccountingMngtSuccess, (state: IAccountingManagementListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, accMngts: payload, isLoading: false, isLoaded: true };
        }
    )
);

export function acctMngtListReducer(state: IAccountingManagementListState | undefined, action: Action) {
    return accountingManagementListReducer(state, action);
}



