import { createFeatureSelector, createSelector, ActionReducerMap } from "@ngrx/store";
import { clearanceReducer, ICustomDeclarationState } from "./custom-clearance.reducer";
import { opsReducer, IOPSTransactionState } from "./operation.reducer";

export interface IOperationState {
    transaction: IOPSTransactionState;
    clearance: ICustomDeclarationState;
}

export const OperationState = createFeatureSelector<IOperationState>('operations');

export const getOperationState = createSelector(OperationState, (state: IOperationState) => state);
export const getOperationTransationState = createSelector(OperationState, (state: IOperationState) => state && state.transaction);
export const getOperationTransationListShipment = createSelector(OperationState, (state: IOperationState) => state && state.transaction?.opsTransations);
export const getOperationTransationDataSearch = createSelector(OperationState, (state: IOperationState) => state && state.transaction?.dataSearch);
export const getOperationTransationLoadingState = createSelector(OperationState, (state: IOperationState) => state && state.transaction?.isLoading);
export const getOperationTransationPagingState = createSelector(OperationState, (state: IOperationState) => state && state.transaction?.pagingData);

export const getOperationClearanceList = createSelector(OperationState, (state: IOperationState) => state && state.clearance?.customDeclarations);
export const getOperationClearanceDataSearch = createSelector(OperationState, (state: IOperationState) => state && state.clearance?.dataSearch);
export const getOperationClearanceLoadingState = createSelector(OperationState, (state: IOperationState) => state && state.clearance?.isLoading);
export const getOperationClearancePagingState = createSelector(OperationState, (state: IOperationState) => state && state.clearance?.pagingData);

export const reducers: ActionReducerMap<IOperationState> = {
    transaction: opsReducer,
    clearance: clearanceReducer
}

