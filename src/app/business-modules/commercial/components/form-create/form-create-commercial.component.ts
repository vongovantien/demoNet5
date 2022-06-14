import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from '@repositories';
import { CountryModel, ProviceModel, Partner } from '@models';
import { JobConstants, SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { Observable } from 'rxjs';
import { shareReplay, catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'form-create-commercial',
    templateUrl: './form-create-commercial.component.html',
})
export class CommercialFormCreateComponent extends AppForm implements OnInit {

    formGroup: FormGroup;
    partnerNameEn: AbstractControl;
    shortName: AbstractControl;
    partnerNameVn: AbstractControl;
    internalReferenceNo: AbstractControl;
    taxCode: AbstractControl;
    inter: AbstractControl;
    countryShippingId: AbstractControl;
    countryId: AbstractControl; // * Billing country
    countryName: AbstractControl;
    provinceShippingId: AbstractControl;
    provinceId: AbstractControl; // * Billing Province
    parentId: AbstractControl; // * A/C
    countryShippingName: AbstractControl;
    provinceShippingName: AbstractControl;
    provinceName: AbstractControl;
    addressShippingEn: AbstractControl;
    addressShippingVn: AbstractControl;
    addressEn: AbstractControl;
    addressVn: AbstractControl;
    partnerLocation: AbstractControl;
    countries: Observable<CountryModel[]>;
    cities: Observable<ProviceModel[]>;
    acRefCustomers: Observable<Partner[]>;

    shippingProvinces: ProviceModel[];
    initShippingProvinces: ProviceModel[];
    billingProvinces: ProviceModel[];
    initbillingProvinces: ProviceModel[];
    billingsProvinces: ProviceModel[] = [];
    shipingsProvinces: ProviceModel[] = [];

    displayFieldCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldCity: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_CITY_PROVINCE;
    displayFieldCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;

    partnerLocations: Array<string> = ['Domestic', 'Oversea'];

