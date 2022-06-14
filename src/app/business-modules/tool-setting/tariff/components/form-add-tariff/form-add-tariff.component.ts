import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TariffFormSearchComponent } from '../form-search-tariff/form-search-tariff.component';
import { DataService } from 'src/app/shared/services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { SystemConstants } from 'src/constants/system.const';

import { CatalogueRepo, SystemRepo, DocumentationRepo } from '@repositories';

import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Tariff, Partner, Company, Customer } from '@models';

@Component({
    selector: 'form-add-tariff',
    templateUrl: './form-add-tariff.component.html',
})
export class TariffFormAddComponent extends TariffFormSearchComponent {

    @Input() tariff: Tariff = new Tariff();
    @Output() tafiffChange: EventEmitter<Tariff> = new EventEmitter<Tariff>();

    formAdd: FormGroup;
    productSerices: CommonInterface.IValueDisplay[];
    serviceModes: CommonInterface.IValueDisplay[];
    cargoTypes: CommonInterface.IValueDisplay[];

    carries: any[] = [];
    agents: any[] = [];

    selectedSupplier: Partial<CommonInterface.IComboGridData> | any = {};
    selectedAgent: Partial<CommonInterface.IComboGridData> | any = {};

    isDisabledCustomer: boolean = true;
    isDisabledSupplier: boolean = true;
    isDisabledAgent: boolean = true;
    minDateExpired: any = null;

    constructor(
        protected _dataService: DataService,
        protected _catalogueRepo: CatalogueRepo,
        protected _fb: FormBuilder,
        protected _systemRepo: SystemRepo,
        private _documentRepo: DocumentationRepo
    ) {
        super(_dataService, _catalogueRepo, _systemRepo, _fb);
    }

