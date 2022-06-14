import { createAction, props } from '@ngrx/store';
import { ISearchCustomClearance } from '../../custom-clearance/components/form-search-custom-clearance/form-search-custom-clearance.component';


export enum ClearanceActionTypes {
    SEARCH_LIST = '[Custom Declaration] Search List',

    LOAD_LIST = '[Custom Declaration] Load List',
    LOAD_LIST_SUCCESS = 'Custom Declaration] Load Success',
    LOAD_LIST_FAIL = '[Custom Declaration] Load Fail',

    GET_DETAIL = '[Custom Declaration] Get Detail',
    GET_DETAIL_SUCCESS = '[Custom Declaration] Get Detail Success',
    GET_DETAIL_FAIL = '[Custom Declaration] Get Detail Fail',
};


export const CustomsDeclarationSearchListAction = createAction(ClearanceActionTypes.SEARCH_LIST, props<Partial<ISearchCustomClearance>>());
export const CustomsDeclarationLoadListAction = createAction(ClearanceActionTypes.LOAD_LIST, props<CommonInterface.IParamPaging>());
export const CustomsDeclarationLoadListSuccessAction = createAction(ClearanceActionTypes.LOAD_LIST_SUCCESS, props<CommonInterface.IResponsePaging>());