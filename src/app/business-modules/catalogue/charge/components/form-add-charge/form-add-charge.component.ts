import { Component, Input } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { ChargeConstants } from 'src/constants/charge.const';
import { CatChargeToAddOrUpdate } from 'src/app/shared/models/catalogue/catChargeToAddOrUpdate.model';
import { Observable } from 'rxjs';
import { Charge, ChartOfAccounts } from '@models';
import { CommonEnum } from '@enums';

@Component({
    selector: 'form-add-charge',
    templateUrl: 'form-add-charge.component.html'
})

export class FormAddChargeComponent extends AppForm {
    @Input() isUpdate: boolean = false;

    formGroup: FormGroup;

    code: AbstractControl;
    nameEn: AbstractControl;
    nameVn: AbstractControl;
    unit: AbstractControl;
    unitPrice: AbstractControl;
    currency: AbstractControl;
    vat: AbstractControl;
    type: AbstractControl;
    service: AbstractControl;
    debitCharge: AbstractControl;
    creditCharge: AbstractControl;

    chargeGroup: AbstractControl;
    active: AbstractControl;
    generateSelling: AbstractControl;
    mode: AbstractControl;

    ngDataUnit: any = [];
    ngDataCurrentcyUnit: any = [];
    activeServices: any = [];
    ngDataChargeGroup: any = [];
    chartOfAccounts: ChartOfAccounts[] = [];

    Charge: CatChargeToAddOrUpdate = null;
    serviceTypeId: string = '';

    requiredService: boolean = false;
    isSubmitted: boolean = false;
    isShowMappingSelling: boolean = false;
    isShowMappingBuying: boolean = false;

    ngDataType: Array<string> = ["CREDIT", "DEBIT", "OBH", "OTHER"];

    ngDataService = [
        { text: ChargeConstants.IT_DES, id: ChargeConstants.IT_CODE },
        { text: ChargeConstants.AI_DES, id: ChargeConstants.AI_CODE },
        { text: ChargeConstants.AE_DES, id: ChargeConstants.AE_CODE },
        { text: ChargeConstants.SFE_DES, id: ChargeConstants.SFE_CODE },
        { text: ChargeConstants.SFI_DES, id: ChargeConstants.SFI_CODE },
        { text: ChargeConstants.SLE_DES, id: ChargeConstants.SLE_CODE },
        { text: ChargeConstants.SLI_DES, id: ChargeConstants.SLI_CODE },
        { text: ChargeConstants.SCE_DES, id: ChargeConstants.SCE_CODE },
        { text: ChargeConstants.SCI_DES, id: ChargeConstants.SCI_CODE },
        { text: ChargeConstants.CL_DES, id: ChargeConstants.CL_CODE }
    ];

    debitCharges: Observable<Charge[]>;
    creditCharges: Observable<Charge[]>;

