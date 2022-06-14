import { Action } from '@ngrx/store';

export enum OtherChargeActionTypes {
    INIT_OTHER_CHARGE = '[OTHER_CHARGE] INIT',

    GET_OTHER_CHARGE_SHIPMENT = '[OTHER_CHARGE] Get Shipment',
    GET_OTHER_CHARGE_SHIPMENT_SUCCESS = '[OTHER_CHARGE] Get Shipment Success',
    GET_OTHER_CHARGE_SHIPMENT_FAIL = '[OTHER_CHARGE] Get Shipment Fail',

    GET_OTHER_CHARGE_HBL = '[OTHER_CHARGE] Get HBL',
    GET_OTHER_CHARGE_HBL_SUCCESS = '[OTHER_CHARGE] Get HBL Success',
    GET_OTHER_CHARGE_HBL_FAIL = '[OTHER_CHARGE] Get HBL Fail',
}

export class InitShipmentOtherChargeAction implements Action {
    readonly type = OtherChargeActionTypes.INIT_OTHER_CHARGE;
    constructor(public payload: any) { }
}
export class GetShipmentOtherChargeAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_SHIPMENT;
    constructor(public payload: any) { }
}
export class GetShipmentOtherChargeSuccessAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_SHIPMENT_SUCCESS;
    constructor(public payload: any) { }
}
export class GetShipmentOtherChargeFailAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_SHIPMENT_FAIL;
    constructor(public payload: any) { }
}

export class GetHBLOtherChargeAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_HBL;
    constructor(public payload: any) { }
}
export class GetHBLOtherChargeSuccessAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_HBL_SUCCESS;
    constructor(public payload: any) { }
}
export class GetHBLOtherChargeFailAction implements Action {
    readonly type = OtherChargeActionTypes.GET_OTHER_CHARGE_HBL_FAIL;
    constructor(public payload: any) { }
}

export type OtherChargeActions
    = InitShipmentOtherChargeAction
    | GetShipmentOtherChargeAction
    | GetShipmentOtherChargeSuccessAction
    | GetShipmentOtherChargeFailAction
    | GetHBLOtherChargeAction
    | GetHBLOtherChargeSuccessAction
    | GetHBLOtherChargeFailAction;

