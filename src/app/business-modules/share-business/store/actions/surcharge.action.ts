import { Action } from '@ngrx/store';
import { CsShipmentSurcharge } from 'src/app/shared/models';


export enum SurchargeActionTypes {
    GET_BUYING = '[BUYING CHARGE] Get',
    GET_BUYING_SUCCESS = '[BUYING CHARGE] Get Success',
    GET_BUYING_FAIL = '[BUYING CHARGE] Get Fail',
    ADD_BUYING = '[BUYING CHARGE] Add',
    DELETE_BUYING = '[BUYING CHARGE] Delete',
    SAVE_BUYING = '[BUYING CHARGE] SAVE',

    GET_SELLING = '[SELLING CHARGE] Get',
    GET_SELLING_SUCCESS = '[SELLING CHARGE] Get Success',
    GET_SELLING_FAIL = '[SELLING CHARGE] Get Fail',
    ADD_SELLING = '[SELLING CHARGE] Add',
    DELETE_SELLING = '[SELLING CHARGE] Delete',
    SAVE_SELLING = '[SELLING CHARGE] SAVE',

    GET_OBH = '[OBH CHARGE] Get',
    GET_OBH_SUCCESS = '[OBH CHARGE] Get Success',
    GET_OBH_FAIL = '[OBH CHARGE] Get Fail',
    ADD_OBH = '[OBH CHARGE] Add',
    DELETE_OBH = '[OBH CHARGE] Delete',
    SAVE_OBH = '[OBH CHARGE] SAVE',


}

/* BUYING */
export class GetBuyingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.GET_BUYING;
    constructor(public payload?: any) { }
}
export class GetBuyingSurchargeSuccessAction implements Action {
    readonly type = SurchargeActionTypes.GET_BUYING_SUCCESS;
    constructor(public payload: CsShipmentSurcharge[]) { }
}
export class GetBuyingSurchargeFailAction implements Action {
    readonly type = SurchargeActionTypes.GET_BUYING_FAIL;
    constructor(public payload: any) { }
}
export class AddBuyingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.ADD_BUYING;
    constructor(public payload: CsShipmentSurcharge) { }
}
export class DeleteBuyingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.DELETE_BUYING;
    constructor(public payload: number) { }
}
export class SaveBuyingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.SAVE_BUYING;
    constructor(public payload: CsShipmentSurcharge[]) { }
}

/* Selling */
export class GetSellingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.GET_SELLING;
    constructor(public payload: any) { }
}
export class GetSellingSurchargeSuccessAction implements Action {
    readonly type = SurchargeActionTypes.GET_SELLING_SUCCESS;
    constructor(public payload: CsShipmentSurcharge[]) { }
}
export class GetSellingSurchargeFailAction implements Action {
    readonly type = SurchargeActionTypes.GET_SELLING_FAIL;
    constructor(public payload: any) { }
}
export class AddSellingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.ADD_SELLING;
    constructor(public payload: CsShipmentSurcharge) { }
}
export class DeleteSellingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.DELETE_SELLING;
    constructor(public payload: number) { }
}
export class SaveSellingSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.SAVE_SELLING;
    constructor(public payload: CsShipmentSurcharge[]) { }
}

/* OBH */
export class GetOBHSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.GET_OBH;
    constructor(public payload: any) { }
}
export class GetOBHSurchargeSuccessAction implements Action {
    readonly type = SurchargeActionTypes.GET_OBH_SUCCESS;
    constructor(public payload: CsShipmentSurcharge[]) { }
}
export class GetOBHSurchargeFailAction implements Action {
    readonly type = SurchargeActionTypes.GET_OBH_FAIL;
    constructor(public payload: any) { }
}
export class AddOBHSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.ADD_OBH;
    constructor(public payload: CsShipmentSurcharge) { }
}
export class DeleteOBHSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.DELETE_OBH;
    constructor(public payload: number) { }
}
export class SaveOBHSurchargeAction implements Action {
    readonly type = SurchargeActionTypes.SAVE_OBH;
    constructor(public payload: CsShipmentSurcharge[]) { }
}



export type SurchargeAction =
    GetBuyingSurchargeAction
    | GetBuyingSurchargeSuccessAction
    | GetBuyingSurchargeFailAction
    | AddBuyingSurchargeAction
    | DeleteBuyingSurchargeAction
    | SaveBuyingSurchargeAction
    | GetSellingSurchargeAction
    | GetSellingSurchargeSuccessAction
    | GetSellingSurchargeFailAction
    | AddSellingSurchargeAction
    | DeleteSellingSurchargeAction
    | SaveSellingSurchargeAction
    | GetOBHSurchargeAction
    | GetOBHSurchargeSuccessAction
    | GetOBHSurchargeFailAction
    | AddOBHSurchargeAction
    | DeleteOBHSurchargeAction
    | SaveOBHSurchargeAction;




