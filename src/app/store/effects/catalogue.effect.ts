import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, catchError, withLatestFrom, switchMap } from 'rxjs/operators';
import { CatalogueRepo } from '@repositories';
import {
    CatalogueActions, CatalogueActionTypes, GetCataloguePortSuccessAction, GetCataloguePortFailAction, GetCatalogueCarrierSuccessAction, GetCatalogueCarrierFailAction, GetCatalogueAgentSuccessAction, GetCatalogueAgentFailAction, GetCatalogueUnitSuccessAction, GetCatalogueUnitFailAction, GetCatalogueCommoditySuccessAction, GetCatalogueCommodityFailAction, GetCatalogueCurrencyFailAction, GetCatalogueCountrySuccessAction, GetCatalogueCountryFailAction, GetCatalogueCurrencySuccessAction, GetCatalogueWarehouseSuccessAction, GetCatalogueWarehouseFailAction, GetCatalogueCommodityGroupSuccessAction, GetCatalogueCommodityGroupFailAction, GetCataloguePackageSuccessAction, GetCataloguePackageFailAction, GetCatalogueBankSuccessAction, GetCatalogueBankFailAction
} from '../actions';
import { getCataloguePortState, getCatalogueCarrierState, getCatalogueAgentState, getCatalogueUnitState, getCatalogueCommodityState, getCatalogueCustomerState, getCatalogueCountryState, getCatalogueCurrencyState, getCatalogueWarehouseState, getCatalogueCommodityGroupState,getCatalogueBankState } from '../reducers';
import { Commodity, Unit, Customer, PortIndex, CountryModel, Currency, Warehouse, CommodityGroup, Bank } from '@models';
import { CommonEnum } from '@enums';

@Injectable()
export class CatalogueEffect {
    constructor(
        private actions$: Actions,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<any>
    ) { }

