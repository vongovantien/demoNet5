import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { DataService } from 'src/app/shared/services';
import { Customer, User } from 'src/app/shared/models';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { SystemConstants } from 'src/constants/system.const';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { JobConstants } from '@constants';
import { CommonEnum } from '@enums';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';
import { getOperationClearanceDataSearch } from '../../../store';
import { CustomsDeclarationSearchListAction } from '../../../store/actions/custom-clearance.action';

@Component({
    selector: 'custom-clearance-form-search',
    templateUrl: './form-search-custom-clearance.component.html'
})

export class CustomClearanceFormSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    formSearch: FormGroup;
    personalHandle: AbstractControl;
    clearanceNo: AbstractControl;
    clearanceDate: AbstractControl;
    importDate: AbstractControl;
    importStatus: AbstractControl;
    type: AbstractControl;
    customer: AbstractControl;

    status: CommonInterface.ICommonTitleValue[];
    types: CommonInterface.ICommonTitleValue[];

    users: User[] = [];
    userLogged: User;
    customers: Observable<Customer[]>;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    dataSearch: ISearchCustomClearance;
    isUpdateRequesterFromRedux: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _dataService: DataService,
        private _sysRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit() {
        this.initBasicData();
        this.initForm();
        this.getUserLogged();
        this.getListUser();
        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER, null);
        this._store.select(getOperationClearanceDataSearch)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.dataSearch = res;
                        this.isUpdateRequesterFromRedux = true;
                        this.setDataFormSearchFromStore(res);
                    }
                }
            );
    }

    initForm() {
        this.formSearch = this._fb.group({
            'personalHandle': [],
            'clearanceNo': [],
            'clearanceDate': [
                {
                    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                    endDate: new Date()
                },
            ],
            'importDate': [],
            'importStatus': [this.status[0].value],
            'type': [this.types[0].value],
            'customer': []
        });

        this.personalHandle = this.formSearch.controls['personalHandle'];
        this.clearanceNo = this.formSearch.controls['clearanceNo'];
        this.clearanceDate = this.formSearch.controls['clearanceDate'];
        this.importDate = this.formSearch.controls['importDate'];
        this.importStatus = this.formSearch.controls['importStatus'];
        this.type = this.formSearch.controls['type'];
        this.customer = this.formSearch.controls['customer'];
    }

    initBasicData() {
        this.status = [
            { title: 'All', value: 'All' },
            { title: 'Imported', value: true },
            { title: 'Not imported', value: false },
        ];

        this.types = [
            { title: 'All', value: 'All' },
            { title: 'Import', value: 'Import' },
            { title: 'Export', value: 'Export' },
        ];
    }

    setDataFormSearchFromStore(data: ISearchCustomClearance) {
        this.formSearch.patchValue({
            clearanceNo: !!data.clearanceNo && data.clearanceNo.length > 0 ? data.clearanceNo.split(';').join('\n') : null,
            clearanceDate: !!data.fromClearanceDate && data.toClearanceDate ?
                { startDate: new Date(data.fromClearanceDate), endDate: new Date(data.toClearanceDate) } : null,
            customer: !!data.customerNo ? data.customerNo : null,
            personalHandle: !!data.personHandle ? data.personHandle : null,
            importDate: !!data.fromImportDate && !!data.toImportDate ?
            { startDate: new Date(data.fromImportDate), endDate: new Date(data.toImportDate) } : null,
            importStatus: data.imPorted !== null ? data.imPorted : this.status[0].value,
            type: !!data.cusType ? data.cusType : this.types[0].value,
        });
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    getListUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.users = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER) || [];
            this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0].id);
        } else {
            this._sysRepo.getListSystemUser()
                .pipe(
                    catchError(this.catchError),
                    map((data: any[]) => data.map((item: any) => new User(item))),
                )
                .subscribe(
                    (data: any) => {
                        this.users = data || [];
                        if (!this.isUpdateRequesterFromRedux) {
                            this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0].id);
                        }
                    },
                );
        }
    }

    searchCustomClearance() {
        const body: ISearchCustomClearance = {
            clearanceNo: !!this.clearanceNo.value ? this.clearanceNo.value.split('\n').map(item => item.trim()).join(';') : null,
            fromClearanceDate: !!this.clearanceDate.value ? formatDate(this.clearanceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toClearanceDate: !!this.clearanceDate.value ? formatDate(this.clearanceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            imPorted: (this.importStatus.value === null || this.importStatus.value === this.status[0].value) ? null : this.importStatus.value,
            fromImportDate: !!this.importDate.value?.startDate ? formatDate(this.importDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toImportDate: !!this.importDate.value?.startDate ? formatDate(this.importDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            cusType: (!this.type.value || this.type.value === this.types[0].value) ? null : this.type.value,
            personHandle: this.personalHandle.value,
            customerNo: this.customer.value,
        };
        console.log('body', body)
        this.onSearch.emit(body);
        this._store.dispatch(CustomsDeclarationSearchListAction(body));
    }

    resetSearch() {
        this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0].id);
        this.clearanceNo.setValue(null);
        this.clearanceDate.setValue({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date()
        });
        this.importDate.setValue(null);
        this.type.setValue(this.types[0].value);
        this.importStatus.setValue(this.status[0].value);
        this.resetFormControl(this.customer);

        this.searchCustomClearance();
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.formSearch.controls['customer'].setValue(data.accountNo);
                break;
            default:
                break;
        }
    }
}

export interface ISearchCustomClearance {
    clearanceNo: string;
    fromClearanceDate: string;
    toClearanceDate: string;
    imPorted: boolean;
    fromImportDate: string;
    toImportDate: string;
    cusType: string;
    personHandle: string;
    customerNo: string;
}

