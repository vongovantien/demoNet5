import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { OPSActions, OPSActionTypes, OPSTransactionGetDetailSuccessAction, OPSTransactionGetDetailFailAction, OPSTransactionLoadListSuccessAction, OPSTransactionLoadListFailAction } from '../actions/operation.action';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { DocumentationRepo, OperationRepo } from '@repositories';
import { OpsTransaction } from '@models';
import { ClearanceActionTypes, CustomsDeclarationLoadListSuccessAction } from '../actions/custom-clearance.action';

@Injectable()
export class OperationEffects {

    @Effect()
    getDetailShipmentOperationEffect$: Observable<Action> = this.actions$.
        pipe(
            ofType<OPSActions>(OPSActionTypes.GET_DETAIL),
            map((payload: any) => payload.payload),
            mergeMap(
                (id: string) => this._documentRepo.getDetailShipment(id)
                    .pipe(
                        map((data: any) => new OPSTransactionGetDetailSuccessAction(new OpsTransaction(data))),
                        catchError(err => of(new OPSTransactionGetDetailFailAction(err)))
                    )
            )
        );

    @Effect()
    getListOPSShipmentEffect$: Observable<Action> = this.actions$.
        pipe(
            ofType<OPSActions>(OPSActionTypes.LOAD_LIST),
            map((payload: any) => payload.payload),
            mergeMap(
                (param: any) => this._documentRepo.getListShipment(param.page, param.size, param.dataSearch)
                    .pipe(
                        map((data: any) => new OPSTransactionLoadListSuccessAction(data)),
                        catchError(err => of(new OPSTransactionLoadListFailAction(err)))
                    )
            )
        );

    @Effect()
    getListCustomClearanceEffect$: Observable<Action> = this.actions$.
            pipe(
                ofType(ClearanceActionTypes.LOAD_LIST),
                switchMap(
                    (param: CommonInterface.IParamPaging) => this._operationRepo.getListCustomDeclaration(param.page, param.size, param.dataSearch)
                        .pipe(
                            catchError(() => EMPTY),
                            map((data: CommonInterface.IResponsePaging) => CustomsDeclarationLoadListSuccessAction(data)),
                        )
                )
            );
    constructor(
        private actions$: Actions,
        private _documentRepo: DocumentationRepo,
        private _operationRepo: OperationRepo
    ) { }



}