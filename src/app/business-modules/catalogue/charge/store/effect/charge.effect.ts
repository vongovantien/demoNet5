import { ChargeActionTypes, LoadListChargeSuccess } from './../actions/charge.action';
import { Injectable } from "@angular/core";
import { createEffect, ofType, Actions } from "@ngrx/effects";
import { switchMap, map, catchError } from "rxjs/operators";
import { Observable, EMPTY } from "rxjs";
import { CatalogueRepo } from "@repositories";
import { Action } from '@ngrx/store';

@Injectable()
export class ChargeEffect {

    constructor(
        private actions$: Actions,
        private _catalogueRepo: CatalogueRepo,
    ) { }

    getListChargeEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(ChargeActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._catalogueRepo.getListCharge(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListChargeSuccess(data)),
                    )
            )
        ));
}