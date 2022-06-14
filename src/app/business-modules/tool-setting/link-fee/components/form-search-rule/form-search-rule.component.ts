import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { catchError } from 'rxjs/operators';
import _uniqBy from 'lodash/uniqBy';
import { Charge, Partner } from 'src/app/shared/models';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { CommonEnum } from '@enums';
import { formatDate } from '@angular/common';
import { RuleLinkFee } from 'src/app/shared/models/tool-setting/rule-link-fee';
@Component({
    selector: 'app-form-search-rule',
    templateUrl: './form-search-rule.component.html'
})
export class FormSearchRuleComponent extends AppForm {

    @Output() onSearch: EventEmitter<Partial<IRuleSearch> | any> = new EventEmitter<Partial<IRuleSearch> | any>();
    tariffTypes: CommonInterface.IValueDisplay[] | any[];
    selectedTariffType: CommonInterface.IValueDisplay = null;

    services: CommonInterface.IComboGirdConfig | any = {};

    status: CommonInterface.IValueDisplay[] | any[];
    selectedStatus: CommonInterface.IValueDisplay = null;

    shipmentModes: CommonInterface.IValueDisplay[] | any[];
    selectedShipmentMode: CommonInterface.IValueDisplay = null;

    dateTypes: CommonInterface.IValueDisplay[] | any[];
    selectedDateType: CommonInterface.IValueDisplay = null;

    configPartner: CommonInterface.IComboGirdConfig | any = {};
    configChargeBuying: CommonInterface.IComboGirdConfig | any = {};
    configChargeSelling: CommonInterface.IComboGirdConfig | any = {};

    selectedChargeBuying: Partial<CommonInterface.IComboGridData> | any = {};
    selectedChargeSelling: Partial<CommonInterface.IComboGridData> | any = {};
    selectedPartnerBuying: Partial<CommonInterface.IComboGridData> | any = {};
    selectedPartnerSelling: Partial<CommonInterface.IComboGridData> | any = {};

    suppliers: Partner[] = [];

    formSearchRule: FormGroup;

    rule: RuleLinkFee = new RuleLinkFee();

    ruleName: AbstractControl;
    serviceBuying: AbstractControl;
    serviceSelling: AbstractControl;
    dateType: AbstractControl;
    date: AbstractControl;
    constructor(
        protected _dataService: DataService,
        protected _catalogueRepo: CatalogueRepo,
        protected _systemRepo: SystemRepo,
        protected _fb: FormBuilder
    ) {
        super();
        this.requestSearch = this.submitSearch;
    }

