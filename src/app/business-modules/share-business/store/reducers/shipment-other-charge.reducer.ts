import { CsOtherCharge } from "@models";
import { OtherChargeActions, OtherChargeActionTypes } from "../actions/shipment-other-charge.action";


export interface IOtherChargeState {
    otherCharges: CsOtherCharge[];
    isLoading?: boolean;
    isLoaded?: boolean;
}

const initialState: IOtherChargeState = {
    otherCharges: [],
    isLoading: false,
    isLoaded: false
};


export function shipmentOtherChargeReducer(state = initialState, action: OtherChargeActions): IOtherChargeState {
    switch (action.type) {
        case OtherChargeActionTypes.INIT_OTHER_CHARGE: {
            return { ...state, otherCharges: action.payload };
        }

        case OtherChargeActionTypes.GET_OTHER_CHARGE_SHIPMENT: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case OtherChargeActionTypes.GET_OTHER_CHARGE_HBL: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case OtherChargeActionTypes.GET_OTHER_CHARGE_SHIPMENT_SUCCESS: {
            return { ...state, otherCharges: action.payload, isLoaded: false, isLoading: true };
        }

        case OtherChargeActionTypes.GET_OTHER_CHARGE_HBL_SUCCESS: {
            return { ...state, otherCharges: action.payload, isLoaded: false, isLoading: true };
        }

        default: {
            return state;
        }
    }
}