    ngOnInit() {
        this.configCustomer = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'taxCode', label: 'Partner Code' },
                { field: 'shortName', label: 'Abbr Name' },
                { field: 'partnerNameEn', label: 'Name EN' },
            ]
        }, { selectedDisplayFields: ['shortName'], });

        this.configOffice = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'code', label: 'Office Code' },
                { field: 'shortName', label: 'Office' },
                { field: 'companyName', label: 'Company' },
            ],
        }, { selectedDisplayFields: ['shortName', 'companyName'], });


        this.initFormAdd();

        this.getOPSShipmentCommonData();
        this.initBasicDataAdd();

        this.getCustomer();
        this.getCarrierAndAgent();
        this.getOffice();
    }

    getOPSShipmentCommonData() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.OPS_COMMON_DATA)) {
            const res: any = this._dataService.getDataByKey(SystemConstants.CSTORAGE.OPS_COMMON_DATA);
            this.productSerices = res.productServices || [];
            this.serviceModes = res.serviceModes || [];
        } else {
            this._documentRepo.getOPSShipmentCommonData()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: CommonInterface.ICommonShipmentData) => {
                        this.productSerices = res.productServices;
                        this.serviceModes = res.serviceModes;

                        this._dataService.setDataService(SystemConstants.CSTORAGE.OPS_COMMON_DATA, res);
                    }
                );
        }

    }

    initBasicDataAdd() {
        this.status = [
            { displayName: 'Active', value: true },
            { displayName: 'Inactive', value: false },
        ];

        this.tariffTypes = [
            { displayName: 'General', value: 'General' },
            { displayName: 'Customer', value: 'Customer' },
            { displayName: 'Supplier', value: 'Supplier' },
            { displayName: 'Agent', value: 'Agent' },
        ];

        this.cargoTypes = [
            { displayName: 'FCL', value: 'FCL' },
            { displayName: 'LCL', value: 'FCL' },
        ];

        // * Set default tariffType.
        this.formAdd.controls['tariff'].get('tariffType').setValue(this.tariffTypes[0]);
    }

    initFormAdd() {
        this.formAdd = this._fb.group({
            tariff: this._fb.group({
                tariffName: [this.tariff.tariffName, Validators.compose([
                    Validators.required
                ])],
                tariffType: [this.tariff.tariffType, Validators.required,],
                status: [this.tariff.status, Validators.compose([
                    Validators.required
                ])],
                effectiveDate: [this.tariff.effectiveDate, Validators.compose([
                    Validators.required
                ])],
                expiredDate: [this.tariff.expiredDate, Validators.compose([
                    Validators.required
                ])],
                productService: [this.tariff.productService, Validators.compose([
                    Validators.required
                ])],
                cargoType: [this.tariff.cargoType, Validators.compose([
                    Validators.required
                ])],
                serviceMode: [this.tariff.serviceMode, Validators.compose([
                    Validators.required
                ])],
                description: [this.tariff.description, Validators.compose([
                    Validators.required
                ])]
            })
        });
        this.formAdd.controls['tariff'].get("effectiveDate").valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                map((data: any) => data.startDate)
            )
            .subscribe((value: any) => {
                this.resetFormControl(this.formAdd.controls['tariff'].get("expiredDate"));
                this.minDateExpired = value; // * Update MinDate -> ExpiredDate.
            });
    }

    getCarrierAndAgent() {
        if (this._dataService.getDataByKey(SystemConstants.CSTORAGE.CARRIER)) {
            this.carries = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CARRIER);
        }
        if (this._dataService.getDataByKey(SystemConstants.CSTORAGE.AGENT)) {
            this.agents = this._dataService.getDataByKey(SystemConstants.CSTORAGE.AGENT);
        } else {
            forkJoin([
                this._catalogueRepo.getPartnersByType(PartnerGroupEnum.CARRIER),
                this._catalogueRepo.getPartnersByType(PartnerGroupEnum.AGENT),
            ]).pipe(catchError(this.catchError))
                .subscribe(
                    ([carries, agents]: any[] = [[], []]) => {
                        this.carries = carries;
                        this.agents = agents;

                        this._dataService.setDataService(SystemConstants.CSTORAGE.CARRIER, carries);
                        this._dataService.setDataService(SystemConstants.CSTORAGE.AGENT, agents);
                    }
                );
        }

    }

    onSelectDataFormInfo(data: Customer | Partner | Company | any, key: string | any) {
        switch (key) {
            case 'customer':
                this.selectedCustomer = { field: 'shortName', value: data.shortName, data: data };
                this.tariff.customerId = data.id;

                // * Update Form Group
                this.formAdd.value.tariff.customerId = data.id;
                break;
            case 'agent':
                this.selectedAgent = { field: 'shortName', value: data.shortName, data: data };
                this.tariff.agentId = data.id;

                // * Update Form Group
                this.formAdd.value.tariff.agentId = data.id;
                break;
            case 'office':
                this.selectedOffice = { field: 'shortName', value: data.shortName, data: data };
                this.tariff.officeId = data.id;

                // * Update Form Group
                this.formAdd.value.tariff.officeId = data.id;
                break;
            case 'supplier':
                this.selectedSupplier = { field: 'shortName', value: data.shortName, data: data };
                this.tariff.supplierId = data.id;

                // * Update Form Group
                this.formAdd.value.tariff.supplierId = data.id;
                break;
            default:
                break;
        }


    }

    onChangeTariffType(tariffType: CommonInterface.IValueDisplay) {
        switch (tariffType.value) {
            case 'Customer':
                this.isDisabledCustomer = false;
                this.isDisabledSupplier = true;
                this.isDisabledAgent = true;
                [this.selectedAgent, this.selectedSupplier] = [{}, {}];
                [this.tariff.agentId, this.tariff.supplierId] = [null, null];

                break;
            case 'Supplier':
                this.isDisabledSupplier = false;
                this.isDisabledCustomer = true;
                this.isDisabledAgent = true;
                [this.selectedAgent, this.selectedCustomer] = [{}, {}];
                [this.tariff.agentId, this.tariff.customerId] = [null, null];

                break;
            case 'Agent':
                this.isDisabledAgent = false;
                this.isDisabledSupplier = true;
                this.isDisabledCustomer = true;
                [this.selectedSupplier, this.selectedCustomer] = [{}, {}];
                [this.tariff.supplierId, this.tariff.customerId] = [null, null];

                break;
            default:
                [this.isDisabledCustomer, this.isDisabledSupplier, this.isDisabledAgent] = [true, true, true];
                [this.selectedCustomer, this.selectedAgent, this.selectedSupplier] = [{}, {}, {}];
                [this.tariff.supplierId, this.tariff.customerId, this.tariff.agentId] = [null, null, null];

                break;
        }
    }

}
