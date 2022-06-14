import { Action } from '@ngrx/store';

export enum MenuActionTypes {
    GET_PERMISSION = '[Menu] Get Permission',
    UPDATE_PERMISSION = '[Menu] Update Permission',
}
export class MenuGetPermissionAction implements Action {
    readonly type = MenuActionTypes.GET_PERMISSION;
    constructor() { }
}

export class MenuUpdatePermissionAction implements Action {
    readonly type = MenuActionTypes.UPDATE_PERMISSION;
    constructor(public payload: any) { }
}

export type MenuActions = MenuGetPermissionAction | MenuUpdatePermissionAction;
