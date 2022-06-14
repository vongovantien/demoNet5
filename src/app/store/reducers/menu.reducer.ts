import { MenuActions, MenuActionTypes } from "../actions";


export interface IMenuState {
    permission: any;
}

const initialState: IMenuState = {
    permission: {}
};

export function menuReducer(state: IMenuState = initialState, action: MenuActions): IMenuState {
    switch (action.type) {
        case MenuActionTypes.GET_PERMISSION:
            return {
                ...state
            };
        case MenuActionTypes.UPDATE_PERMISSION:
            return {
                ...state, permission: action.payload
            };
        default:
            return state;
    }
};
