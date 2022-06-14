import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AccountingRepo } from "@repositories";
import { map, catchError, switchMap } from "rxjs/operators";
import { EMPTY, Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { AccountPayablePaymentActionTypes, LoadListAccountPayableSuccess } from "../actions";

@Injectable()
export class AccountPayableEffects {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,
    ) { }

    getListAccountPayableEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AccountPayablePaymentActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.payablePaging(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListAccountPayableSuccess(data)),

                    )
            )
        ));
}
