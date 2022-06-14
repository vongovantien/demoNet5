import { AdvancePaymentActionTypes, LoadListAdvancePaymentSuccess } from './../actions/advance-payment.action';
import { Injectable } from "@angular/core";
import { createEffect, ofType, Actions } from "@ngrx/effects";
import { switchMap, map, catchError } from "rxjs/operators";
import { Observable, EMPTY } from "rxjs";
import { AccountingRepo } from "@repositories";
import { Action } from '@ngrx/store';

@Injectable()
export class AdvancePaymentEffect {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,
    ) { }

    getListAdvancePaymentEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AdvancePaymentActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.getListAdvancePayment(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListAdvancePaymentSuccess(data)),

                    )
            )
        ));
}