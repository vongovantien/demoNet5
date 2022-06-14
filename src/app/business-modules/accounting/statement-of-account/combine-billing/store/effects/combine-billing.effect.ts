import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AccountingRepo } from "@repositories";
import { CombineBillingActionTypes, LoadListCombineBillingSuccess } from "../actions";
import { map, catchError, switchMap } from "rxjs/operators";
import { EMPTY, Observable } from "rxjs";
import { Action } from "@ngrx/store";

@Injectable()
export class CombineBillingEffect {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,

    ) { }

    getListCombineBillingEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(CombineBillingActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.getListCombineBilling(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListCombineBillingSuccess(data)),

                    )
            )
        ));
}