    modes: string[] = [
        "INTERNAL", "N.INV"
    ];

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo
    ) {
        super();
    }

    ngOnInit() {
        this.getUnit();
        this.getCurrency();
        this.getChargeGroup();
        this.initForm();
        this.debitCharges = this._catalogueRepo.getCharges({ active: true, type: CommonEnum.CHARGE_TYPE.DEBIT });
        this.creditCharges = this._catalogueRepo.getCharges({ active: true, type: CommonEnum.CHARGE_TYPE.CREDIT });
    }

    initForm() {
        this.formGroup = this._fb.group({
            code: [null, Validators.required],
            nameEn: [null, Validators.required],
            nameVn: [null, Validators.required],
            unit: [],
            unitPrice: [],
            currency: [],
            vat: [],
            type: [null, Validators.required],
            service: [null, Validators.required],
            debitCharge: [],
            chargeGroup: [],
            active: [true],
            generateSelling: [true],
            productDept: [],
            mode: [],
            creditCharge: [],

        });

        this.code = this.formGroup.controls["code"];
        this.nameEn = this.formGroup.controls["nameEn"];
        this.nameVn = this.formGroup.controls["nameVn"];
        this.unit = this.formGroup.controls["unit"];
        this.unitPrice = this.formGroup.controls["unitPrice"];
        this.currency = this.formGroup.controls["currency"];
        this.vat = this.formGroup.controls["vat"];
        this.type = this.formGroup.controls["type"];
        this.service = this.formGroup.controls["service"];
        this.debitCharge = this.formGroup.controls["debitCharge"];
        this.chargeGroup = this.formGroup.controls["chargeGroup"];
        this.active = this.formGroup.controls["active"];
        this.generateSelling = this.formGroup.controls["generateSelling"];
        this.mode = this.formGroup.controls["mode"];
        this.creditCharge = this.formGroup.controls["creditCharge"];

        this.type.valueChanges
            .subscribe(
                (value: any) => {
                    if (!!value && !!value.length) {
                        if (value.toLowerCase() === CommonEnum.CHARGE_TYPE.CREDIT.toLowerCase()) {
                            this.isShowMappingSelling = true;
                        } else {
                            this.isShowMappingSelling = false;
                        }
                        if (value.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase()
                            || value.toLowerCase() === CommonEnum.CHARGE_TYPE.DEBIT.toLowerCase()) {
                            this.isShowMappingBuying = true;
                        } else {
                            this.isShowMappingBuying = false;
                        }
                    }
                }
            );
    }

    checkValidateForm() {
        let valid: boolean = true;
        this.setError(this.service);
        this.setError(this.chargeGroup);
        this.setError(this.formGroup.controls['productDept']);
        if (!this.formGroup.valid) {
            valid = false;
        }

        return valid;
    }

    addCharge() {
        this.isSubmitted = true;
    }

    getUnit() {
        this._catalogueRepo.getUnit({}).subscribe((res: any) => {
            if (!!res) {
                const units = res;
                this.ngDataUnit = units.map(x => ({ text: x.code, id: x.id }));
            }

        });
    }

    getCurrency() {
        this._catalogueRepo.getCurrency().subscribe((res: any) => {
            if (!!res) {
                const currencies = res;
                this.ngDataCurrentcyUnit = currencies.map(x => ({ text: x.id + " - " + x.currencyName, id: x.id }));
            }
        });
    }

    getChargeGroup() {
        this._catalogueRepo.getChargeGroup().subscribe((res: any) => {
            if (!!res) {
                const chargeGroup = res;
                this.ngDataChargeGroup = chargeGroup.map(x => ({ text: x.name, id: x.id }));
            }
        });
    }



    getCurrentActiveService(ChargeService: any) {
        const listService = ChargeService.split(";");
        const activeServiceList: any = [];
        listService.forEach(item => {
            const element = this.ngDataService.find(x => x.id === item);
            if (element !== undefined) {
                const activeService = element;
                activeServiceList.push(activeService);
            }
        });
        console.log(activeServiceList);
        
        return activeServiceList;
    }

    selected(value: any) {
        if (value !== undefined) {
            this.requiredService = false;
        }
    }

    updateDataToForm(res: CatChargeToAddOrUpdate) {
        this.serviceTypeId = res.charge.serviceTypeId;
        this.formGroup.patchValue({
            code: res.charge.code,
            nameEn: res.charge.chargeNameEn,
            nameVn: res.charge.chargeNameVn,
            unitPrice: res.charge.unitPrice,
            currency: res.charge.currencyId,
            vat: res.charge.vatrate,
            type: res.charge.type,
            service: this.activeServices,
            debitCharge: res.charge.debitCharge,
            chargeGroup: res.charge.chargeGroup,
            active: res.charge.active,
            productDept: res.charge.productDept,
            unit: res.charge.unitId,
            mode: res.charge.mode,
            creditCharge: res.charge.creditCharge,
        });
        console.log(this.service);
    }
}
