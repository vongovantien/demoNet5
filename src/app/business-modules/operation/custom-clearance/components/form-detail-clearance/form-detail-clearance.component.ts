import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from '@repositories';
import { Observable } from 'rxjs';
import { Customer, PortIndex, CountryModel, Commodity, Unit } from '@models';
import { CommonEnum } from '@enums';
import { GetCataloguePortAction, getCataloguePortState, GetCatalogueCountryAction, getCatalogueCountryState, GetCatalogueCommodityAction, getCatalogueCommodityState, GetCataloguePackageAction, getCataloguePackageState, getCurrentUserState } from '@store';
import { IShareBussinessState } from '@share-bussiness';
import { Store } from '@ngrx/store';
import { CustomClearance } from 'src/app/shared/models/tool-setting/custom-clearance.model';
import { formatDate } from '@angular/common';
import { JobConstants } from '@constants';
import { FormValidators } from '@validators';
import { filter, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'custom-clearance-form-detail',
    templateUrl: './form-detail-clearance.component.html'
})
export class CustomClearanceFormDetailComponent extends AppForm implements OnInit {
    formGroup: FormGroup;
    customDeclaration: CustomClearance = new CustomClearance();

    clearanceNo: AbstractControl;
    partnerTaxCode: AbstractControl;
    clearanceDate: AbstractControl;
    hblid: AbstractControl;
    mblid: AbstractControl;
    serviceType: AbstractControl;
    gateway: AbstractControl;
    type: AbstractControl;
    route: AbstractControl;
    cargoType: AbstractControl;
    exportCountry: AbstractControl;
    importCountry: AbstractControl;
    commodity: AbstractControl;
    grossWeight: AbstractControl;
    netWeight: AbstractControl;
    cbm: AbstractControl;
    qtyCont: AbstractControl;
    pcs: AbstractControl;
    unit: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    note: AbstractControl;

    customers: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    countries: Observable<CountryModel[]>;
    commodities: Observable<Commodity[]>;
    units: Observable<Unit[]>;

