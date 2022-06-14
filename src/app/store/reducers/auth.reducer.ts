import { Action, createReducer, on } from "@ngrx/store";
import { GetCurrenctUser, UpdateCurrentUser } from "../actions";

export interface IAuthState {
    currentUser: Partial<SystemInterface.IClaimUser>;
}

export const initialState: IAuthState = {
    currentUser: {}
}


export const authReducer = createReducer(
    initialState,
    on(GetCurrenctUser, (state: IAuthState) => ({ ...state })),
    on(UpdateCurrentUser, (state: IAuthState, payload: any) => ({ ...state, currentUser: payload })),
);

export function reducer(state: IAuthState | undefined, action: Action) {
    return authReducer(state, action);
}