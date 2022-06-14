import { Component, ViewChild, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { SalemanPopupComponent } from '../saleman-popup.component';
import { Partner, CountryModel, ProviceModel, Bank } from 'src/app/shared/models';
import { FormValidators } from 'src/app/shared/validators/form.validator';
import { PartnerOtherChargePopupComponent } from '../other-charge/partner-other-charge.popup';
import { JobConstants, SystemConstants } from '@constants';
import { Observable } from 'rxjs';
import { GetCatalogueBankAction, getCatalogueBankState, getMenuUserSpecialPermissionState, IAppState } from '@store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'form-add-partner',
    templateUrl: './form-add-partner.component.html'
})

export class FormAddPartnerComponent extends AppForm {

    @ViewChild(SalemanPopupComponent) poupSaleman: SalemanPopupComponent;
    @ViewChild(PartnerOtherChargePopupComponent) otherChargePopup: PartnerOtherChargePopupComponent;

    @Output() requireSaleman = new EventEmitter<boolean>();
    @Input() isUpdate: boolean = false;
    //
    @ViewChild('focusInput') internalReferenceRef: ElementRef;

    displayFieldCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldCity: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_CITY_PROVINCE;

    menuSpecialPermission: Observable<any[]>;

    parentCustomers: any[] = [];
    partnerGroups: any[] = [];
    countries: any[];
    shippingProvinces: any[] = [];
    billingProvinces: any[] = [];
    workPlaces: any[] = [];
    isExistedTaxcode: boolean = false;

    nations: Observable<CountryModel[]>;
    billingsProvinces: ProviceModel[] = [];
    shipingsProvinces: ProviceModel[] = [];
    provinces: Observable<ProviceModel[]>;

    countryShippingIdName: string;
    countryIdName: string;
    shippingProvinceName: string;
    billingProvinceName: string;

    partnerForm: FormGroup;
    isSubmitted: boolean = false;
    isDisabledInternalCode: boolean = false;
    partnerAccountNo: AbstractControl;
    internalReferenceNo: AbstractControl;
    partnerNameEn: AbstractControl;
    partnerNameVn: AbstractControl;
    shortName: AbstractControl;
    partnerAccountRef: AbstractControl;
    parentName: string = '';

    taxCode: AbstractControl;
    partnerGroup: AbstractControl;
    countryShippingId: AbstractControl;
    provinceShippingId: AbstractControl;
    zipCodeShipping: AbstractControl;
    addressShippingEn: AbstractControl;
    addressShippingVn: AbstractControl;
    countryId: AbstractControl;
    provinceId: AbstractControl;
    zipCode: AbstractControl;
    addressEn: AbstractControl;
    addressVn: AbstractControl;
    contactPerson: AbstractControl;
    tel: AbstractControl;
    fax: AbstractControl;
    workPhoneEx: AbstractControl;
    email: AbstractControl;

    bankAccountNo: AbstractControl;
    bankAccountName: AbstractControl;
    bankAccountAddress: AbstractControl;
    swiftCode: AbstractControl;

    active: AbstractControl;
    activePartner: boolean = false;
    note: AbstractControl;
    public: boolean = false;
    coLoaderCode: AbstractControl;
    roundUpMethod: AbstractControl;
    applyDim: AbstractControl;
    billingEmail: AbstractControl;
    billingPhone: AbstractControl;
    groups: string = '';
    partnerMode: AbstractControl;
    partnerLocation: AbstractControl;
    internalCode: AbstractControl;
    isAddBranchSub: boolean;
    creditPayment: AbstractControl;
    bankName: AbstractControl;
    roundMethods: CommonInterface.INg2Select[] = [
        { id: 'Standard', text: 'Standard' },
        { id: '0.5', text: 'Round 0.5' },
        { id: '1.0', text: 'Round 1.0' },
    ];

    applyDims: CommonInterface.INg2Select[] = [
        { id: 'Single', text: 'Single Dim' },
        { id: 'Total', text: 'Total Dim' }
    ];

