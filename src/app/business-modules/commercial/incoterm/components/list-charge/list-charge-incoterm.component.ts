import { Component, OnInit, Input } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { CatChargeIncoterm, Charge, Unit, Currency } from '@models';
import { CommonEnum } from '@enums';
import { CatalogueRepo } from '@repositories';
import { DataService } from '@services';
import { SystemConstants } from '@constants';
import { SortService } from '@services';

import { map, takeUntil, shareReplay, tap, switchMap, distinctUntilChanged } from 'rxjs/operators';

import cloneDeep from 'lodash/cloneDeep';
import { forkJoin, Observable } from 'rxjs';


@Component({
    selector: 'list-charge-incoterm',
    templateUrl: './list-charge-incoterm.component.html',
    styleUrls: ['./list-charge-incoterm.component.scss'],
})
export class CommercialListChargeIncotermComponent extends AppList implements OnInit {

    @Input() type: string = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
    serviceTypeId: string = null;

    incotermCharges: CatChargeIncoterm[] = [];

    listCharges: Charge[] = [];
    listUnits: Observable<Unit[]>;
    listCurrency: Observable<Currency[]>;

    configChargeDisplayFields: CommonInterface.IComboGridDisplayField[] = [
        { field: 'chargeNameEn', label: 'Charge Code' },
        { field: 'code', label: 'Charge Name' },
    ];
    quantityHints: CommonInterface.IValueDisplay[] = [
        { displayName: 'G.W', value: CommonEnum.QUANTITY_TYPE.GW },
        { displayName: 'C.W', value: CommonEnum.QUANTITY_TYPE.CW },
        { displayName: 'CBM', value: CommonEnum.QUANTITY_TYPE.CBM },
        { displayName: 'P.K', value: CommonEnum.QUANTITY_TYPE.PACKAGE },
        { displayName: 'Cont', value: CommonEnum.QUANTITY_TYPE.CONT },
        { displayName: 'N.W', value: CommonEnum.QUANTITY_TYPE.NW },
    ];
    chargeTo: CommonInterface.IValueDisplay[] = [
        { displayName: 'Customer', value: CommonEnum.PartnerGroupEnum.CUSTOMER },
        { displayName: 'Agent', value: CommonEnum.PartnerGroupEnum.AGENT },
        { displayName: 'Shipper', value: CommonEnum.PartnerGroupEnum.SHIPPER },
        { displayName: 'Consignee', value: CommonEnum.PartnerGroupEnum.CONSIGNEE },
        { displayName: 'Carrier', value: CommonEnum.PartnerGroupEnum.CARRIER },
    ];
    feeTypes: CommonInterface.IValueDisplay[] = [
        { displayName: 'Handing', value: CommonEnum.FEE_TYPE.HANDLING },
        { displayName: 'Freight', value: CommonEnum.FEE_TYPE.FREIGHT },
        { displayName: 'Local Charge', value: CommonEnum.FEE_TYPE.LOCALCHARGE },
        { displayName: 'Logistics', value: CommonEnum.FEE_TYPE.LOGISTICS },
        { displayName: 'Fuel', value: CommonEnum.FEE_TYPE.FUEL },
        { displayName: 'Trucking', value: CommonEnum.FEE_TYPE.TRUCKING },
        { displayName: 'Other', value: CommonEnum.FEE_TYPE.OTHER },
    ];

