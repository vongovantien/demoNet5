import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { catalogueReducer, ICatalogueState } from './catalogue.reducer';
import { IMenuState, menuReducer } from './menu.reducer';
import { IAuthState, authReducer } from './auth.reducer';
export interface IAppState {
    catalogueReducer: ICatalogueState;
    menuReducer: IMenuState;
    authReducer: IAuthState
}

export const reducers: ActionReducerMap<IAppState> = {
    catalogueReducer: catalogueReducer,
    menuReducer: menuReducer,
    authReducer: authReducer
};


// * Selector

export const catalogueState = createFeatureSelector<any>('catalogueReducer');
export const menuState = createFeatureSelector<any>('menuReducer');
export const authState = createFeatureSelector<any>('authReducer');


// * CATALOGUE 

export const getCataloguePortState = createSelector(catalogueState, (state: ICatalogueState) => state && state.ports);
export const getCataloguePortLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueWarehouseState = createSelector(catalogueState, (state: ICatalogueState) => state && state.warehouses);
export const getCatalogueWarehouseLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCarrierState = createSelector(catalogueState, (state: ICatalogueState) => state && state.carriers);
export const getCatalogueCarrierLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueAgentState = createSelector(catalogueState, (state: ICatalogueState) => state && state.agents);
export const getCatalogueAgentLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueUnitState = createSelector(catalogueState, (state: ICatalogueState) => state && state.units);
export const getCatalogueUnitLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCataloguePackageState = createSelector(catalogueState, (state: ICatalogueState) => state && state.packages);
export const getCataloguePackageLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCommodityState = createSelector(catalogueState, (state: ICatalogueState) => state && state.commodities);
export const getCatalogueCommodityLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCommodityGroupState = createSelector(catalogueState, (state: ICatalogueState) => state && state.commodityGroups);
export const getCatalogueCommodityGroupLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCustomerState = createSelector(catalogueState, (state: ICatalogueState) => state && state.customers);
export const getCatalogueCustomerLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCountryState = createSelector(catalogueState, (state: ICatalogueState) => state && state.countries);
export const getCatalogueCountryLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCurrencyState = createSelector(catalogueState, (state: ICatalogueState) => state && state.currencies);
export const getCatalogueCurrencyLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueBankState = createSelector(catalogueState, (state: ICatalogueState) => state && state.banks);
export const getCatalogueBankLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

// * Menu
export const getMenuPermissionState = createSelector(menuState, (state: IMenuState) => state);
export const getMenuUserPermissionState = createSelector(menuState, (state: IMenuState) => state && state.permission);
export const getMenuUserSpecialPermissionState = createSelector(menuState, (state: IMenuState) => {
    if (!!state && !!state.permission) {
        if (!!state.permission.specialActions) {
            return state.permission.specialActions;
        }
    }
});

// * Auth
export const getAuthState = createSelector(authState, (state: IAuthState) => state);
export const getCurrentUserState = createSelector(authState, (state: IAuthState) => state?.currentUser);
