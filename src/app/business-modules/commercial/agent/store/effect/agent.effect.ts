import { AgentActionTypes, LoadListAgentSuccess } from '../actions/agent.action';
import { Injectable } from "@angular/core";
import { createEffect, ofType, Actions } from "@ngrx/effects";
import { switchMap, map, catchError } from "rxjs/operators";
import { Observable, EMPTY } from "rxjs";
import { CatalogueRepo } from "@repositories";
import { Action } from '@ngrx/store';

@Injectable()
export class AgentEffect {

    constructor(
        private actions$: Actions,
        private _catalogueRepo: CatalogueRepo,
    ) { }

    getListAgentEffect$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AgentActionTypes.LOAD_LIST),
            switchMap(
                (param: CommonInterface.IParamPaging) => this._catalogueRepo.getListPartner(param.page, param.size, param.dataSearch)
                    .pipe(
                        catchError(() => EMPTY),
                        map((data: CommonInterface.IResponsePaging) => LoadListAgentSuccess(data)),
                    )
            )
        ));
}
