import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from '@app';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { SystemRepo, CatalogueRepo } from '@repositories';
import { Observable } from 'rxjs';

@Component({
    selector: 'authorization-form-search',
    templateUrl: './form-search-authorization.component.html'
})

export class AuthorizationFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchAuthorization> = new EventEmitter<ISearchAuthorization>();

    formSearch: FormGroup;
    service: AbstractControl;
    effectiveDate: AbstractControl;
    personInCharge: AbstractControl;
    expirationDate: AbstractControl;
    authorizedPerson: AbstractControl;
    status: AbstractControl;

    statusList: any[] = [
        { "text": 'Active', "id": true },
        { "text": 'Inactive', "id": false }
    ];
    personInChargeList: Observable<any[]>;
    serviceList: Observable<CommonInterface.IValueDisplay[]>;

    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo,
    ) {
        super();
        this.requestSearch = this.onSubmit;
    }

    ngOnInit() {
        this.serviceList = this._catalogueRepo.getListService();
        this.personInChargeList = this._systemRepo.getSystemUsers({ active: true });

        this.initForm();
    }

    initForm() {
        this.formSearch = this._fb.group({
            service: [],
            effectiveDate: [],
            personInCharge: [],
            expirationDate: [],
            authorizedPerson: [],
            status: [this.statusList[0].id]
        });
        this.service = this.formSearch.controls['service'];
        this.effectiveDate = this.formSearch.controls['effectiveDate'];
        this.personInCharge = this.formSearch.controls['personInCharge'];
        this.expirationDate = this.formSearch.controls['expirationDate'];
        this.authorizedPerson = this.formSearch.controls['authorizedPerson'];
        this.status = this.formSearch.controls['status'];
    }

    onSubmit() {
        const body: ISearchAuthorization = {
            all: '',
            service: this.service.value,
            userId: this.personInCharge.value,
            assignTo: this.authorizedPerson.value,
            startDate: this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            endDate: this.expirationDate.value ? (this.expirationDate.value.startDate !== null ? formatDate(this.expirationDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            active: this.status.value
        };
        this.onSearch.emit(body);
    }

    search() {
        this.onSubmit();
    }

    reset() {
        this.formSearch.reset();
        this.onSearch.emit(<any>{});
        this.status.setValue(this.statusList[0].id);
    }
}

interface ISearchAuthorization {
    all: '';
    service: string;
    userId: string;
    assignTo: string;
    startDate: string;
    endDate: string;
    active: boolean;
}
