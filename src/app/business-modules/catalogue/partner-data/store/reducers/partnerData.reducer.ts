import { Action, createReducer, on } from '@ngrx/store';
import * as Types from '../actions';


// export interface IPartnerDataSearchParamsState {
//     searchParams: any;

// }
// export const initialState: IPartnerDataSearchParamsState = {
//     searchParams: {}
// };

export interface PartnerListState {
    partners: any
    isLoading: boolean;
    isLoaded: boolean;
    dataSearch: any;
    pagingData: any;
    
}

export const initialState: PartnerListState = {
    partners: { data: [], totalItems: 0, },
    isLoading: false,
    isLoaded: false,
    pagingData: { page: 1, pageSize: 15 },
    dataSearch: {}
};

const partnerDataReducer = createReducer(
    initialState,
    on(Types.SearchList, (state: PartnerListState, data: any) => ({
        ...state, dataSearch: { ...data.payload }
    })),
    on(
        Types.LoadListPartner, (state: PartnerListState, payload: CommonInterface.IParamPaging) => {
            return { ...state, isLoading: true, pagingData: { page: payload.page, pageSize: payload.size } };
        }
    ),
    on(
        Types.LoadListPartnerSuccess, (state: PartnerListState, payload: CommonInterface.IResponsePaging) => {
            return { ...state, partners: payload, isLoading: false, isLoaded: true };
        }
    )
);

export function reducer(state: any | undefined, action: Action) {
    return partnerDataReducer(state, action);
};

