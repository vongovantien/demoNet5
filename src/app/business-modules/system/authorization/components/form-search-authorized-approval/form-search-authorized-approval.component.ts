import { Component, EventEmitter, Output } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { SystemRepo } from '@repositories';
import { AppForm } from 'src/app/app.form';
import { formatDate } from '@angular/common';
import { User } from '@models';
import { Observable } from 'rxjs';

@Component({
    selector: 'authorized-approval-form-search',
    templateUrl: 'form-search-authorized-approval.component.html'
})

export class AuthorizedApprovalFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchAuthorizedApproval> = new EventEmitter<ISearchAuthorizedApproval>();

    formSearch: FormGroup;
    authorizer: AbstractControl;
    commissioner: AbstractControl;
    type: AbstractControl;


    effectiveDate: AbstractControl;
    personInCharge: AbstractControl;
    expirationDate: AbstractControl;
    authorizedPerson: AbstractControl;
    status: AbstractControl;

    statusList: any[] = [
        { "text": 'Active', "id": true },
        { "text": 'Inactive', "id": false }
    ];
    typeList: any[] = ['Advance', 'Settlement', 'Unlock Shipment'];

    users: Observable<User[]>;

    minDateExpired: any = null;
    minDateEffective: any = null;

    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
    ) {
        super();
        this.requestSearch = this.onSubmit;
    }

    ngOnInit() {
        this.users = this._systemRepo.getSystemUsers({ active: true });
        this.initForm();

    }

    initForm() {
        this.formSearch = this._fb.group({
            authorizer: [],
            commissioner: [],
            effectiveDate: [null],
            expirationDate: [null],
            type: [],
            status: [this.statusList[0].id]
        });
        this.authorizer = this.formSearch.controls['authorizer'];
        this.commissioner = this.formSearch.controls['commissioner'];
        this.effectiveDate = this.formSearch.controls['effectiveDate'];
        this.expirationDate = this.formSearch.controls['expirationDate'];
        this.status = this.formSearch.controls['status'];
        this.type = this.formSearch.controls['type'];
        this.minDateEffective = this.minDateExpired = this.minDate;

        this.formSearch.get("effectiveDate").valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                map((data: any) => data.startDate)
            )
            .subscribe((value: any) => {
                this.minDateExpired = this.createMoment(value); // * Update MinDate -> ExpiredDate.
            });
    }

    onSelectDataFormInfo($event: any, type: string) {
        if (type === 'commissioner') {
            this.commissioner.setValue($event.id);
        } else {
            this.authorizer.setValue($event.id);
        }
    }


    onSubmit() {
        const body: ISearchAuthorizedApproval = {
            all: '',
            authorizer: !!this.authorizer.value ? this.authorizer.value : null,
            commissioner: !!this.commissioner.value ? this.commissioner.value : null,
            type: this.type.value,
            effectiveDate: this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            expirationDate: this.expirationDate.value ? (this.expirationDate.value.startDate !== null ? formatDate(this.expirationDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            active: this.status.value,

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
interface ISearchAuthorizedApproval {
    all: '';
    authorizer: string;
    commissioner: string;
    type: string;
    effectiveDate: string;
    expirationDate: string;
    active: boolean;
}