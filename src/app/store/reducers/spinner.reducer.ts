import { SpinnerActions, SpinnerActionTypes } from "../actions/spinner.action";


export interface ISpinnerState {
    show: boolean;
}

export const initSpinnerState: ISpinnerState = { show: false };

export function spinnerReducer(state: ISpinnerState = initSpinnerState, action: SpinnerActions) {
    switch (action.type) {
        case SpinnerActionTypes.SHOW:
            return { ...state, show: true };
        case SpinnerActionTypes.HIDE:
            return { ...state, show: false };
        default:
            return state;
    }
}


