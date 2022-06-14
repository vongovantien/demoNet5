import { Action } from '@ngrx/store';

export enum ClaimUserActionTypes {
    GET = '[Claim] Get',
    GET_SUCCESS = '[Claim] Get Success',

    UPDATE = '[Claim] Update',
    UPDATE_SUCCESS = '[Claim] Update Success',

    CHANGE_OFFICE = '[Claim] Change Office',
    CHANGE_GROUP = '[Claim] Change Group',

}

export class GetClaimUserAction implements Action {
    readonly type = ClaimUserActionTypes.GET;
    constructor(public payload: any) { }
}

export class GetClaimUserSuccessAction implements Action {
    readonly type = ClaimUserActionTypes.GET_SUCCESS;
    constructor(public payload: any) { }
}

export class UpdateClaimUserAction implements Action {
    readonly type = ClaimUserActionTypes.UPDATE;
    constructor(public payload: any) { }
}

export class ChangeOfficeClaimUserAction implements Action {
    readonly type = ClaimUserActionTypes.CHANGE_OFFICE;
    constructor(public payload: any) { }
}

export class ChangeDepartGroupClaimUserAction implements Action {
    readonly type = ClaimUserActionTypes.CHANGE_GROUP;
    constructor(public payload: { departmentId: number, groupId: number }) { }
}

export type ClaimUserActions
    = GetClaimUserAction
    | UpdateClaimUserAction
    | ChangeOfficeClaimUserAction
    | ChangeDepartGroupClaimUserAction
    | GetClaimUserSuccessAction;
