import * as ActionTypes from '../actions/';
import { Action, createReducer, on } from "@ngrx/store";
import { ISearchCustomClearance } from "src/app/business-modules/operation/custom-clearance/components/form-search-custom-clearance/form-search-custom-clearance.component";

export interface ICustomDeclarationState {
    customDeclarations: any;
    dataSearch: ISearchCustomClearance;
    isLoading: boolean;
    isLoaded: boolean;
    pagingData: any;
};

const initialState: ICustomDeclarationState = {
    customDeclarations: { data: [], totalItems: 0 },
    dataSearch: null,
    isLoaded: false,
    isLoading: false,
    pagingData: { page: 1, pageSize: 15 }
};

const clearanceListReducer = createReducer(
    initialState,
    on(ActionTypes.CustomsDeclarationSearchListAction, (state: ICustomDeclarationState, payload: any) => ({
        ...state, dataSearch: payload, isLoading: true, isLoaded: false, pagingData: { page: 1, pageSize: 15 }
    })),
    on(
        ActionTypes.CustomsDeclarationLoadListAction, (state: ICustomDeclarationState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, isLoaded: false, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        ActionTypes.CustomsDeclarationLoadListSuccessAction, (state: ICustomDeclarationState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, customDeclarations: payload, isLoading: false, isLoaded: true };
        }
    )
);
export function clearanceReducer(state: any | undefined, action: Action) {
    return clearanceListReducer(state, action);
};