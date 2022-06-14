import { CsShipmentSurcharge } from "src/app/shared/models";
import { SurchargeAction, SurchargeActionTypes } from "../actions";

export interface ISurcharge {
    buyings: CsShipmentSurcharge[];
    sellings: CsShipmentSurcharge[];
    obhs: CsShipmentSurcharge[];
    isLoading: boolean;
}

export const initialState: ISurcharge = {
    buyings: [],
    sellings: [],
    obhs: [],
    isLoading: false
};


export function SurchargeReducer(state = initialState, action: SurchargeAction): ISurcharge {
    switch (action.type) {
        case SurchargeActionTypes.GET_BUYING: {
            return { ...state, isLoading: true };
        }

        case SurchargeActionTypes.GET_SELLING: {
            return { ...state, isLoading: true };
        }

        case SurchargeActionTypes.GET_OBH: {
            return { ...state, isLoading: true };
        }

        case SurchargeActionTypes.GET_BUYING_SUCCESS: {
            for (const charge of action.payload) {
                charge.invoiceDate = (!!charge.invoiceDate || (!!charge.invoiceDate && charge.invoiceDate.startDate)) ? { startDate: new Date(charge.invoiceDate), endDate: new Date(charge.invoiceDate) } : null;
                charge.exchangeDate = (!!charge.exchangeDate || (!!charge.exchangeDate && !!charge.exchangeDate.startDate)) ? { startDate: new Date(charge.exchangeDate), endDate: new Date(charge.exchangeDate) } : null;
            }
            return {
                ...state,
                buyings: action.payload,
                isLoading: false
            };
        }
        case SurchargeActionTypes.ADD_BUYING: {
            return {
                ...state,
                buyings: [...state.buyings, action.payload]
            };
        }
        case SurchargeActionTypes.DELETE_BUYING: {
            return { ...state, buyings: [...state.buyings.slice(0, action.payload), ...state.buyings.slice(action.payload + 1)] };
        }

        case SurchargeActionTypes.SAVE_BUYING: {
            return {
                ...state,
                buyings: action.payload
            };

        }

        // selling
        case SurchargeActionTypes.GET_SELLING_SUCCESS: {
            for (const charge of action.payload) {
                charge.invoiceDate = (!!charge.invoiceDate || (!!charge.invoiceDate && charge.invoiceDate.startDate)) ? { startDate: new Date(charge.invoiceDate), endDate: new Date(charge.invoiceDate) } : null;
                charge.exchangeDate = (!!charge.exchangeDate || (!!charge.exchangeDate && !!charge.exchangeDate.startDate)) ? { startDate: new Date(charge.exchangeDate), endDate: new Date(charge.exchangeDate) } : null;
            }
            return {
                ...state,
                sellings: action.payload,
                isLoading: false

            };
        }
        case SurchargeActionTypes.ADD_SELLING: {
            return {
                ...state,
                sellings: [...state.sellings, action.payload]
            };

        }
        case SurchargeActionTypes.DELETE_SELLING: {
            return { ...state, sellings: [...state.sellings.slice(0, action.payload), ...state.sellings.slice(action.payload + 1)] };
        }

        case SurchargeActionTypes.SAVE_SELLING: {
            return {
                ...state,
                sellings: action.payload
            };

        }

        // obh
        case SurchargeActionTypes.GET_OBH_SUCCESS: {
            for (const charge of action.payload) {
                charge.invoiceDate = (!!charge.invoiceDate || (!!charge.invoiceDate && charge.invoiceDate.startDate)) ? { startDate: new Date(charge.invoiceDate), endDate: new Date(charge.invoiceDate) } : null;
                charge.exchangeDate = (!!charge.exchangeDate || (!!charge.exchangeDate && !!charge.exchangeDate.startDate)) ? { startDate: new Date(charge.exchangeDate), endDate: new Date(charge.exchangeDate) } : null;
            }
            return {
                ...state,
                obhs: action.payload,
                isLoading: false
            };
        }
        case SurchargeActionTypes.ADD_OBH: {
            return {
                ...state,
                obhs: [...state.obhs, action.payload]
            };

        }

        case SurchargeActionTypes.DELETE_OBH: {
            return { ...state, obhs: [...state.obhs.slice(0, action.payload), ...state.obhs.slice(action.payload + 1)] };
        }

        case SurchargeActionTypes.SAVE_OBH: {
            return {
                ...state,
                obhs: action.payload
            };
        }

        default: {
            return state;
        }
    }
}
