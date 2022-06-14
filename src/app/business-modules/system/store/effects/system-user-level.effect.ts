import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { SystemRepo } from '@repositories';

import { SystemUserLevelActionTypes, SystemUserLevelActions, SystemLoadUserLevelSuccessAction } from '../actions';

import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { UserLevel } from 'src/app/shared/models/system/userlevel';

@Injectable()
export class SystemUserLevelEffects {

    constructor(
        private actions$: Actions,
        private _system: SystemRepo
    ) { }

    @Effect()
    getSystemUserLevelffect: Observable<Action> = this.actions$
        .pipe(
            ofType<SystemUserLevelActions>(SystemUserLevelActionTypes.SYSTEM_LOAD_USER_LEVEL),
            map((param: any) => param.payload),
            mergeMap(
                (param: any) => this._system.queryUserLevels(param)
                    .pipe(
                        map((data: UserLevel[]) => new SystemLoadUserLevelSuccessAction(data)),
                    )
            )
        );
}
