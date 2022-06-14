import { UserLevel } from "src/app/shared/models/system/userlevel";
import { Action } from "@ngrx/store";

export enum SystemUserLevelActionTypes {
    SYSTEM_LOAD_USER_LEVEL = '[System] Load User Level',
    SYSTEM_LOAD_USER_LEVEL_SUCCESS = '[System] Load User Level Success',

    // SYSTEM_LOAD_USER_LEVEL_OFFICE = '[System] Load User Level Office',
    // SYSTEM_LOAD_USER_LEVEL_DEPARTMENT = '[System] Load User Level Department',
    // SYSTEM_LOAD_USER_LEVEL_GROUP = '[System] Load User Level Group',
}

export class SystemLoadUserLevelAction implements Action {
    readonly type = SystemUserLevelActionTypes.SYSTEM_LOAD_USER_LEVEL;

    constructor(public payload: { companyId: string, officeId?: string, departmentId?: number, groupId?: number, type: string }) { }
}

export class SystemLoadUserLevelSuccessAction implements Action {
    readonly type = SystemUserLevelActionTypes.SYSTEM_LOAD_USER_LEVEL_SUCCESS;

    constructor(public payload: UserLevel[]) { }
}



export type SystemUserLevelActions =
    SystemLoadUserLevelAction
    | SystemLoadUserLevelSuccessAction;
