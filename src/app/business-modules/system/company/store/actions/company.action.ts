import { Action } from "@ngrx/store";

export enum CompanyActionTypes {
    LOAD_COMPANY = '[COMPANY] load',
    LOAD_COMPANY_SUCCESS = '[COMPANY] load success',
    LOAD_COMPANY_FAILURE = '[COMPANY] load failure',
    // TODO delete/detail
}

export class LoadCompanyAction implements Action {
    readonly type = CompanyActionTypes.LOAD_COMPANY;
    constructor(public payload: any) { }
}


export class LoadCompanySuccessAction implements Action {
    readonly type = CompanyActionTypes.LOAD_COMPANY_SUCCESS;

    constructor(public payload: any) { }
}

export class LoadCompanyFailureAction implements Action {
    readonly type = CompanyActionTypes.LOAD_COMPANY_FAILURE;

    constructor(public payload: any) { }
}

export type CompanyAction = LoadCompanyAction | LoadCompanySuccessAction | LoadCompanyFailureAction;



