import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AccountingRepo } from "@repositories";
import { ReceiptActionTypes, LoadListCustomerPaymentSuccess, LoadListCustomerPaymentFail } from "../actions";
import { map, catchError, switchMap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Action } from "@ngrx/store";

@Injectable()
export class ReceiptEffects {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,
    ) { }

    getListCustomerPaymentEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(ReceiptActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.getListCustomerPayment(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => of(LoadListCustomerPaymentFail())),
                        map((data: CommonInterface.IResponsePaging) => LoadListCustomerPaymentSuccess(data)),
                    )
            )
        ));
}
