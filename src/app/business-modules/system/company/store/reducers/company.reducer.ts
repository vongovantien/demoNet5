import { CompanyAction, CompanyActionTypes } from "../actions/company.action";
import { Company } from "src/app/shared/models";
import { createFeatureSelector } from "@ngrx/store";

export interface ICompanyState {
    page: number;
    size: number;
    totalItems: number;
    data: Company[];
}

const initialState: ICompanyState = {
    data: [],
    page: 1,
    size: 10,
    totalItems: 0
};

export function CompanyReducer(state = initialState, action: CompanyAction): ICompanyState {
    switch (action.type) {
        case CompanyActionTypes.LOAD_COMPANY_SUCCESS: {
            return { ...state, ...action.payload };
        }

        default: {
            return state;
        }
    }
}


// * Selector

export const getCompany = (state: ICompanyState) => state.data;
export const getCompanyTotalItem = (state: ICompanyState) => state.totalItems;
export const getCompanySize = (state: ICompanyState) => state.size;
export const getCompanyPage = (state: ICompanyState) => state.page;
