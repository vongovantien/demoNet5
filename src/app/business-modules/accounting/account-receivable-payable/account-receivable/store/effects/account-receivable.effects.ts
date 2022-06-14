import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AccountingRepo } from "@repositories";
import { AccountReceivableActionTypes, LoadListAccountReceivableSuccess } from "../actions";
import { map, catchError, switchMap } from "rxjs/operators";
import { EMPTY, Observable } from "rxjs";
import { Action } from "@ngrx/store";

@Injectable()
export class AccountReceivableEffects {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,
    ) { }

    getListAccountReceivableEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AccountReceivableActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.receivablePaging(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListAccountReceivableSuccess(data)),

                    )
            )
        ));
}
