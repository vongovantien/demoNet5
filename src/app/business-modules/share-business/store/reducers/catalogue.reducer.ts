import { Partner } from "@models";
import { Action, createReducer, on } from "@ngrx/store";
import { LoadListPartnerForKeyInSurcharge, LoadListPartnerForKeyInSurchargeSuccess } from "../actions";
export interface IShareBussinessCatalogueState {
    partners: Partner[]
    isLoading: boolean;
}

export const initialCatalogueState: IShareBussinessCatalogueState = { isLoading: false, partners: [] };
const shareBussinessCatalogueReducer = createReducer(
    initialCatalogueState,
    on(LoadListPartnerForKeyInSurcharge, (state: IShareBussinessCatalogueState) => ({
        ...state, isLoading: true
    })),
    on(LoadListPartnerForKeyInSurchargeSuccess, (state: IShareBussinessCatalogueState, payload: any) => ({
        ...state, partners: payload.data, isLoading: false
    })),
);

export function CatalogueReducer(state: any | undefined, action: Action) {
    return shareBussinessCatalogueReducer(state, action);
};