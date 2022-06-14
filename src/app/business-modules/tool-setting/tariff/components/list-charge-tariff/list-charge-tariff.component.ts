import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { TariffChargePopupComponent } from '../popup/tariff-charge/tariff-charge.popup';
import { TariffCharge, Currency, Charge } from 'src/app/shared/models';
import { SystemConstants } from 'src/constants/system.const';

@Component({
    selector: 'list-charge-tariff',
    templateUrl: './list-charge-tariff.component.html',
})
export class TariffListChargeComponent extends AppList {

    @Input() charges: any[] = [];
    @Input() permission: {
        allowUpdate: true, // * Default.
    } = { allowUpdate: true };

    @Output() chargesChange: EventEmitter<any[]> = new EventEmitter<any[]>();

    @ViewChild(TariffChargePopupComponent) tariffChargePopup: TariffChargePopupComponent;

    headers: CommonInterface.IHeaderTable[];

    selectedTariffCharge: TariffCharge = new TariffCharge();
    selectedIndex: number = -1; // * SELECT ITEM CHARGE IN TABLE.

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.headers = [
            { title: 'Charge Name', field: 'chargeName', sortable: true, dataType: "LINK" },
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Route', field: 'route', sortable: true },
            { title: 'Comondities Group', field: 'commodityName', sortable: true, width: 150 },
            { title: 'Payer', field: 'payerName', sortable: true },
            { title: 'Range From', field: 'rangeFrom', sortable: true },
            { title: 'Range To', field: 'rangeTo', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Min', field: 'min', sortable: true },
            { title: 'Max', field: 'max', sortable: true },
            { title: 'Next Unit', field: 'nextUnit', sortable: true },
            { title: 'Next Unit Price', field: 'nextUnitPrice', sortable: true },
            { title: 'Unit', field: 'unitId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Location Clearance', field: 'portName', sortable: true },
            { title: 'WareHouse', field: 'warehouseName', sortable: true },
            { title: 'Curerncy', field: 'currencyId', sortable: true },
        ];

    }

    openAddChargePopupTariff() {
        this.tariffChargePopup.ACTION = 'CREATE';
        this.selectedTariffCharge = new TariffCharge();

        this.tariffChargePopup.formChargeTariff.value.tariffChargeDetail.currencyId = this.tariffChargePopup.currencyList.filter(i => i.id === 'VND')[0];
        this.tariffChargePopup.show();
    }

    onChangeChargeTariff(tariffCharge?: TariffCharge) {
        // * UPDATE ACTION FOR POPUP -> CREATE
        if (this.tariffChargePopup.ACTION === 'UPDATE') {
            this.charges[this.selectedIndex] = tariffCharge;
        } else {
            tariffCharge.id = SystemConstants.EMPTY_GUID;  // * Update ID action = create/copy
            this.charges.push(tariffCharge);
        }
    }

    viewDetailTariffCharge(tariffCharge: TariffCharge, index: number, action: CommonType.ACTION_FORM = <CommonType.ACTION_FORM>CommonType.ACTION.UPDATE) {
        this.selectedIndex = index;
        this.selectedTariffCharge = tariffCharge;

        // * UPDATE ACTION FOR POPUP -> UPDATE
        this.tariffChargePopup.ACTION = action;

        const objectTariffChargeForm = {
            useFor: this.tariffChargePopup.useFors.filter(useFor => useFor.value === this.selectedTariffCharge.useFor)[0],
            route: this.tariffChargePopup.routes.filter(route => route.value === this.selectedTariffCharge.route)[0],
            min: this.selectedTariffCharge.min,
            max: this.selectedTariffCharge.max,
            unitPrice: this.selectedTariffCharge.unitPrice,
            nextUnit: this.selectedTariffCharge.nextUnit,
            nextUnitPrice: this.selectedTariffCharge.nextUnitPrice,
            rangeTo: this.selectedTariffCharge.rangeTo,
            rangeFrom: this.selectedTariffCharge.rangeFrom,
            vatrate: this.selectedTariffCharge.vatrate,
            type: !!this.selectedTariffCharge.type ? this.tariffChargePopup.types.filter(type => type.value === this.selectedTariffCharge.type)[0] : null,
            rangeType: !!this.selectedTariffCharge.rangeType ? this.tariffChargePopup.rangeTypes.filter(range => range.value === this.selectedTariffCharge.rangeType)[0] : null,
            currencyId: !!this.selectedTariffCharge.currencyId ? this.tariffChargePopup.currencyList.filter((currency: Currency) => currency.id === this.selectedTariffCharge.currencyId)[0] : this.tariffChargePopup.currencyList.filter((currency: Currency) => currency.id === 'VND')[0],
            unitId: !!this.selectedTariffCharge.unitId ? this.tariffChargePopup.units.filter(unit => unit.id === this.selectedTariffCharge.unitId)[0] : null
        };

        // * Update Combo Grid.
        this.tariffChargePopup.keyword = this.selectedTariffCharge.chargeName;
        this.tariffChargePopup.selectedCharge = new Charge({ code: this.selectedTariffCharge.chargeCode, id: this.selectedTariffCharge.chargeId, chargeNameEn: this.selectedTariffCharge.chargeName });

        this.tariffChargePopup.selectedCommondityGroup = <CommonInterface.IComboGridData>{ field: 'id', value: this.selectedTariffCharge.commodityId };
        this.tariffChargePopup.selectedPayer = <CommonInterface.IComboGridData>{ field: 'id', value: this.selectedTariffCharge.payerId };
        this.tariffChargePopup.selectedPort = <CommonInterface.IComboGridData>{ field: 'id', value: this.selectedTariffCharge.portId };
        this.tariffChargePopup.selectedWarehouse = <CommonInterface.IComboGridData>{ field: 'id', value: this.selectedTariffCharge.warehouseId };

        // * Update Form Group IN POPUP.
        this.tariffChargePopup.formChargeTariff.controls['tariffChargeDetail'].setValue(objectTariffChargeForm);

        this.tariffChargePopup.show();
    }

    deleteTariff(index: number) {
        this.charges.splice(index, 1);
    }
}