    isExistedTaxcode: boolean = false;
    @Input() isActive: boolean = false;
    @Input() isUpdate: boolean = false;
    @Output() partnerLocationString: EventEmitter<string> = new EventEmitter<string>();
    isBranchSub: boolean;
    parentName: string = '';
    provinceIdName: string;
    countryIdName: string;
    countryShippingIdName: string;
    provinceShippingIdName: string;
    partnerId: string = '';
    active: boolean = false;
    //
    @ViewChild('focusInput') internalReferenceRef: ElementRef;


    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _fb: FormBuilder
    ) {
        super();
    }

    ngOnInit(): void {
        this.countries = this._catalogueRepo.getCountry().pipe(shareReplay());

        this.acRefCustomers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.getProvinces();
        if (this.isUpdate) {
            this.getShippingProvinces();
            this.getBillingProvinces();
        }

        this.initForm();
    }

    getProvinces() {
        this._catalogueRepo.getProvinces()
            .subscribe(
                (provinces: ProviceModel[]) => {
                    this.billingProvinces = this.shippingProvinces = this.initShippingProvinces = this.initbillingProvinces = provinces;
                }
            );
    }

    initForm() {
        this.formGroup = this._fb.group({
            accountNo: [{ value: null, disabled: true }],
            partnerNameEn: [null, Validators.required],
            partnerNameVn: [null, Validators.required],
            shortName: [null, Validators.required],
            taxCode: [null, Validators.compose([
                Validators.maxLength(14),
                Validators.minLength(7),
                // Validators.pattern(SystemConstants.CPATTERN.NOT_WHITE_SPACE),
                Validators.pattern(SystemConstants.CPATTERN.TAX_CODE),
                Validators.required
            ])],
            internalReferenceNo: [null, Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(3),
                Validators.pattern(SystemConstants.CPATTERN.TAX_CODE),
            ])],
            addressShippingEn: [null, Validators.required],
            addressShippingVn: [null, Validators.required],
            addressVn: [null, Validators.required],
            addressEn: [null, Validators.required],
            zipCode: [],
            zipCodeShipping: [],
            contactPerson: [],
            tel: [],
            fax: [],
            workPhoneEx: [],
            email: [],
            billingEmail: [],
            billingPhone: [],
            countryName: [],
            countryShippingName: [],
            provinceShippingName: [],
            provinceName: [],

            countryShippingId: [null, Validators.required],
            provinceShippingId: [],
            countryId: [null, Validators.required],
            provinceId: [],
            parentId: [],
            partnerLocation: [null, Validators.required],
            bankAccountName: []
        });

        this.partnerNameEn = this.formGroup.controls["partnerNameEn"];
        this.partnerNameVn = this.formGroup.controls["partnerNameVn"];
        this.shortName = this.formGroup.controls["shortName"];
        this.taxCode = this.formGroup.controls["taxCode"];
        this.internalReferenceNo = this.formGroup.controls["internalReferenceNo"];
        this.countryShippingId = this.formGroup.controls["countryShippingId"];
        this.provinceShippingId = this.formGroup.controls["provinceShippingId"];
        this.countryId = this.formGroup.controls["countryId"];
        this.countryName = this.formGroup.controls["countryName"];
        this.countryShippingName = this.formGroup.controls["countryShippingName"];
        this.provinceShippingName = this.formGroup.controls["provinceShippingName"];
        this.provinceName = this.formGroup.controls["provinceName"];
        this.provinceId = this.formGroup.controls["provinceId"];
        this.parentId = this.formGroup.controls["parentId"];
        this.addressShippingEn = this.formGroup.controls["addressShippingEn"];
        this.addressShippingVn = this.formGroup.controls["addressShippingVn"];
        this.addressEn = this.formGroup.controls["addressEn"];
        this.addressVn = this.formGroup.controls["addressVn"];
        this.partnerLocation = this.formGroup.controls["partnerLocation"];
        this.isDisabled = this.parentId != null && !this.isUpdate ? true : false;
    }

    onRemove() {
        this.parentName = null;
        if (!this.parentId.value) {
            this.isDisabled = true;
        }
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'acRef':
                this.parentName = data.shortName;
                this.parentId.setValue(data.id);
                if (!!this.parentId.value && this.isUpdate && this.parentId.value !== this.partnerId) {
                    this.isDisabled = false;
                }
                else {
                    this.isDisabled = true;
                }
                break;
            case 'shippping-country':
                this.countryShippingIdName = data.nameEn;
                this.countryShippingId.setValue(data.id);
                this.provinceShippingIdName = null;
                this.provinceShippingId.setValue(data.id);

                this.getShippingProvinces(data.id, !!this.provinceShippingId.value ? this.provinceShippingId.value : null);
                break;
            case 'shippping-city':
                this.provinceShippingIdName = data.name_EN;
                this.provinceShippingId.setValue(data.id);
                break;
            case 'billing-country':
                this.countryIdName = data.nameEn;
                this.countryId.setValue(data.id);
                this.provinceIdName = null;
                this.provinceId.setValue(data.id);

                this.getBillingProvinces(data.id, !!this.provinceId.value ? this.provinceId.value : null);
                break;
            case 'billing-city':
                this.provinceIdName = data.name_EN;
                this.provinceId.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getBillingProvince(countryId: number) {
        this.provinceId.setValue(null);
        this.provinceName.setValue(null);

        this.billingProvinces = [...this.initbillingProvinces.filter(x => x.countryID === countryId)];
        if (this.billingProvinces.length === 1) {
            this.provinceId.setValue(this.billingProvinces[0].id);
        } else {
            this.provinceId.setValue(null);
        }
    }

    copyInfoShipping(event: Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        this.countryId.setValue(this.countryShippingId.value);
        //a thương gọi hàm thiếu s nha!
        this.getBillingProvinces(this.countryShippingId.value);

        this.provinceId.setValue(this.provinceShippingId.value);

        this.formGroup.controls['zipCode'].setValue(this.formGroup.controls['zipCodeShipping'].value);
        this.formGroup.controls['addressVn'].setValue(this.formGroup.controls['addressShippingVn'].value);
        this.formGroup.controls['addressEn'].setValue(this.formGroup.controls['addressShippingEn'].value);

    }

    getShippingProvinces(countryId?: number, provinceId: string = null) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {

                        this.shipingsProvinces = res;
                        if (!!provinceId) {
                            const obj = this.shipingsProvinces.find(x => x.id === provinceId);

                            if (obj === undefined) {
                                this.provinceShippingId.setValue(null);
                            }
                        }
                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.shipingsProvinces = res;
                    }
                );
        }
    }

    getBillingProvinces(countryId?: number, provinceId: string = null) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.billingsProvinces = res;
                        if (!!provinceId) {
                            const obj = this.billingsProvinces.find(x => x.id === provinceId);
                            if (obj === undefined) {
                                this.provinceId.setValue(null);
                            }
                        }

                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.billingsProvinces = res;
                    }
                );
        }
    }
    //
    handleFocusInternalReference() {
        this.setFocusInput(this.internalReferenceRef);
        console.log('data', this.internalReferenceRef)
    }

    getACRefName(parentId: string) {
        let isFounded = false;
        this.parentName = '';
        this.acRefCustomers
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe((x) => {
                x.every(element => {
                    if (!isFounded && element.id === parentId) {
                        isFounded = true;
                        return true;
                    }
                });
            });
        if (!isFounded) {
            this._catalogueRepo.getDetailPartner(parentId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res: Partner) => {
                        if (!!res) {
                            this.parentId.setValue(parentId);
                            this.parentName = res.shortName;
                        }
                    }
                );
        }
    }
    selectedPartnerLocation(value: any) {
        this.partnerLocationString.emit(value);
    }

}
