import { Action } from '@ngrx/store';


export enum OPSActionTypes {
    SEARCH_LIST = '[Ops Transaction] Search List',

    LOAD_LIST = '[Ops Transaction] Load List',
    LOAD_LIST_SUCCESS = '[Ops Transaction] Load Success',
    LOAD_LIST_FAIL = '[Ops Transaction] Load Fail',

    GET_DETAIL = '[Ops Transaction] Get Detail',
    GET_DETAIL_SUCCESS = '[Ops Transaction] Get Detail Success',
    GET_DETAIL_FAIL = '[Ops Transaction] Get Detail Fail',
};

export class OPSTransactionSearchListAction implements Action {
    readonly type = OPSActionTypes.SEARCH_LIST;
    constructor(public payload: any) { }
}
export class OPSTransactionLoadListAction implements Action {
    readonly type = OPSActionTypes.LOAD_LIST;
    constructor(public payload: CommonInterface.IParamPaging) { }
}
export class OPSTransactionLoadListSuccessAction implements Action {
    readonly type = OPSActionTypes.LOAD_LIST_SUCCESS;
    constructor(public payload: any) { }
}

export class OPSTransactionLoadListFailAction implements Action {
    readonly type = OPSActionTypes.LOAD_LIST_FAIL;

    constructor(public payload: any) { }
}
export class OPSTransactionGetDetailAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL;
    constructor(public payload: any) { }
}

export class OPSTransactionGetDetailSuccessAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL_SUCCESS;
    constructor(public payload: any) { }
}

export class OPSTransactionGetDetailFailAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL_FAIL;
    constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type OPSActions
    = OPSTransactionGetDetailAction
    | OPSTransactionSearchListAction
    | OPSTransactionLoadListAction
    | OPSTransactionLoadListSuccessAction
    | OPSTransactionLoadListFailAction
    | OPSTransactionGetDetailFailAction
    | OPSTransactionGetDetailSuccessAction;
