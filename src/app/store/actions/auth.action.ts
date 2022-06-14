import { createAction, props, ActionCreator } from "@ngrx/store";

export enum AuthActions {
    GET_CURRENT_USER = '[Auth] Get Current User',
    UPDATE_CURRENT_USER = '[Auth] Update Current User',
}

export const GetCurrenctUser = createAction<AuthActions.GET_CURRENT_USER>(AuthActions.GET_CURRENT_USER);
export const UpdateCurrentUser = createAction(AuthActions.UPDATE_CURRENT_USER, props<{ data: string }>());