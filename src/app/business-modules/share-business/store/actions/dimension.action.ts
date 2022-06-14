import { Action } from '@ngrx/store';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum DimensionActionTypes {
    INIT_DIMENSION = '[DIMENSION] INIT',
    GET_DIMENSION = '[DIMENSION] GET',
    GET_DIMENSION_HBL = '[DIMENSION] GET HBL',
    GET_DIMENSION_HBL_SUCCESS = '[DIMENSION] GET HBL SUCESS',
    GET_DIMENSION_SUCESS = '[DIMENSION] GET SUCCESS',
    GET_DIMENSION_FAIL = '[DIMENSION] GET FAIL',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful 
 * type checking in reducer functions.
 */
export class InitDimensionAction implements Action {
    readonly type = DimensionActionTypes.INIT_DIMENSION;

    constructor(public payload: any) { }
}
export class GetDimensionAction implements Action {
    readonly type = DimensionActionTypes.GET_DIMENSION;

    constructor(public payload: any) { }
}

export class GetDimensionHBLAction implements Action {
    readonly type = DimensionActionTypes.GET_DIMENSION_HBL;

    constructor(public payload: any) { }
}

export class GetDimensionHBLSuccessAction implements Action {
    readonly type = DimensionActionTypes.GET_DIMENSION_HBL_SUCCESS;

    constructor(public payload: any) { }
}

export class GetDimensionSuccessAction implements Action {
    readonly type = DimensionActionTypes.GET_DIMENSION_SUCESS;

    constructor(public payload: any) { }
}

export class GetDimensionFailAction implements Action {
    readonly type = DimensionActionTypes.GET_DIMENSION_FAIL;

    constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type DimensionActions
    = GetDimensionAction
    | InitDimensionAction
    | GetDimensionSuccessAction
    | GetDimensionHBLAction
    | GetDimensionHBLSuccessAction
    | GetDimensionFailAction;
