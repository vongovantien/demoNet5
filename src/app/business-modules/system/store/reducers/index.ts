import { createFeatureSelector, createSelector, ActionReducerMap } from '@ngrx/store';
import { systemUserLevelReducer, ISystemUserLevelState } from './system-user-level.reducer';
export * from './system-user-level.reducer';

export interface IShareSystemState {
    userLevel: ISystemUserLevelState;
}

export const shareBussinessState = createFeatureSelector<IShareSystemState>('share-system');

export const getShareSystemState = createSelector(shareBussinessState, (state: IShareSystemState) => state);
export const getShareSystemUserLevelState = createSelector(shareBussinessState, (state: IShareSystemState) => state.userLevel.userLevel);

export const checkShareSystemUserLevel = createSelector(shareBussinessState, (state: IShareSystemState) => {
    if (state.userLevel.userLevel.length) {
        return true;
    } return false;
});
export const reducers: ActionReducerMap<IShareSystemState> = {
    userLevel: systemUserLevelReducer,
};