    partnerModes: Array<string> = ['Internal', 'External'];

    partnerLocations: Array<string> = ['Domestic', 'Oversea'];

    creditPayments: Array<string> = ['Credit', 'Direct'];

    displayFieldCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    
    banks: Observable<Bank[]>;
    displayFieldBank: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Bank Code' },
        { field: 'bankNameEn', label: 'Bank Name EN' },
    ];
    bankCode:AbstractControl;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>
    ) {
        super();
    }
    ngOnInit() {
        this._store.dispatch(new GetCatalogueBankAction());
        this.banks = this._store.select(getCatalogueBankState);

        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.initForm();
        this.getCountryProvince();
        if (this.isUpdate) {
            this.getShippingProvinces();
            this.getBillingProvinces();
        }
    }
    getCountryProvince() {
        this.nations = this._catalogueRepo.getCountry();
        this._catalogueRepo.getProvinces()
            .subscribe(
                (provinces: ProviceModel[]) => {
                    this.billingProvinces = this.shippingProvinces = provinces;
                }
            );

    }
    onChange(event: any, type: string) {
        switch (type) {
            case 'countryShippingId':
                this.getShippingProvinces(event.id, !!this.provinceShippingId.value && this.provinceShippingId.value.length > 0 ? this.provinceShippingId.value[0].id : null);
                break;
            case 'countryId':
                this.getBillingProvinces(event.id, !!this.provinceId.value && this.provinceId.value.length > 0 ? this.provinceId.value[0].id : null);
                break;
            case 'category':

                // case: current value === All
                if (event.length > 0) {
                    if (event[event.length - 1].id === 'ALL') {
                        const temp = { text: event[event.length - 1].text, id: event[event.length - 1].id };
                        this.partnerGroup.setValue([temp]);
                    } else {
                        // check partnerGroup existed yet.
                        const checkExistAll = [...this.partnerGroup.value].filter(e => e.id === 'ALL');
                        // 
                        if (checkExistAll.length <= 0) {
                            // don't anything at here
                        } else {
                            // partnerGroup added current item, so filter delete current item, to avoid duplicate.
                            let removeAllArray = [...this.partnerGroup.value].filter(e => e.id !== 'ALL' && e.id !== event.id);

                            removeAllArray.push({ id: event.id, text: event.text });
                            removeAllArray = removeAllArray.filter(x => x.id !== undefined);
                            this.partnerGroup.setValue(removeAllArray);
                        }
                    }
                }

                //
                break;
        }
    }

    removed(event, type: string) {
        switch (type) {
            case 'countryShippingId':
                this.getShippingProvinces();
                this.partnerForm.controls['provinceShippingId'].setValue([]);
                break;
            case 'countryId':
                this.getBillingProvinces();
                this.partnerForm.controls['provinceId'].setValue([]);
                break;
            case 'category':
                this.groups = this.groups.replace(event.id, '');
                const isShowSaleMan = this.checkRequireSaleman();
                this.requireSaleman.emit(isShowSaleMan);
                break;
        }
    }

    checkRequireSaleman(): boolean {

        if (!!this.groups && (this.groups.includes("ALL") || this.groups.includes("CUSTOMER"))) {
            return true;
        } else {
            return false;
        }
    }

    getBillingProvinces(countryId?: number, provinceId: string = null) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.billingProvinces = res;
                        if (!!provinceId) {
                            const obj = this.billingProvinces.find(x => x.id === provinceId);
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
                        this.billingProvinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }

    getShippingProvinces(countryId?: number, provinceId: string = null) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.shippingProvinces = res;
                        if (!!provinceId) {
                            const obj = this.shippingProvinces.find(x => x.id === provinceId);
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
                        this.shippingProvinces = res;
                    }
                );
        }

    }

    onRemove() {
        this.parentName = null;
        if (!this.partnerAccountRef.value) {
            this.isDisabled = true;
        }
    }

    initForm() {
        this.partnerForm = this._fb.group({
            partnerAccountNo: [{ value: null, disabled: true }],
            internalReferenceNo: [null, Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(3),
                Validators.pattern(SystemConstants.CPATTERN.TAX_CODE),
            ])],
            partnerNameEn: [null, Validators.compose([

                FormValidators.required,
            ])],
            partnerNameVn: [null, Validators.compose([
                FormValidators.required,
            ])],
            shortName: [null, Validators.compose([
                FormValidators.required
            ])],
            partnerAccountRef: [],
            taxCode: [null, Validators.compose([
                Validators.maxLength(14),
                Validators.minLength(7),
                Validators.pattern(SystemConstants.CPATTERN.TAX_CODE),
                Validators.required
            ])],
            partnerGroup: [null, Validators.compose([
                Validators.required
            ])],
            countryShippingId: [null, Validators.compose([
                Validators.required
            ])],
            provinceShippingId: [null],
            zipCodeShipping: [null],
            addressShippingEn: [null, Validators.compose([
                FormValidators.required
            ])],
            addressShippingVn: [null, Validators.compose([
                FormValidators.required
            ])],
            countryId: [null, Validators.compose([
                Validators.required
            ])],
            provinceId: [null],
            zipCode: [null],
            addressEn: [null, Validators.compose([
                FormValidators.required
            ])],
            addressVn: [null, Validators.compose([
                FormValidators.required
            ])],
            billingEmail: [null],
            billingPhone: [null],
            contactPerson: [null],
            tel: [null],
            fax: [null],
            workPhoneEx: [null],
            email: [null],

            bankAccountNo: [null],
            bankAccountName: [null],
            bankAccountAddress: [null],
            swiftCode: [null],

            active: [false],
            note: [null],
            coLoaderCode: [null],
            applyDim: [null],
            roundUpMethod: [null],
            partnerMode: [null],
            partnerLocation: [null, Validators.required],
            internalCode: [null],
            creditPayment: [null],
            bankName: [],
            bankCode: [{ value: null, disabled: true }]
        });
        this.partnerAccountNo = this.partnerForm.controls['partnerAccountNo'];
        this.internalReferenceNo = this.partnerForm.controls['internalReferenceNo'];
        this.partnerNameEn = this.partnerForm.controls['partnerNameEn'];
        this.partnerNameVn = this.partnerForm.controls['partnerNameVn'];
        this.shortName = this.partnerForm.controls['shortName'];
        this.partnerAccountRef = this.partnerForm.controls['partnerAccountRef'];
        this.taxCode = this.partnerForm.controls['taxCode'];
        this.partnerGroup = this.partnerForm.controls['partnerGroup'];
        this.countryShippingId = this.partnerForm.controls['countryShippingId'];
        this.provinceShippingId = this.partnerForm.controls['provinceShippingId'];
        this.zipCodeShipping = this.partnerForm.controls['zipCodeShipping'];
        this.addressShippingEn = this.partnerForm.controls['addressShippingEn'];
        this.addressShippingVn = this.partnerForm.controls['addressShippingVn'];
        this.countryId = this.partnerForm.controls['countryId'];
        this.provinceId = this.partnerForm.controls['provinceId'];
        this.zipCode = this.partnerForm.controls['zipCode'];
        this.addressEn = this.partnerForm.controls['addressEn'];
        this.addressVn = this.partnerForm.controls['addressVn'];
        this.contactPerson = this.partnerForm.controls['contactPerson'];
        this.tel = this.partnerForm.controls['tel'];
        this.fax = this.partnerForm.controls['fax'];
        this.workPhoneEx = this.partnerForm.controls['workPhoneEx'];
        this.email = this.partnerForm.controls['email'];

        this.bankAccountNo = this.partnerForm.controls['bankAccountNo'];
        this.bankAccountName = this.partnerForm.controls['bankAccountName'];
        this.bankAccountAddress = this.partnerForm.controls['bankAccountAddress'];
        this.swiftCode = this.partnerForm.controls['swiftCode'];

        this.active = this.partnerForm.controls['active'];
        this.coLoaderCode = this.partnerForm.controls['coLoaderCode'];
        this.note = this.partnerForm.controls['note'];
        this.applyDim = this.partnerForm.controls['applyDim'];
        this.roundUpMethod = this.partnerForm.controls['roundUpMethod'];
        this.billingEmail = this.partnerForm.controls['billingEmail'];
        this.billingPhone = this.partnerForm.controls['billingPhone'];
        this.partnerMode = this.partnerForm.controls['partnerMode'];
        this.partnerLocation = this.partnerForm.controls['partnerLocation'];
        this.internalCode = this.partnerForm.controls['internalCode'];
        this.creditPayment = this.partnerForm.controls['creditPayment'];
        this.bankName = this.partnerForm.controls['bankName'];
        if (!this.isUpdate) {
            this.partnerMode.setValue('External');
            this.partnerLocation.setValue('Domestic');
            this.isDisabledInternalCode = true;
        }
        this.isDisabled = this.partnerAccountRef != null && !this.isUpdate ? true : false;
        this.activePartner = this.active.value;
        this.bankCode = this.partnerForm.controls['bankCode'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'acRef':
                this.parentName = data.shortName;
                this.partnerAccountRef.setValue(data.id);
                if (!!this.partnerAccountRef.value && this.isUpdate && this.partnerAccountRef.value !== this.partnerAccountRef) {
                    this.isDisabled = false;
                }
                else {
                    this.isDisabled = true;
                }
                break;
            case 'shippping-country':
                this.countryShippingIdName = data.nameEn;
                this.countryShippingId.setValue(data.id);
                this.shippingProvinceName = null;
                this.provinceShippingId.setValue(data.id);
                this.getShippingProvinces(data.id, !!this.provinceShippingId.value ? this.provinceShippingId.value : null);
                break;
            case 'shippping-city':
                this.shippingProvinceName = data.name_EN;
                this.provinceShippingId.setValue(data.id);
                break;
            case 'billing-country':
                this.countryIdName = data.nameEn;
                this.countryId.setValue(data.id);
                this.billingProvinceName = null;
                this.provinceId.setValue(data.id);
                this.getBillingProvinces(data.id, !!this.provinceId.value ? this.provinceId.value : null);
                break;
            case 'billing-city':
                this.billingProvinceName = data.name_EN;
                this.provinceId.setValue(data.id);
                break;
            case 'bank':
                this.bankName.setValue(data.bankNameEn);
                this.bankCode.setValue(data.code);
                break;
            default:    
                break;
        }
    }

    setFormData(partner: Partner) {


        this.countryShippingIdName = partner.countryShippingName;
        this.countryIdName = partner.countryName;
        this.shippingProvinceName = partner.provinceShippingName;
        this.billingProvinceName = partner.provinceName;

        if (partner.countryId && partner.countryShippingId) {
            this.getShippingProvinces(partner.countryShippingId);
            this.getBillingProvinces(partner.countryId);
        }

        const isShowSaleMan = this.checkRequireSaleman();
        this.requireSaleman.emit(isShowSaleMan);
        const partnerGroupActives = !!partner.partnerGroup ? this.getPartnerGroupActives(partner.partnerGroup.split(';')) : null;
        let index = -1;
        let parentCustomerActive = [];
        let countryIdActive = [];
        let countryShippingIdActive = [];
        let billingProvinceActive = [];
        let shippingProvinceActive = [];
        index = this.parentCustomers.findIndex(x => x.id === partner.parentId);
        if (index > -1) {
            parentCustomerActive = [this.parentCustomers[index]];
        }
        index = this.countries.findIndex(x => x.id === partner.countryId);
        if (index > - 1) {
            countryIdActive = [this.countries[index]];
        }
        index = this.countries.findIndex(x => x.id === partner.countryShippingId);
        if (index > -1) {
            countryShippingIdActive = [this.countries[index]];
        }
        index = this.billingProvinces.findIndex(x => x.id === partner.provinceId);
        if (index > -1) {
            billingProvinceActive = [this.billingProvinces[index]];
        }
        index = this.shippingProvinces.findIndex(x => x.id === partner.provinceShippingId);
        if (index > -1) {
            shippingProvinceActive = [this.shippingProvinces[index]];
        }
        this.public = partner.public;

        this.partnerForm.setValue({
            partnerAccountNo: this.isAddBranchSub ? null : partner.accountNo,
            internalReferenceNo: partner.internalReferenceNo,
            partnerNameEn: partner.partnerNameEn,
            partnerNameVn: partner.partnerNameVn,
            shortName: partner.shortName,
            //
            partnerAccountRef: this.isAddBranchSub ? partner.id : partner.parentId,
            taxCode: this.isAddBranchSub ? null : partner.taxCode,
            partnerGroup: partnerGroupActives,
            countryShippingId: partner.countryShippingId,
            provinceShippingId: partner.provinceShippingId,


            zipCodeShipping: partner.zipCodeShipping,
            addressShippingEn: partner.addressShippingEn,
            addressShippingVn: partner.addressShippingVn,
            countryId: partner.countryId,
            provinceId: partner.provinceId,

            zipCode: partner.zipCode,
            addressEn: partner.addressEn,
            addressVn: partner.addressVn,
            billingEmail: partner.billingEmail,
            billingPhone: partner.billingPhone,
            contactPerson: partner.contactPerson,
            tel: partner.tel,
            fax: partner.fax,
            workPhoneEx: partner.workPhoneEx,
            email: partner.email,

            bankAccountNo: partner.bankAccountNo,
            bankAccountName: partner.bankAccountName,
            bankAccountAddress: partner.bankAccountAddress,
            swiftCode: partner.swiftCode,

            active: this.isAddBranchSub ? false : (partner.active === null ? false : partner.active),
            note: partner.note,
            coLoaderCode: partner.coLoaderCode,
            roundUpMethod: { id: partner.roundUpMethod, text: partner.roundUpMethod },
            applyDim: { id: partner.applyDim, text: partner.applyDim },
            partnerMode: partner.partnerMode,
            partnerLocation: partner.partnerLocation,
            internalCode: partner.internalCode,
            creditPayment: partner.creditPayment,
            bankName: partner.bankName,
            bankCode:partner.bankCode
        });
        if (this.partnerAccountRef.value !== partner.parentId) {
            this.isDisabled = false;
        }
        else {
            this.isDisabled = true;
        }
    }

    getPartnerGroupActives(arg0: string[]): any {
        const partnerGroupActives = [];
        if (arg0.length > 0) {
            for (let i = 0; i < arg0.length; i++) {
                partnerGroupActives.push(arg0[i]);
            }
        }
        return partnerGroupActives;
    }

    showPopupSaleman() {
        this.poupSaleman.isSave = false;
        this.poupSaleman.isDetail = false;
        this.poupSaleman.show();
    }

    showOtherCharge() {
        this.otherChargePopup.show();
    }

    copyShippingAddress() {
        this.countryId.setValue(this.countryShippingId.value);
        this.provinceId.setValue(this.provinceShippingId.value);
        this.zipCode.setValue(this.zipCodeShipping.value);
        this.addressEn.setValue(this.addressShippingEn.value);
        this.addressVn.setValue(this.addressShippingVn.value);
    }

    handleFocusInternalReference() {
        this.setFocusInput(this.internalReferenceRef);
    }

    selectedPartnerMode($event) {
        console.log($event);
        const partnerMode = $event;
        if (partnerMode.id === 'Internal') {
            this.isDisabledInternalCode = false;
        } else {
            this.isDisabledInternalCode = true;
        }
    }

    getACRefName(parentId: string) {
        const isFounded = this.parentCustomers.findIndex(x => x.id === parentId) > -1;
        if (!isFounded) {
            this._catalogueRepo.getDetailPartner(parentId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res: Partner) => {
                        if (!!res) {
                            this.partnerAccountRef.setValue(parentId);
                            this.parentName = res.shortName;
                        }
                    }
                );
        }
    }
    
}