    isSubmitted: boolean = false;
    isLoadingCharge: boolean = false;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        private _sortService: SortService,
    ) {
        super();
        this.requestSort = this.sortChargeList;
    }

    ngOnInit(): void {
        this.headers = [
            { title: 'Charge Name', field: 'chargeId', sortable: true, required: true, width: 300 },
            { title: 'Hint Qty', field: 'quantityType', sortable: true, required: true },
            { title: 'Unit', field: 'unit', sortable: true, required: true },
            { title: 'Charge To', field: 'chargeTo', sortable: true, required: true },
            { title: 'Currency', field: 'currency', sortable: true, required: true },
            { title: 'Fee Type', field: 'feeType', sortable: true, required: true },
        ];

        this.listUnits = this._catalogueRepo.getUnit({ active: true }).pipe(shareReplay());
        this.listCurrency = this._catalogueRepo.getListCurrency().pipe(shareReplay());

        this.subscription = this._dataService.currentMessage
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((s: { default: string, incotermService: string }) => !!s.incotermService ? s.incotermService : null),
                tap((s) => {
                    this.serviceTypeId = s;
                }),
                distinctUntilChanged(),
                switchMap((service: string) => this._catalogueRepo.getListCharge(null, null, { active: true, serviceTypeId: service, type: this.utility.getChargeType(this.type) })),
            ).subscribe(
                (charges: Charge[] = []) => {
                    this.listCharges = charges;
                }
            );

    }

    addCharge() {
        if (this.type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
            this.incotermCharges.push(new CatChargeIncoterm({ type: CommonEnum.SurchargeTypeEnum.SELLING_RATE }));
            return;
        }
        this.incotermCharges.push(new CatChargeIncoterm({ type: CommonEnum.SurchargeTypeEnum.BUYING_RATE }));
    }

    copyCharge(index: number) {
        this.isSubmitted = false;
        const newCharge = cloneDeep(this.incotermCharges[index]);
        newCharge.id = SystemConstants.EMPTY_GUID;

        if (this.type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
            newCharge.type = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
        } else {
            newCharge.type = CommonEnum.SurchargeTypeEnum.BUYING_RATE;
        }
        this.incotermCharges.push(new CatChargeIncoterm(newCharge));
    }

    deleteCharge(index: number, chargeItem: CatChargeIncoterm) {
        [this.isSubmitted, chargeItem.isDuplicate] = [false, false];
        this.incotermCharges.splice(index, 1);
    }

    onSelectDataTableInfo(data: any, chargeItem: CatChargeIncoterm, key: string) {
        [this.isSubmitted, chargeItem.isDuplicate] = [false, false];
        this.resetCharge(this.incotermCharges);
        switch (key) {
            case 'charge':
                chargeItem.chargeId = data.id;
                break;
            case 'unit':
                chargeItem.unit = data.id;
                break;
            default:
                break;
        }
    }

    getUnitCurrency() {
        forkJoin([
            this._catalogueRepo.getUnit({ active: true }),
            this._catalogueRepo.getListCurrency(),
        ]).pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            ([units, currencies]) => {
                this.listUnits = units || [];
                this.listCurrency = currencies || [];
            }
        );
    }

    resetCharge(charges: CatChargeIncoterm[]) {
        charges.forEach(c => {
            c.isDuplicate = false;
        });
    }

    validateListCharge(): boolean {
        if (!this.incotermCharges.length) {
            return true;
        }
        let valid: boolean = true;
        for (const c of this.incotermCharges) {
            if (
                !c.chargeId ||
                !c.quantityType ||
                !c.unit ||
                !c.chargeTo ||
                !c.currency ||
                !c.feeType
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }


    validateDuplicate(): boolean {
        const chargeIds = this.incotermCharges.map(c => c.chargeId);
        const isDuplicate = new Set(chargeIds).size !== this.incotermCharges.length;
        let valid: boolean = false;

        if (isDuplicate) {
            const arrayDuplicates = [...new Set(this.utility.findDuplicates(chargeIds))];
            this.incotermCharges.forEach((c: CatChargeIncoterm) => {
                if (arrayDuplicates.includes(c.chargeId)) {
                    c.isDuplicate = true;
                } else {
                    c.isDuplicate = false;
                }
            });
            valid = false;
        } else {
            valid = true;
        }

        return valid;
    }

    ngOnDestroy() {
        this.serviceTypeId = null;
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.subscription.unsubscribe();
        this._dataService.setData('incotermService', null);
    }

    sortChargeList(sortField: string, order: boolean) {
        this.incotermCharges = this._sortService.sort(this.incotermCharges, sortField, order);
    }

}

