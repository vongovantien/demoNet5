import { OpsTransaction } from "@models";
import { OPSActions, OPSActionTypes } from "../actions/operation.action";

export interface IOPSTransactionState {
    opstransaction: OpsTransaction;
    opsTransations: any;
    dataSearch: any;
    isLoading: boolean;
    isLoaded: boolean;
    pagingData: any;
};

const initialState: IOPSTransactionState = {
    opstransaction: new OpsTransaction(),
    opsTransations: {
        data: {
            opsTransactions: [],
        },
        toTalFinish: 0,
        toTalInProcessing: 0,
        totalCanceled: 0,
        totalOverdued: 0
    },
    dataSearch: {},
    isLoaded: false,
    isLoading: false,
    pagingData: { page: 1, pageSize: 15 }
};


export function opsReducer(state = initialState, action: OPSActions): IOPSTransactionState {
    switch (action.type) {
        case OPSActionTypes.SEARCH_LIST: {
            return { ...state, dataSearch: action.payload, isLoading: true, isLoaded: false, pagingData: { page: 1, pageSize: 15 } };
        }

        case OPSActionTypes.LOAD_LIST: {
            return { ...state, isLoading: true, isLoaded: false, pagingData: { page: action.payload.page, pageSize: action.payload.size } };
        }

        case OPSActionTypes.LOAD_LIST_SUCCESS: {
            return { ...state, opsTransations: action.payload, isLoading: false, isLoaded: true };
        }

        case OPSActionTypes.LOAD_LIST_FAIL: {
            return { ...state, isLoading: false, isLoaded: false };
        }

        case OPSActionTypes.GET_DETAIL: {
            return { ...state, isLoading: true, isLoaded: false };
        }

        case OPSActionTypes.GET_DETAIL_SUCCESS: {
            return { ...state, opstransaction: action.payload };
        }

        default: {
            return state;
        }
    }
}