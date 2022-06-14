import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AccountingRepo } from "@repositories";
import { SOAActionTypes, LoadListSOASuccess } from "../actions";
import { map, catchError, switchMap, mergeMap } from "rxjs/operators";
import { EMPTY, Observable } from "rxjs";
import { Action } from "@ngrx/store";

@Injectable()
export class SOAEffect {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,

    ) { }

    getListSOAEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(SOAActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.getListSOA(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListSOASuccess(data)),

                    )
            )
        ));
}
