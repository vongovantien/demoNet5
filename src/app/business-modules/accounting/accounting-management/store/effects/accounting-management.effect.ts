import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { AccountingRepo } from '@repositories';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { AccountingManagementActionTypes, GetAgreementForInvoice, IAccMngtContractInvoiceCriteria, IAgreementInvoice, LoadListAccountingMngtSuccess } from '../actions';
import { PartnerOfAcctManagementResult } from '@models';
import { SystemConstants } from '@constants';

@Injectable()
export class AccountingManagementEffects {

    constructor(
        private actions$: Actions,
        private _accountingRepo: AccountingRepo,
    ) { }

    @Effect() effectOldSyntax$: Observable<Action> = this.actions$.pipe(ofType('ACTIONTYPE')); // ! cú pháp cũ

    effectNewSystax$: Observable<Action> = createEffect(() => this.actions$.pipe(ofType('ACTIONTYPE'))); // ? Cú pháp mới

    getAgreementBy$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AccountingManagementActionTypes.SELECT_PARTNER, AccountingManagementActionTypes.SELECT_REQUESTER),
            map((payload: PartnerOfAcctManagementResult) =>
                ({
                    partnerId: payload.partnerId,
                    service: (!!payload.service && payload.service.split(";").length > 1) ? payload.service.split(";")[0] : payload.service,
                    // *lấy service của charge đầu tiên theo partner
                    office: this.getOfficeByCurrentUser()
                })
            ),
            mergeMap(
                (data: IAccMngtContractInvoiceCriteria) => this._accountingRepo.getAgreementForInvoice(data)
                    .pipe(
                        map((d: IAgreementInvoice) => GetAgreementForInvoice(d)),
                        catchError(() => EMPTY)
                    )
            )
        ));

    getListAccMngt$: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType(AccountingManagementActionTypes.LOAD_LIST),
            mergeMap(
                (param: CommonInterface.IParamPaging) => this._accountingRepo.getListAcctMngt(param.page, param.size, param.dataSearch)
                    .pipe(
                        map((data: CommonInterface.IResponsePaging) => LoadListAccountingMngtSuccess(data)),
                        catchError(() => EMPTY)
                    )
            )
        ));

    getOfficeByCurrentUser() {
        const loginData: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        return loginData.officeId;
    }

}



