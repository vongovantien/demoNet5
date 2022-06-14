import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { SystemRepo } from '@repositories';
import { Company, Department } from '@models';
import { finalize, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AppForm } from 'src/app/app.form';

import { Store } from '@ngrx/store';
import { checkShareSystemUserLevel, IShareSystemState } from './../../../store';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'form-add-office',
    templateUrl: './form-add-office.component.html'
})
export class OfficeFormAddComponent extends AppForm implements OnInit {

    configOffice: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    selectedCompany: Partial<CommonInterface.IComboGridData> = {};

    userHeaders: CommonInterface.IHeaderTable[];
    companies: Company[] = [];
    departments: Department[] = [];
    formGroup: FormGroup;
    code: AbstractControl;
    branchNameEn: AbstractControl;
    branchNameVn: AbstractControl;
    shortName: AbstractControl;
    addressEn: AbstractControl;
    addressVn: AbstractControl;
    taxcode: AbstractControl;
    tel: AbstractControl;
    email: AbstractControl;
    fax: AbstractControl;
    company: AbstractControl;
    bankAccountVND: AbstractControl;
    bankAccountUSD: AbstractControl;
    bankAccountName_VN: AbstractControl;
    bankAccountName_EN: AbstractControl;
    swiftCode: AbstractControl;
    bankAddress_Local: AbstractControl;
    bankAddress_En: AbstractControl;
    active: AbstractControl;
    bankName: AbstractControl;
    headers: CommonInterface.IHeaderTable[];
    location: AbstractControl;
    internalCode: AbstractControl;
    bankName_En: AbstractControl;
    bankName_Local: AbstractControl;
    officeType: AbstractControl;
    SelectedOffice: any = {};
    status: CommonInterface.ICommonTitleValue[] = [
        { title: 'Active', value: true },
        { title: 'Inactive', value: false },
    ];
    isReadonly: any = false;

    isSubmited: boolean = false;
    @Input() isDetail: boolean = false;
    isCreate: boolean = false;
    officeTypes: string[] = ['Head', 'Branch', 'OutSource']
    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _store: Store<IShareSystemState>,
        private _router: Router
    ) {
        super();
    }

    ngOnInit(): void {
        this.initForm();
        this.getDataComboBox();

        this.userHeaders = [
            { title: 'User Name', field: 'userName', sortable: true },
            { title: 'Full Name', field: 'fullName', sortable: true },
            { title: 'Position', field: 'position', sortable: true },
            { title: 'Permission', field: 'permission', sortable: true },
            { title: 'Level Permission', field: 'levelPermission', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        if (this.isDetail) {
            this.isReadonly = this._store.select(checkShareSystemUserLevel);
        }
    }
    onSelectDataFormInfo(data: any) {
        this.company.setValue(data.id);

    }


    update(formdata: any, data: any) {
        this.formGroup.patchValue(formdata);
    }

    getCompanies() {
        this._systemRepo.getListCompany()
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.companies = res;
                    this.getCompanyData(this.companies);
                },
            );
    }

    getDataComboBox() {
        this.getCompanies();
    }

    sortDepartment(sort: string): void {
        // this.departments = this._sortService.sort(this.departments, sort, this.order);
    }

    gotoDetailDepartment(id: number) {
        this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}/${id}`]);
    }

    getCompanyData(data: any) {
        this.configOffice.dataSource = data;
        this.configOffice.displayFields = [
            { field: 'code', label: 'Company Code' },
            { field: 'bunameAbbr', label: 'Name Abbr' },
            { field: 'bunameVn', label: 'Name Local' },
        ];
        this.configOffice.selectedDisplayFields = ['bunameAbbr'];

    }


    initForm() {
        this.formGroup = this._fb.group({
            code: ['',
                Validators.compose([
                    Validators.required
                ])],
            branchNameEn: ['',
                Validators.compose([
                    Validators.required
                ])],
            branchNameVn: ['',
                Validators.compose([
                    Validators.required
                ])],
            shortName: ['',
                Validators.compose([
                    Validators.required
                ])],
            addressEn: ['',
                Validators.compose([
                    Validators.required
                ])],
            addressVn: ['',
                Validators.compose([
                    Validators.required
                ])],
            taxcode: ['',
                Validators.compose([
                    Validators.required
                ])],
            tel: [],
            email: [],
            fax: [],
            company: [null, Validators.required],
            bankAccountVND: [],
            bankAccountUSD: [],
            bankAccountName_VN: [],
            bankAccountName_EN: [],
            swiftCode: [],
            bankAddress_Local: [],
            bankAddress_En: [],
            active: [this.status[0]],
            location: [],
            bankName_En: [],
            bankName_Local: [],
            officeType: ['Branch', Validators.compose([
                Validators.required
            ])],
            internalCode: []
        });

        this.code = this.formGroup.controls['code'];
        this.branchNameEn = this.formGroup.controls['branchNameEn'];
        this.shortName = this.formGroup.controls['shortName'];
        this.addressEn = this.formGroup.controls['addressEn'];
        this.taxcode = this.formGroup.controls['taxcode'];
        this.tel = this.formGroup.controls['tel'];
        this.email = this.formGroup.controls['email'];
        this.fax = this.formGroup.controls['fax'];
        this.company = this.formGroup.controls['company'];
        this.swiftCode = this.formGroup.controls['swiftCode'];
        this.active = this.formGroup.controls['active'];
        this.addressVn = this.formGroup.controls['addressVn'];
        this.bankAccountVND = this.formGroup.controls['bankAccountVND'];
        this.bankAccountUSD = this.formGroup.controls['bankAccountUSD'];
        this.branchNameVn = this.formGroup.controls['branchNameVn'];
        this.bankAccountName_VN = this.formGroup.controls['bankAccountName_VN'];

        this.bankAccountName_EN = this.formGroup.controls['bankAccountName_EN'];
        this.bankAddress_Local = this.formGroup.controls['bankAddress_Local'];

        this.bankAddress_En = this.formGroup.controls['bankAddress_En'];
        this.location = this.formGroup.controls['location'];
        this.bankName_En = this.formGroup.controls['bankName_En'];
        this.bankName_Local = this.formGroup.controls['bankName_Local'];
        this.officeType = this.formGroup.controls['officeType'];

        this.internalCode = this.formGroup.controls['internalCode'];
    }
}


export interface IFormAddOffice {
    id: string;
    branchNameVn: string;
    bankAccountName_VN: string;
    bankAccountName_EN: string;
    branchNameEn: string;
    buid: string;
    addressVn: string;
    addressEn: string;
    tel: string;
    fax: string;
    email: string;
    taxcode: string;
    bankAccountVND: string;
    bankAccountUSD: string;
    bankAddress_Local: string;
    bankAddress_En: string;
    code: string;
    swiftCode: string;
    shortName: string;
    userCreated: string;
    datetimeCreated: string;
    userModified: string;
    datetimeModified: string;
    company: string;
    active: boolean;
    location: string;
    bankName_En: string;
    bankName_Local
    internalCode: string;
}
