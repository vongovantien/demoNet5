import { SystemUserLevelActions, SystemUserLevelActionTypes } from "../actions";
import { UserLevel } from "src/app/shared/models/system/userlevel";


export interface ISystemUserLevelState {
    userLevel: UserLevel[];
}


const initialState: ISystemUserLevelState = {
    userLevel: [],
};

export function systemUserLevelReducer(state = initialState, action: SystemUserLevelActions): ISystemUserLevelState {
    switch (action.type) {
        case SystemUserLevelActionTypes.SYSTEM_LOAD_USER_LEVEL_SUCCESS: {
            return {
                ...state,
                userLevel: [...action.payload]
            };
        }
        default: {
            return state;
        }
    }
}