    cargoTypes: string[] = ['FCL', 'LCL'];
    serviceTypes: string[] = JobConstants.COMMON_DATA.PRODUCTSERVICE;
    typeClearances: string[] = JobConstants.COMMON_DATA.SERVICEMODES;
    routeClearances: string[] = JobConstants.COMMON_DATA.ROUTES;
    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountNo', label: 'Partner ID' },
        { field: 'shortName', label: 'Name Abbr' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;
    displayFieldCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldCommodity: CommonInterface.IComboGridDisplayField[] = [
        { 'field': 'code', 'label': 'Commodity Code' },
        { 'field': 'commodityNameEn', 'label': 'Commodity Name (EN)' }
    ];
    displayFieldUnit: CommonInterface.IComboGridDisplayField[] = [
        { 'field': 'code', 'label': 'Unit Code' },
        { 'field': 'unitNameEn', 'label': 'Unit Name (EN)' }
    ];
    isConvertJob: boolean = false;
    isDisableCargo: boolean = false;
    taxCode: string = '';
    customerName: string = '';
    customerId: string;
    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IShareBussinessState>,
    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port }));
        this._store.dispatch(new GetCatalogueCommodityAction());
        this._store.dispatch(new GetCatalogueCountryAction());

        // this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        this.customers = this._store.select(getCurrentUserState)
            .pipe(
                filter(c => !!c.userName),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getPartnerByGroups(
                            [CommonEnum.PartnerGroupEnum.CUSTOMER],
                            true,
                            'CL',
                            currentUser?.officeId
                        ).pipe(startWith([]))
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            ) as any;
        this.ports = this._store.select(getCataloguePortState);
        this.countries = this._store.select(getCatalogueCountryState);
        this.commodities = this._store.select(getCatalogueCommodityState);
        this.units = this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE });

        this.initForm();
    }
    initForm() {
        this.formGroup = this._fb.group({
            clearanceNo: ['', Validators.compose([
                Validators.required,
            ])],
            partnerTaxCode: [null, Validators.required],
            clearanceDate: [null, Validators.required],
            hblid: [null, FormValidators.validateSpecialChar],
            mblid: [null, FormValidators.validateSpecialChar],
            serviceType: [null],
            gateway: [null, Validators.compose([
                Validators.required,
            ])],
            type: [null, Validators.compose([
                Validators.required,
            ])],
            route: [null],
            cargoType: [null],
            exportCountry: [null],
            importCountry: [null],
            commodity: [null],
            grossWeight: [null],
            netWeight: [null],
            cbm: [null],
            qtyCont: [null],
            pcs: [null],
            unit: [null],
            shipper: [null],
            consignee: [null],
            note: [null]
        });

        this.clearanceNo = this.formGroup.controls['clearanceNo'];
        this.partnerTaxCode = this.formGroup.controls['partnerTaxCode'];
        this.clearanceDate = this.formGroup.controls['clearanceDate'];
        this.hblid = this.formGroup.controls['hblid'];
        this.mblid = this.formGroup.controls['mblid'];
        this.serviceType = this.formGroup.controls['serviceType'];
        this.gateway = this.formGroup.controls['gateway'];
        this.type = this.formGroup.controls['type'];
        this.route = this.formGroup.controls['route'];
        this.cargoType = this.formGroup.controls['cargoType'];
        this.exportCountry = this.formGroup.controls['exportCountry'];
        this.importCountry = this.formGroup.controls['importCountry'];
        this.commodity = this.formGroup.controls['commodity'];
        this.grossWeight = this.formGroup.controls['grossWeight'];
        this.netWeight = this.formGroup.controls['netWeight'];
        this.cbm = this.formGroup.controls['cbm'];
        this.qtyCont = this.formGroup.controls['qtyCont'];
        this.pcs = this.formGroup.controls['pcs'];
        this.unit = this.formGroup.controls['unit'];
        this.shipper = this.formGroup.controls['shipper'];
        this.consignee = this.formGroup.controls['consignee'];
        this.note = this.formGroup.controls['note'];
    }

    setFormValue() {
        this.formGroup.patchValue({
            clearanceNo: this.customDeclaration.clearanceNo,
            partnerTaxCode: this.customDeclaration.accountNo,
            clearanceDate: !!this.customDeclaration.clearanceDate ? { startDate: new Date(this.customDeclaration.clearanceDate), endDate: new Date(this.customDeclaration.clearanceDate) } : null,
            hblid: this.customDeclaration.hblid,
            mblid: this.customDeclaration.mblid,
            gateway: this.customDeclaration.gateway,
            exportCountry: this.customDeclaration.exportCountryCode,
            importCountry: this.customDeclaration.importCountryCode,
            commodity: this.customDeclaration.commodityCode,
            grossWeight: this.customDeclaration.grossWeight,
            netWeight: this.customDeclaration.netWeight,
            cbm: this.customDeclaration.cbm,
            qtyCont: this.customDeclaration.qtyCont,
            pcs: this.customDeclaration.pcs,
            unit: this.customDeclaration.unitCode,
            shipper: this.customDeclaration.shipper,
            consignee: this.customDeclaration.consignee,
            note: this.customDeclaration.note,

            route: this.customDeclaration.route,
            type: this.customDeclaration.type,
            serviceType: this.customDeclaration.serviceType,
            cargoType: this.customDeclaration.cargoType,
        });

        if (!!this.customDeclaration.serviceType) {
            if (this.customDeclaration.serviceType === 'Air' || this.customDeclaration.serviceType === 'Express') {
                this.isDisableCargo = true;
                this.cargoType.disable();
            } else {
                this.isDisableCargo = false;
                this.cargoType.enable();
            }
        }
        this.customerName = this.customDeclaration.customerName;
        this.customerId = this.customDeclaration.customerId;

    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.customerName = data.shortName;
                this.partnerTaxCode.setValue(data.accountNo);
                this.taxCode = data.taxCode;
                this.customerId = data.id;
                break;
            case 'gateway':
                this.gateway.setValue(data.code);
                break;
            case 'exportCountry':
                this.exportCountry.setValue(data.code);
                break;
            case 'importCountry':
                this.importCountry.setValue(data.code);
                break;
            case 'commodity':
                this.commodity.setValue(data.code);
                break;
            case 'unit':
                this.unit.setValue(data.code);
                break;
        }
    }

    selectedServiceType(event, type: string) {
        switch (type) {
            case 'service-type':
                const serviceType = event;
                if (!!serviceType) {
                    if (serviceType === 'Air' || serviceType === 'Express') {
                        this.isDisableCargo = true;
                        this.formGroup.controls['cargoType'].setValue(null);
                        this.formGroup.controls['cargoType'].disable();
                    } else {
                        this.isDisableCargo = false;
                        this.formGroup.controls['cargoType'].enable();
                    }
                }
                break;
            case 'cargo-type':
                if (this.serviceType.value === null) {
                    this.formGroup.controls['serviceType'].setValue('Sea');
                }
                break;
        }
    }

    getClearance() {
        const form = this.formGroup.getRawValue();
        console.log(form);
        this.customDeclaration.clearanceNo = !!form.clearanceNo ? form.clearanceNo.trim() : null;
        this.customDeclaration.partnerTaxCode = !!this.taxCode ? this.taxCode : this.customDeclaration.partnerTaxCode;
        this.customDeclaration.clearanceDate = !!form.clearanceDate && !!form.clearanceDate.startDate ? formatDate(form.clearanceDate.startDate, 'yyyy-MM-dd', 'en') : null;
        this.customDeclaration.hblid = !!form.hblid ? form.hblid.trim() : null;
        this.customDeclaration.mblid = !!form.mblid ? form.mblid.trim() : null;
        this.customDeclaration.gateway = form.gateway;
        this.customDeclaration.exportCountryCode = form.exportCountry;
        this.customDeclaration.importCountryCode = form.importCountry;
        this.customDeclaration.commodityCode = form.commodity;
        this.customDeclaration.grossWeight = form.grossWeight;
        this.customDeclaration.netWeight = form.netWeight;
        this.customDeclaration.cbm = form.cbm;
        this.customDeclaration.qtyCont = form.qtyCont;
        this.customDeclaration.pcs = form.pcs;
        this.customDeclaration.unitCode = form.unit;
        this.customDeclaration.shipper = !!form.shipper ? form.shipper.trim() : null;
        this.customDeclaration.consignee = !!form.consignee ? form.consignee.trim() : null;
        this.customDeclaration.note = !!form.note ? form.note.trim() : null;

        this.customDeclaration.cargoType = form.cargoType;
        this.customDeclaration.route = form.route;
        this.customDeclaration.serviceType = form.serviceType;
        this.customDeclaration.type = form.type;
        this.customDeclaration.accountNo = !!form.partnerTaxCode ? form.partnerTaxCode.trim() : null;
        this.customDeclaration.customerId = this.customerId;
    }
}
