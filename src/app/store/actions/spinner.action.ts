import { Action } from '@ngrx/store';

export enum SpinnerActionTypes {
    SHOW = '[Spinner] Show',
    HIDE = '[Spinner] Hide'
}

export class ShowSpinnerAction implements Action {
    readonly type = SpinnerActionTypes.SHOW;

    constructor(public payload: any) { }
}

export class HideSpinnerAction implements Action {
    readonly type = SpinnerActionTypes.HIDE;

    constructor(public payload: any) { }
}

export type SpinnerActions
    = ShowSpinnerAction
    | HideSpinnerAction;
