import { TransactionActions, TransactionActionTypes } from "../actions";
import { CsTransaction } from "src/app/shared/models";
import { on } from "cluster";
import { createReducer } from "@ngrx/store";

export interface ITransactionProfit {
    hblid: string;
    hblNo: string;
    houseBillTotalCharge: {
        totalBuyingUSD: number,
        totalSellingUSD: number,
        totalOBHUSD: number,
        totalBuyingLocal: number,
        totalSellingLocal: number,
        totalOBHLocal: number
    };
    profitLocal: string;
    profitUSD: string;
}

export interface ITransactionState {
    profits: ITransactionProfit[];
    cstransaction: CsTransaction;
    cstransactions: CsTransaction[];
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
}

export const initState: ITransactionState = {
    profits: [],
    cstransaction: new CsTransaction(),
    cstransactions: [],
    isLoading: false,
    isLoaded: false,
    dataSearch: {},
    pagingData: { page: 1, pageSize: 15 }
};


export function TransactionReducer(state = initState, action: TransactionActions): ITransactionState {
    switch (action.type) {
        case TransactionActionTypes.SEARCH_LIST: {
            return { ...state, dataSearch: action.payload, isLoading: true, isLoaded: false, pagingData: { page: 1, pageSize: 15 } };
        }
        case TransactionActionTypes.LOAD_LIST: {
            return { ...state, isLoading: true, isLoaded: false, pagingData: { page: action.payload.page, pageSize: action.payload.size } };
        }

        case TransactionActionTypes.LOAD_LIST_SUCCESS: {
            return { ...state, cstransactions: action.payload, isLoading: false, isLoaded: true };
        }

        case TransactionActionTypes.LOAD_LIST_FAIL: {
            return { ...state, isLoading: false, isLoaded: false };
        }

        case TransactionActionTypes.GET_PROFIT: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case TransactionActionTypes.GET_PROFIT_SUCCESS: {
            return { ...state, profits: [...action.payload], isLoaded: true, isLoading: false };
        }

        case TransactionActionTypes.GET_DETAIL: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case TransactionActionTypes.GET_DETAIL_SUCCESS: {
            return { ...state, cstransaction: action.payload };
        }

        case TransactionActionTypes.UPDATE: {
            return { ...state, isLoaded: false, isLoading: true };
        }

        case TransactionActionTypes.UPDATE_SUCCESS: {
            return { ...state, ...state.cstransaction, cstransaction: action.payload };
        }

        default: {
            return state;
        }
    }
}
