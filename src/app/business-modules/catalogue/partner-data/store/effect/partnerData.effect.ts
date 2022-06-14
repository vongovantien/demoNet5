import { PartnerDataActionTypes, LoadListPartnerSuccess } from './../actions/partnerData.action';
import { Injectable } from "@angular/core";
import { createEffect, ofType, Actions } from "@ngrx/effects";
import { switchMap, map, catchError } from "rxjs/operators";
import { Observable, EMPTY } from "rxjs";
import { AccountingRepo, CatalogueRepo } from "@repositories";
import { Action } from '@ngrx/store';

@Injectable()
export class PartnerDataEffect {

    constructor(
        private actions$: Actions,
        private _catalogueRepo: CatalogueRepo,
    ) { }

    getListPartnerEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(PartnerDataActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._catalogueRepo.getListPartner(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListPartnerSuccess(data)),

                    )
            )
        ));
}