import { Component, OnInit } from '@angular/core';
import { CatPartnerCharge, Charge, Unit, Currency } from '@models';
import { GetCatalogueCurrencyAction, GetCatalogueUnitAction, getCatalogueCurrencyState, getCatalogueUnitState } from '@store';
import { Store } from '@ngrx/store';
import { IShareBussinessState } from '@share-bussiness';
import { CatalogueRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params } from '@angular/router';

import { PopupBase } from 'src/app/popup.base';

import { Observable } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { finalize, catchError } from 'rxjs/operators';
import { ChargeConstants } from 'src/constants/charge.const';
import { SortService } from '@services';

@Component({
    selector: 'partner-other-charge-popup',
    templateUrl: './partner-other-charge.popup.html',
    styleUrls: ['./partner-other-charge.popup.scss'],
})
export class PartnerOtherChargePopupComponent extends PopupBase implements OnInit {

    charges: CatPartnerCharge[] = [];
    initCharges: CatPartnerCharge[] = [];

    listCharges: Charge[];
    listUnits: Unit[] = [];
    listCurrency: Observable<Currency[]>;

    quantityHints: CommonInterface.IValueDisplay[] = [
        { displayName: 'G.W', value: CommonEnum.QUANTITY_TYPE.GW },
        { displayName: 'C.W', value: CommonEnum.QUANTITY_TYPE.CW },
        { displayName: 'CBM', value: CommonEnum.QUANTITY_TYPE.CBM },
        { displayName: 'P.K', value: CommonEnum.QUANTITY_TYPE.PACKAGE },
        { displayName: 'Cont', value: CommonEnum.QUANTITY_TYPE.CONT },
        { displayName: 'N.W', value: CommonEnum.QUANTITY_TYPE.NW },
    ];
    configComboGridCharge: Partial<CommonInterface.IComboGirdConfig> = {};

    partnerId: string;

    constructor(
        private _store: Store<IShareBussinessState>,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _sortService: SortService,
    ) {
        super();
        this.requestSort = this.sortOtherCharge;
    }

    ngOnInit(): void {
        this.configComboGridCharge = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unitId', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });
        this.headers = [
            { title: 'Charge Name', field: 'chargeId', sortable: true, width: 150 },
            { title: 'Quantity', field: 'quantity', sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
        ];

        this._store.dispatch(new GetCatalogueCurrencyAction());
        this._store.dispatch(new GetCatalogueUnitAction());
        this.getCharge();

        this.listCurrency = this._store.select(getCatalogueCurrencyState);
        this._store.select(getCatalogueUnitState)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (units: Unit[]) => {
                    this.listUnits = units;
                }
            );

        this._activedRoute.params.subscribe((params: Params) => {
            if (params.id) {
                this.partnerId = params.id;
            }
        });
    }
    //
    sortOtherCharge(sortField: string, order: boolean) {
        if (sortField === "quantity") {
            sortField = "quantityType";
        }
        this.initCharges = this._sortService.sort(this.initCharges, sortField, order);
    }
    //
    getCharge() {
        const serviceTypeId: string = `${ChargeConstants.AI_CODE};${ChargeConstants.AE_CODE}`;
        this._catalogueRepo.getCharges({ active: true, type: CommonEnum.CHARGE_TYPE.CREDIT, serviceTypeId: serviceTypeId })
            .subscribe(
                (charges: Charge[]) => {
                    this.listCharges = charges;
                }
            );
    }

    addCharge() {
        this.initCharges = [...this.initCharges, new CatPartnerCharge({ partnerId: this.partnerId, quantity: 1 })];
    }

    deleteCharge(charge: CatPartnerCharge, index: number) {
        this.initCharges = [...this.initCharges.slice(0, index), ...this.initCharges.slice(index + 1)];
    }

    onSelectDataFormInfo(data: Charge, partnerCharge: CatPartnerCharge) {
        partnerCharge.chargeId = data.id;

    }


    onChangeQuantityHint(hint: string, charge: CatPartnerCharge) {
        if (!!hint) {
            charge.quantity = null;
        }
    }

    onSavePartnerCharge() {
        if (!this.initCharges.length) {
            this._toastService.warning("Please input charge");
        }
        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }
        this.charges = cloneDeep(this.initCharges);


        this._catalogueRepo.updatePartnerCharge(this.partnerId, this.charges)
            .pipe()
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    if (this.initCharges.length === 0) {
                        this._toastService.success("Successfully updated");
                    } else {
                        this._toastService.success(res.message);
                    }
                } else {
                    this._toastService.error(res.message);
                }
                this.isSubmitted = false;
                this.hide();
            });
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.initCharges) {
            if (
                !charge.chargeId
                || charge.vatrate > 100
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    closePopup() {
        this.isSubmitted = false;
        this.initCharges = cloneDeep(this.charges);
        this.hide();
    }
}