    ngOnInit(): void {
        this.configPartner = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'taxCode', label: 'Partner Code' },
                { field: 'shortName', label: 'Abbr Name' },
                { field: 'partnerNameEn', label: 'Name EN' },

            ]
        }, { selectedDisplayFields: ['shortName'], });

        this.configChargeBuying = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unit', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });

        this.configChargeSelling = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unit', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });

        this.initFormSearch();

        this.getBasicData();

        this.getService();
        this.getPartner();
        this.getChargeBuying();
        this.getChargeSelling();
        this.getStatus();
    }

    initFormSearch() {
        this.formSearchRule = this._fb.group({
            ruleName: [],
            serviceBuying: [],
            serviceSelling: [],
            dateType: [],
            status: [],
            date: [],
        });
        this.serviceBuying = this.formSearchRule.controls['serviceBuying'];
        this.serviceSelling = this.formSearchRule.controls['serviceSelling'];
        this.ruleName = this.formSearchRule.controls['ruleName'];
        this.dateType = this.formSearchRule.controls['dateType'];
        this.date = this.formSearchRule.controls['date'];
    }
    getStatus() {
        this.status = [
            { displayName: 'All', value: null },
            { displayName: 'Active', value: true },
            { displayName: 'Inactive', value: false },
        ];
    }

    getBasicData() {
        this.status = [
            { displayName: 'All', value: null },
            { displayName: 'Active', value: true },
            { displayName: 'Inactive', value: false },
        ];

        this.dateTypes = [
            { displayName: 'All', value: null },
            { displayName: 'Create Date', value: 'CreateDate' },
            { displayName: 'Effective Date', value: 'EffectiveDate' },
            { displayName: 'Modified Date', value: 'ModifiedDate' },
            { displayName: 'Expiration Date', value: 'ExpiredDate' },
        ];
    }
    getService() {
        this.services = [
            { displayName: 'All', value: null },
            { displayName: 'Custom Logistic', value: 'CL' },
            { displayName: 'Air Export', value: 'AE' },
            { displayName: 'Air Import', value: 'AI' },
            { displayName: 'Sea Consol Export', value: 'SCE' },
            { displayName: 'Sea Consol Import', value: 'SCI' },
            { displayName: 'Sea FCL Export', value: 'SFE' },
            { displayName: 'Sea FCL Import', value: 'SFI' },
            { displayName: 'Sea LCL Export', value: 'SLE' },
            { displayName: 'Sea LCL Import', value: 'SLI' },
            { displayName: 'Inland Trucking', value: 'IT' },
        ];
    }

    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.configPartner.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER) || [];
        } else {
            this._catalogueRepo.getListPartner(null, null, { active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataPartner: any = []) => {
                        this.configPartner.dataSource = dataPartner || [];
                        this._dataService.setDataService(SystemConstants.CSTORAGE.PARTNER, dataPartner || []);
                    },
                );
        }
    }
    getChargeBuying() {
        console.log(this.serviceBuying.value);
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE)) {
            this.configChargeBuying.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE) || [];
        } else {
            this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceBuying.value, type: CommonEnum.CHARGE_TYPE.CREDIT })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCharge: any = []) => {
                        this.configChargeBuying.dataSource = dataCharge;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.CHARGE, dataCharge || []);
                    },
                );
        }
    }

    getChargeSelling() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE)) {
            this.configChargeSelling.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE);
        } else {
            this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceSelling.value, type: CommonEnum.CHARGE_TYPE.DEBIT })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCharge: any = []) => {
                        this.configChargeSelling.dataSource = dataCharge;
                        this._dataService.setDataService(SystemConstants.CSTORAGE.CHARGE, dataCharge);
                    },
                );
        }
    }
    onSelectDataFormInfo(data: Charge | Partner | any, key: string | any) {
        switch (key) {
            case 'partnerBuying':
                this.selectedPartnerBuying = { field: 'shortName', value: data.shortName, data: data };
                this.rule.partnerBuying = data.id;
                break;
            case 'partnerSelling':
                this.selectedPartnerSelling = { field: 'shortName', value: data.shortName, data: data };
                this.rule.partnerSelling = data.id;
                break;
            default:
                break;
        }


    }

    submitSearch(formSearch: any) {
        const bodySearch: Partial<IRuleSearch> = {
            ruleName: formSearch.ruleName,
            servicebuying: formSearch.serviceBuying,
            serviceSelling: formSearch.serviceSelling,
            partnerBuying: this.rule.partnerBuying,
            partnerSelling: this.rule.partnerSelling,
            dateType: formSearch.dateType,
            fromDate: !!formSearch.date?.startDate?formatDate(formSearch.date.startDate, "yyyy-MM-dd", 'en'):null,
            toDate: !!formSearch.date?.endDate?formatDate(formSearch.date.endDate, "yyyy-MM-dd", 'en'):null,
            status: formSearch.status,
        };
        console.log(formSearch.date);
        this.onSearch.emit(bodySearch);
    }

    submitReset() {
        this.selectedPartnerBuying = { field: 'shortName', value: null, data: null };
        this.selectedPartnerSelling = { field: 'shortName', value: null, data: null };
        this.formSearchRule.reset();
        const bodySearch: Partial<IRuleSearch> = {
        };
        this.onSearch.emit(bodySearch);
    }

    resetDate(){
        this.date.setValue(null);
    }

    resetPartnerBuying(){
        this.rule.partnerBuying=null;
    }
    resetPartnerSelling(){
        this.rule.partnerSelling=null;
    }

}


interface IRuleSearch {
    ruleName: string;
    servicebuying: string;
    serviceSelling: string;
    partnerBuying: string;
    partnerSelling: string;
    dateType: string;
    fromDate: string;
    toDate: string;
    status: boolean;
}