    @Effect()
    getPorts$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_PORT),
            withLatestFrom(
                this._store.select(getCataloguePortState),
                (action: CatalogueActions, ports: PortIndex[]) => ({ data: ports, action: action })),

            switchMap((data: { data: PortIndex[], action: CatalogueActions }) => {
                // * Check ports in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCataloguePortSuccessAction(data.data));
                }
                return this._catalogueRepo.getListPort(data.action.payload).pipe(
                    map((response: PortIndex) => new GetCataloguePortSuccessAction(response)),
                    catchError(err => of(new GetCataloguePortFailAction(err)))
                );
            })
        );

    @Effect()
    getWarehouses$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_WAREHOUSE),
            withLatestFrom(
                this._store.select(getCatalogueWarehouseState),
                (action: CatalogueActions, warehouses: Warehouse[]) => ({ data: warehouses, action: action })),

            switchMap((data: { data: any[], action: CatalogueActions }) => {
                // * Check ports in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueWarehouseSuccessAction(data.data));
                }
                return this._catalogueRepo.getListPort(data.action.payload).pipe(
                    map((response: any) => new GetCatalogueWarehouseSuccessAction(response)),
                    catchError(err => of(new GetCatalogueWarehouseFailAction(err)))
                );
            })
        );

    @Effect()
    getCarriers$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_CARRIER),
            withLatestFrom(
                this._store.select(getCatalogueCarrierState),
                (action: CatalogueActions, carriers: Customer[]) => ({ data: carriers, action: action })),

            switchMap((data: { data: Customer[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueCarrierSuccessAction(data.data));
                }
                return this._catalogueRepo.getPartnersByType(data.action.payload).pipe(
                    map((response: Customer[]) => new GetCatalogueCarrierSuccessAction(response)),
                    catchError(err => of(new GetCatalogueCarrierFailAction(err)))
                );
            })
        );


    @Effect()
    getAgents$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_AGENT),
            withLatestFrom(
                this._store.select(getCatalogueAgentState),
                (action: CatalogueActions, agents: Customer[]) => ({ data: agents, action: action })),

            switchMap((data: { data: Customer[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueAgentSuccessAction(data.data));
                }
                return this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.AGENT, data.action.payload.active).pipe(
                    map((response: Customer[]) => new GetCatalogueAgentSuccessAction(response)),
                    catchError(err => of(new GetCatalogueAgentFailAction(err)))
                );
            })
        );

    @Effect()
    getUnits$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_UNIT),
            withLatestFrom(
                this._store.select(getCatalogueUnitState),
                (action: CatalogueActions, units: Unit[]) => ({ data: units, action: action })),

            switchMap((data: { data: Unit[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueUnitSuccessAction(data.data));
                }
                return this._catalogueRepo.getUnit(data.action.payload).pipe(
                    map((response: Unit[]) => new GetCatalogueUnitSuccessAction(response)),
                    catchError(err => of(new GetCatalogueUnitFailAction(err)))
                );
            })
        );

    @Effect()
    getPackages$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_PACKAGE),
            withLatestFrom(
                this._store.select(getCatalogueUnitState),
                (action: CatalogueActions, units: Unit[]) => ({ data: units, action: action })),

            switchMap((data: { data: Unit[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCataloguePackageSuccessAction(data.data));
                }
                return this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE }).pipe(
                    map((response: Unit[]) => new GetCataloguePackageSuccessAction(response)),
                    catchError(err => of(new GetCataloguePackageFailAction(err)))
                );
            })
        );

    @Effect()
    getCommodity$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_COMMODITY),
            withLatestFrom(
                this._store.select(getCatalogueCommodityState),
                (action: CatalogueActions, commodities: Commodity[]) => ({ data: commodities, action: action })),

            switchMap((data: { data: Commodity[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueCommoditySuccessAction(data.data));
                }
                return this._catalogueRepo.getCommondity(data.action.payload).pipe(
                    map((response: Commodity[]) => new GetCatalogueCommoditySuccessAction(response)),
                    catchError(err => of(new GetCatalogueCommodityFailAction(err)))
                );
            })
        );
    @Effect()
    getCommodityGroup$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_COMMODITYGROUP),
            withLatestFrom(
                this._store.select(getCatalogueCommodityGroupState),
                (action: CatalogueActions, commodityGroups: CommodityGroup[]) => ({ data: commodityGroups, action: action })
            ),
            switchMap((data: { data: CommodityGroup[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueCommodityGroupSuccessAction(data.data));
                }
                return this._catalogueRepo.getCommodityGroup(data.action.payload).pipe(
                    map((response: CommodityGroup[]) => new GetCatalogueCommodityGroupSuccessAction(response)),
                    catchError(err => of(new GetCatalogueCommodityGroupFailAction(err)))
                );
            })
        );


    @Effect()
    getCountries$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_COUNTRY),
            withLatestFrom(
                this._store.select(getCatalogueCountryState),
                (action: CatalogueActions, countries: CountryModel[]) => ({ data: countries, action: action })),
            switchMap((data: { data: CountryModel[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueCountrySuccessAction(data.data));
                }
                return this._catalogueRepo.getCountry().pipe(
                    map((response: CountryModel[]) => new GetCatalogueCountrySuccessAction(response)),
                    catchError(err => of(new GetCatalogueCountryFailAction(err)))
                );
            })
        );

    @Effect()
    getcurrencies$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_CURRENCY),
            withLatestFrom(
                this._store.select(getCatalogueCurrencyState),
                (action: CatalogueActions, currencies: Currency[]) => ({ data: currencies, action: action })),
            switchMap((data: { data: Currency[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueCurrencySuccessAction(data.data));
                }
                return this._catalogueRepo.getListCurrency().pipe(
                    map((response: Currency[]) => new GetCatalogueCurrencySuccessAction(response)),
                    catchError(err => of(new GetCatalogueCurrencyFailAction(err)))
                );
            })
        );
    @Effect()
    getbanks$: Observable<Action> = this.actions$
        .pipe(
            ofType<CatalogueActions>(CatalogueActionTypes.GET_BANK),
            withLatestFrom(
                this._store.select(getCatalogueBankState),
                (action: CatalogueActions, banks: Bank[]) => ({ data: banks, action: action })),
            switchMap((data: { data: Bank[], action: CatalogueActions }) => {
                // * Check carriers in redux store.
                if (!!data && data.data && data.data.length) {
                    return of(new GetCatalogueBankSuccessAction(data.data));
                }
                return this._catalogueRepo.getListBank().pipe(
                    map((response: Bank[]) => new GetCatalogueBankSuccessAction(response)),
                    catchError(err => of(new GetCatalogueBankFailAction(err)))
                );
            })
        );
}
