import { Action } from '@ngrx/store';

export enum HBLActionTypes {
    GET_LIST = '[HBL] Get List',
    GET_LIST_SUCCESS = '[HBL] Get List Success',
    GET_LIST_FAIL = '[HBL] Get List Fail',

    GET_DETAIL = '[HBL] Get Detail',
    GET_DETAIL_SUCCESS = '[HBL] Get Detail Success',
    GET_DETAIL_FAIL = '[HBL] Get Detail Fail',

    INIT_PROFIT = '[HBL] Init Profit',
    GET_PROFIT = '[HBL] Get Profit',
    GET_PROFIT_SUCCESS = '[HBL] Get Profit Success',
    GET_PROFIT_FAIL = '[HBL] Get Profit Fail',

    GET_CONTAINERS = '[HBL] Get Containers',
    GET_CONTAINERS_SUCCESS = '[HBL] Get Containers Success',
    GET_CONTAINERS_FAIL = '[HBL] Get Containers Fail',
}


export class GetDetailHBLAction implements Action {
    readonly type = HBLActionTypes.GET_DETAIL;

    constructor(public payload: any) { }
}

export class GetDetailHBLSuccessAction implements Action {
    readonly type = HBLActionTypes.GET_DETAIL_SUCCESS;

    constructor(public payload: any) { }
}

export class GetDetailHBLFailAction implements Action {
    readonly type = HBLActionTypes.GET_DETAIL_FAIL;

    constructor(public payload: any) { }
}

export class GetListHBLAction implements Action {
    readonly type = HBLActionTypes.GET_LIST;

    constructor(public payload: any) { }
}

export class GetListHBLSuccessAction implements Action {
    readonly type = HBLActionTypes.GET_LIST_SUCCESS;

    constructor(public payload: any) { }
}

export class GetListHBLFailAction implements Action {
    readonly type = HBLActionTypes.GET_LIST_FAIL;

    constructor(public payload: any) { }
}

/* Profit */
export class InitProfitHBLAction implements Action {
    readonly type = HBLActionTypes.INIT_PROFIT;

    constructor() { }
}
export class GetProfitHBLAction implements Action {
    readonly type = HBLActionTypes.GET_PROFIT;

    constructor(public payload: any) { }
}
export class GetProfitHBLSuccessAction implements Action {
    readonly type = HBLActionTypes.GET_PROFIT_SUCCESS;

    constructor(public payload: any) { }
}
export class GetProfitHBLFailFailAction implements Action {
    readonly type = HBLActionTypes.GET_PROFIT_FAIL;

    constructor(public payload: any) { }
}

/* Containers */

export class GetContainersHBLAction implements Action {
    readonly type = HBLActionTypes.GET_CONTAINERS;

    constructor(public payload: any) { }
}

export class GetContainersHBLSuccessAction implements Action {
    readonly type = HBLActionTypes.GET_CONTAINERS_SUCCESS;

    constructor(public payload: any) { }
}

export class GetContainersHBLFailAction implements Action {
    readonly type = HBLActionTypes.GET_CONTAINERS_FAIL;

    constructor(public payload: any) { }
}

export type HBLActions =
    GetListHBLAction
    | GetListHBLSuccessAction
    | GetListHBLFailAction
    | GetDetailHBLAction
    | GetDetailHBLSuccessAction
    | GetDetailHBLFailAction
    | GetProfitHBLAction
    | GetProfitHBLSuccessAction
    | GetProfitHBLFailFailAction
    | GetContainersHBLAction
    | GetContainersHBLSuccessAction
    | GetContainersHBLFailAction
    | InitProfitHBLAction;

