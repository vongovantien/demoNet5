import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SystemConstants } from 'src/constants/system.const';
import { Currency, TariffCharge, Charge, Tariff } from 'src/app/shared/models';
import { DataService } from 'src/app/shared/services';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, AbstractControl, FormBuilder, FormControl } from '@angular/forms';

export type TYPE_TARIFF = 'Single' | 'Range' | 'Min-Max' | 'Next Level';
export const TYPE_TARIFF = {
    SINGLE: <TYPE_TARIFF>'Single',
    RANGE: <TYPE_TARIFF>'Range',
    MIN_MAX: <TYPE_TARIFF>'Min-Max',
    NEXT_LEVEL: <TYPE_TARIFF>'Next Level',
};
@Component({
    selector: 'tariff-charge-popup',
    templateUrl: './tariff-charge.popup.html',
})
export class TariffChargePopupComponent extends PopupBase {

    @Input() tariffCharge: TariffCharge = new TariffCharge();
    @Output() tariffDetailChange: EventEmitter<TariffCharge> = new EventEmitter<TariffCharge>();
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

    ACTION: CommonType.ACTION_FORM = <CommonType.ACTION_FORM>"CREATE";

    formChargeTariff: FormGroup;

    useFors: CommonInterface.IValueDisplay[];
    routes: CommonInterface.IValueDisplay[];
    types: CommonInterface.IValueDisplay[];
    rangeTypes: CommonInterface.IValueDisplay[];

    units: any[];
    currencyList: Currency[];
    charges: any[] = [];

    configPayer: CommonInterface.IComboGirdConfig | any = {};
    configComodity: CommonInterface.IComboGirdConfig | any = {};
    configWareHouse: CommonInterface.IComboGirdConfig | any = {};
    configPort: CommonInterface.IComboGirdConfig | any = {};

    selectedPayer: Partial<CommonInterface.IComboGridData | any> = {};
    selectedCommondityGroup: Partial<CommonInterface.IComboGridData | any> = {};
    selectedPort: Partial<CommonInterface.IComboGridData | any> = {};
    selectedWarehouse: Partial<CommonInterface.IComboGridData | any> = {};
    selectedCharge: Charge = null;

    term$ = new BehaviorSubject<string>('');


    isShow: boolean = false;
    isSubmitted: boolean = false;

