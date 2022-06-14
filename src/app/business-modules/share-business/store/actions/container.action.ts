import { Action } from '@ngrx/store';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 */
export enum ContainerActionTypes {
    INIT_CONTAINER = '[Container] Init',
    GET_CONTAINER = '[Container] Get',
    GET_CONTAINER_SUCESS = '[Container] Get Success',
    GET_CONTAINER_FAIL = '[Container] Get Fail',
    ADD_CONTAINER = '[Contaner] Add',
    ADD_CONTAINERS = '[Contaner] Add Multiple',
    DELETE_CONTAINER = '[Container] Delete',
    SAVE_CONTAINER = '[Container] Save',
    CLEAR_CONTAINER = '[Container] Clear'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful 
 * type checking in reducer functions.
 */

export class InitContainerAction implements Action {
    readonly type = ContainerActionTypes.INIT_CONTAINER;

    constructor(public payload: any[]) { }
}

export class GetContainerAction implements Action {
    readonly type = ContainerActionTypes.GET_CONTAINER;

    constructor(public payload: any) { }
}

export class GetContainerSuccessAction implements Action {
    readonly type = ContainerActionTypes.GET_CONTAINER_SUCESS;

    constructor(public payload: any) { }
}

export class GetContainerFailAction implements Action {
    readonly type = ContainerActionTypes.GET_CONTAINER_FAIL;

    constructor(public payload: any) { }
}

export class AddContainerAction implements Action {
    readonly type = ContainerActionTypes.ADD_CONTAINER;

    constructor(public payload: any) { }
}

export class AddContainersAction implements Action {
    readonly type = ContainerActionTypes.ADD_CONTAINERS;

    constructor(public payload: any[]) { }
}

export class DeleteContainerAction implements Action {
    readonly type = ContainerActionTypes.DELETE_CONTAINER;

    constructor(public payload: number) { }
}

export class SaveContainerAction implements Action {
    readonly type = ContainerActionTypes.SAVE_CONTAINER;

    constructor(public payload: any[]) { }
}

export class ClearContainerAction implements Action {
    readonly type = ContainerActionTypes.CLEAR_CONTAINER;

    constructor() { }
}



/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type ContainerAction =
    InitContainerAction
    | GetContainerAction
    | GetContainerFailAction
    | GetContainerSuccessAction
    | AddContainerAction
    | DeleteContainerAction
    | SaveContainerAction
    | ClearContainerAction
    | AddContainersAction;
