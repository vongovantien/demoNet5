import { createAction, props } from '@ngrx/store';

export enum PartnerDataActionTypes {
    SEARCH_LIST = '[PartnerDataAction] Search List',
    LOAD_LIST = '[PartnerDataAction] Load List',
    LOAD_LIST_SUCCESS = '[PartnerDataAction] Load List Success]'
};

export const SearchList = createAction(PartnerDataActionTypes.SEARCH_LIST, props<{ payload: any }>());
export const LoadListPartner = createAction(PartnerDataActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const LoadListPartnerSuccess = createAction(PartnerDataActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());