    headersCharge: CommonInterface.IHeaderTable[];

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        private _fb: FormBuilder
    ) {
        super();

        this.headersCharge = [
            { title: 'Charge Code', field: 'code' },
            { title: 'Charge Name EN', field: 'chargeNameEn' },
            { title: 'Charge Name VN', field: 'chargeNameVn' },
        ];
    }

    ngOnChanges() {
    }

    ngOnInit(): void {
        this.initForm();

        this.initBasicData();
        this.getUnit();
        this.getCurrency();
        this.getPartner();
        this.getCommondityGroup();
        this.getPort();
        this.getWareHouse();

        // * Search autocomplete surcharge.
        this.term$.pipe(
            distinctUntilChanged(),
            this.autocomplete(500, ((keyword: string = '') => {
                if (!!keyword) {
                    this.isShow = true;
                }
                return this._catalogueRepo.getSettlePaymentCharges(keyword);
            }))
        ).subscribe(
            (res: any) => {
                this.charges = res;
            },
        );

        // * Detect close autocomplete when user click outside chargename control or select charge.
        this.$isShowAutoComplete
            .pipe(
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe((isShow: boolean) => {
                this.isShow = isShow;

                // * set again.
                this.keyword = !!this.selectedCharge ? this.selectedCharge.chargeNameEn : null;

            });
    }

    onSearchAutoComplete(keyword: string = '') {
        this.term$.next(keyword);
    }

    initForm() {
        this.formChargeTariff = this._fb.group({
            tariffChargeDetail: this._fb.group({
                useFor: [this.tariffCharge.useFor],
                route: [this.tariffCharge.route],
                type: [this.tariffCharge.type],
                rangeType: [this.tariffCharge.rangeType],
                rangeFrom: [this.tariffCharge.rangeFrom],
                rangeTo: [this.tariffCharge.rangeTo],
                unitPrice: [this.tariffCharge.unitPrice],
                min: [this.tariffCharge.min],
                max: [this.tariffCharge.max],
                unitId: [this.tariffCharge.unitId],
                nextUnit: [this.tariffCharge.nextUnit],
                nextUnitPrice: [this.tariffCharge.nextUnitPrice],
                vatrate: [this.tariffCharge.vatrate],
                currencyId: [this.tariffCharge.currencyId],
            })
        });


        // * Update unitPrice follow min.
        this.formChargeTariff.controls['tariffChargeDetail'].get('min').valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev === curr),
            )
            .subscribe((value: any) => {
                this.formChargeTariff.controls['tariffChargeDetail'].get('unitPrice').setValue(value);
            });


        for (const control of ["rangeFrom", "rangeTo", "min", "max", "nextUnit", "nextUnitPrice", ""]) {
            this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
        }
    }

    initBasicData() {
        this.configPayer = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'id', label: 'PartnerID' },
                { field: 'shortName', label: 'Abbr Name' },
                { field: 'partnerNameEn', label: 'Name EN' },

            ]
        }, { selectedDisplayFields: ['shortName'], });

        this.configComodity = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'groupNameEn', label: 'Name EN' },
                { field: 'groupNameVn', label: 'Name Local' },
            ]
        }, { selectedDisplayFields: ['groupNameEn'], });

        this.configPort = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'code', label: 'Port Code' },
                { field: 'nameEn', label: 'Name EN' },
                { field: 'nameVn', label: 'Name Local' },
            ]
        }, { selectedDisplayFields: ['nameEn'], });

        this.configWareHouse = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'code', label: 'Code' },
                { field: 'nameEn', label: 'Name EN' },
                { field: 'nameVn', label: 'Name Local' },
            ]
        }, { selectedDisplayFields: ['nameEn'], });

        this.useFors = [
            { displayName: 'Document', value: 'Document' },
            { displayName: 'OPS Field', value: 'OPS' },
        ];

        this.routes = [
            { displayName: 'Green', value: 'Green' },
            { displayName: 'Yellow', value: 'Yellow' },
            { displayName: 'Red', value: 'Red' },

        ];

        this.types = [
            { displayName: 'Single', value: TYPE_TARIFF.SINGLE },
            { displayName: 'Range', value: TYPE_TARIFF.RANGE },
            { displayName: 'Min-Max', value: TYPE_TARIFF.MIN_MAX },
            { displayName: 'Next Level', value: TYPE_TARIFF.NEXT_LEVEL },
        ];

        this.rangeTypes = [
            { displayName: 'CBM', value: 'CBM' },
            { displayName: 'Custom Clearance', value: 'CustomClearance' },
            { displayName: 'GW', value: 'GW' },
            { displayName: 'NW', value: 'NW' },
            { displayName: 'Container', value: 'Container' },
            { displayName: 'Package', value: 'Package' },
        ];
    }

    getUnit() {
        this._catalogueRepo.getUnit({ active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: [] = []) => { this.units = res; },
            );
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.currencyList = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY) || [];
        } else {
            this._catalogueRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (data: any = []) => {
                        this.currencyList = data || [];
                        this._dataService.setDataService(SystemConstants.CSTORAGE.CURRENCY, data || []);

                        // * Set default tariffType.
                        this.formChargeTariff.controls['tariffChargeDetail'].get('currencyId').setValue(this.currencyList.filter(i => i.id === 'VND')[0]);
                        this.tariffCharge.currencyId = this.currencyList.filter(i => i.id === 'VND')[0];

                    },
                );
        }
    }

    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.configPayer.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER);
        } else {
            this._catalogueRepo.getListPartner(null, null, { active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataPartner: any = []) => {
                        this.configPayer.dataSource = dataPartner;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.PARTNER, dataPartner);
                    },
                );
        }
    }

    getCommondityGroup() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.COMMODITY)) {
            this.configComodity.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.COMMODITY);
        } else {
            this._catalogueRepo.getCommodityGroup({ active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (commondityGroup: any = []) => {
                        this.configComodity.dataSource = commondityGroup;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.COMMODITY, commondityGroup);
                    },
                );
        }
    }

    getPort() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PORT)) {
            this.configPort.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.PORT);
        } else {
            this._catalogueRepo.getListPort({ placeType: PlaceTypeEnum.Port, active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (port: any = []) => {
                        this.configPort.dataSource = port;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.PORT, port);
                    },
                );
        }
    }

    getWareHouse() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.WAREHOUSE)) {
            this.configWareHouse.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.WAREHOUSE);
        } else {
            this._catalogueRepo.getPlace({ placeType: PlaceTypeEnum.Warehouse, active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (wareHouse: any = []) => {
                        this.configWareHouse.dataSource = wareHouse;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.WAREHOUSE, wareHouse);
                    },
                );
        }
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'charge':
                this._isShowAutoComplete.next(false);

                this.selectedCharge = new Charge(data);
                this.keyword = this.selectedCharge.chargeNameEn;

                // * Update Form Group
                this.formChargeTariff.value.tariffChargeDetail.chargeName = this.selectedCharge.chargeNameEn;
                this.formChargeTariff.value.tariffChargeDetail.chargeId = this.selectedCharge.id;

                // * Update Model binding
                this.tariffCharge.chargeName = this.selectedCharge.chargeNameEn;
                this.tariffCharge.chargeCode = this.selectedCharge.code;
                this.tariffCharge.chargeId = this.selectedCharge.id;

                break;
            case 'payer':
                this.selectedPayer = { field: 'id', value: data.id, data: data };
                // * Update Form Group
                this.formChargeTariff.value.tariffChargeDetail.payerId = this.selectedPayer.value;
                this.formChargeTariff.value.tariffChargeDetail.payerName = this.selectedPayer.data.shortName;

                // * Update Model binding
                this.tariffCharge.payerId = this.selectedPayer.value;
                this.tariffCharge.payerName = this.selectedPayer.data.shortName;
                break;
            case 'commondity':
                this.selectedCommondityGroup = { field: 'id', value: data.id, data: data };
                // * Update Form Group
                this.formChargeTariff.value.tariffChargeDetail.commodityId = this.selectedCommondityGroup.value;
                this.formChargeTariff.value.tariffChargeDetail.commodityName = this.selectedCommondityGroup.data.groupNameEn;

                // * Update Model binding
                this.tariffCharge.commodityId = this.selectedCommondityGroup.value;
                this.tariffCharge.commodityName = this.selectedCommondityGroup.data.groupNameEn;
                break;
            case 'port':
                this.selectedPort = { field: 'id', value: data.id, data: data };
                this.formChargeTariff.value.tariffChargeDetail.portId = this.selectedPort.value;
                this.formChargeTariff.value.tariffChargeDetail.portName = this.selectedPort.data.nameEn;

                // * Update Model binding
                this.tariffCharge.portId = this.selectedPort.value;
                this.tariffCharge.portName = this.selectedPort.data.nameEn;
                break;
            case 'warehouse':
                this.selectedWarehouse = { field: 'id', value: data.id, data: data };

                this.formChargeTariff.value.tariffChargeDetail.warehouseId = this.selectedWarehouse.value;
                this.formChargeTariff.value.tariffChargeDetail.warehouseName = this.selectedWarehouse.data.nameEn;

                // * Update Model binding
                this.tariffCharge.warehouseId = this.selectedWarehouse.value;
                this.tariffCharge.warehouseName = this.selectedWarehouse.data.nameEn;
                break;
            default:
                break;


        }
    }

    onChangeTypeTariff(type: CommonInterface.IValueDisplay) {
        if (!!type) {
            switch (<TYPE_TARIFF>type.value) {
                case "Single":
                    for (const control of ["rangeFrom", "rangeTo", "min", "max", "nextUnit", "nextUnitPrice"]) {
                        this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
                        this.formChargeTariff.controls['tariffChargeDetail'].get(control).setValue(0);
                    }
                    break;
                case "Range":
                    for (const control of ["min", "max", "nextUnit", "nextUnitPrice"]) {
                        this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
                        this.formChargeTariff.controls['tariffChargeDetail'].get(control).setValue(0);

                    }
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("rangeFrom"), 'enable');
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("rangeTo"), 'enable');
                    break;
                case "Min-Max":
                    for (const control of ["nextUnit", "nextUnitPrice", "rangeFrom", "rangeTo"]) {
                        this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
                        this.formChargeTariff.controls['tariffChargeDetail'].get(control).setValue(0);

                    }
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("min"), 'enable');
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("max"), 'enable');
                    break;
                case "Next Level":
                    for (const control of ["min", "max", "rangeFrom", "rangeTo"]) {
                        this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
                        this.formChargeTariff.controls['tariffChargeDetail'].get(control).setValue(0);

                    }
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("nextUnit"), 'enable');
                    this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get("nextUnitPrice"), 'enable');
                    break;
                default:
                    for (const control of ["rangeFrom", "rangeTo", "min", "max", "nextUnit", "nextUnitPrice", ""]) {
                        this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
                    }
                    break;
            }
        } else {
            for (const control of ["rangeFrom", "rangeTo", "min", "max", "nextUnit", "nextUnitPrice", ""]) {
                this.enableDisabledFormControl(this.formChargeTariff.controls['tariffChargeDetail'].get(control), 'disabled');
            }
        }
    }

    onClickOutsideChargeName() {
        this._isShowAutoComplete.next(false);
    }

    saveCharge() {
        this.isSubmitted = true;
        if (!this.validateFormGroup()) {
            return;
        }
        this.submitData();
        this.closePopup();
    }

    updateToContinue() {
        this.isSubmitted = true;
        if (!this.validateFormGroup()) {
            return;
        }

        this.submitData();
        this.closePopup();
        setTimeout(() => {
            this.selectedCommondityGroup = { field: 'id', value: this.tariffCharge.commodityId };
            this.formChargeTariff.controls['tariffChargeDetail'].get("useFor").setValue(this.useFors.find(item => item.value === this.tariffCharge.useFor));
            this.show();
        }, 500);
    }

    closePopup() {
        this.hide();
        this.isSubmitted = false;
        this.keyword = '';
        this.selectedCharge = null;

        // * Reset form
        this.formChargeTariff.reset();
        this.formChargeTariff.reset({ tariffChargeDetail: new TariffCharge() });
    }

    submitData() {
        const tariffChargeDetailForm: any = this.formChargeTariff.value.tariffChargeDetail;
        const body: TariffCharge | any = {
            chargeName: this.tariffCharge.chargeName,
            chargeCode: this.tariffCharge.chargeCode,
            commodityName: this.tariffCharge.commodityName,
            payerName: this.tariffCharge.payerName,
            portName: this.tariffCharge.portName,
            warehouseName: this.tariffCharge.warehouseName,
            id: this.ACTION === 'CREATE' ? SystemConstants.EMPTY_GUID : this.tariffCharge.id,
            tariffId: this.ACTION === 'CREATE' ? SystemConstants.EMPTY_GUID : this.tariffCharge.tariffId,
            chargeId: this.tariffCharge.chargeId,
            commodityId: this.tariffCharge.commodityId,
            payerId: this.tariffCharge.payerId,
            portId: this.tariffCharge.portId,
            warehouseId: this.tariffCharge.warehouseId,

            useFor: !!tariffChargeDetailForm.useFor ? tariffChargeDetailForm.useFor.value : null,
            route: !!tariffChargeDetailForm.route ? tariffChargeDetailForm.route.value : null,
            type: !!tariffChargeDetailForm.type ? tariffChargeDetailForm.type.value : null,
            rangeType: !!tariffChargeDetailForm.rangeType ? tariffChargeDetailForm.rangeType.value : null,

            rangeFrom: tariffChargeDetailForm.rangeFrom || 0,
            rangeTo: tariffChargeDetailForm.rangeTo || 0,
            unitPrice: tariffChargeDetailForm.unitPrice || 0,
            min: tariffChargeDetailForm.min || 0,
            max: tariffChargeDetailForm.max || 0,
            nextUnit: tariffChargeDetailForm.nextUnit || 0,
            nextUnitPrice: tariffChargeDetailForm.nextUnitPrice || 0,
            vatrate: tariffChargeDetailForm.vatrate || 0,

            currencyId: !!tariffChargeDetailForm.currencyId ? tariffChargeDetailForm.currencyId.id : null,
            unitId: !!tariffChargeDetailForm.unitId ? tariffChargeDetailForm.unitId.id : null,
        };

        this.tariffCharge = new TariffCharge(body);
        this.onChange.emit(this.tariffCharge);
    }

    validateFormGroup() {
        let valid: boolean = true;
        if (
            !this.selectedCharge
            || !this.formChargeTariff.value.tariffChargeDetail.useFor
            || !this.formChargeTariff.value.tariffChargeDetail.route
            || this.formChargeTariff.value.tariffChargeDetail.rangeFrom > this.formChargeTariff.value.tariffChargeDetail.rangeTo
        ) {
            valid = false;
        }
        return valid;
    }

    enableDisabledFormControl(control: FormControl | AbstractControl, type: string = 'enable') {
        if (!!control && (control instanceof FormControl || control instanceof AbstractControl)) {
            if (type === 'enable') {
                control.enable();
            } else {
                control.disable();
            }
            control.updateValueAndValidity();
        }
    }

}



