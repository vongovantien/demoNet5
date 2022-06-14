import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { User, Currency, Partner } from 'src/app/shared/models';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { Observable } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { getSettlementPaymentSearchParamsState, ISettlementPaymentState, SearchListSettlePayment } from '../store';
import { Store } from '@ngrx/store';
import { CommonEnum } from '@enums';

@Component({
    selector: 'settle-payment-form-search',
    templateUrl: './form-search-settlement.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush

})

export class SettlementFormSearchComponent extends AppForm {

    formSearch: FormGroup;
    referenceNo: AbstractControl;
    requester: AbstractControl;
    requestDate: AbstractControl;
    modifiedDate: AbstractControl;
    statusApproval: AbstractControl;
    paymentMethod: AbstractControl;
    currencyId: AbstractControl;
    payeeId: AbstractControl;
    departmentId: AbstractControl;

    statusApprovals: CommonInterface.ICommonTitleValue[];
    statusPayments: CommonInterface.ICommonTitleValue[];
    paymentMethods: CommonInterface.ICommonTitleValue[] = [];

    userLogged: User;
    partners: Observable<Partner[]>;
    departments: Observable<any[]>;

    currencies: Observable<Currency[]>;
    requesters: Observable<User[]>;

    isUpdateRequesterFromRedux: boolean = false;


    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _store: Store<ISettlementPaymentState>,
    ) {
        super();
        this.requestSearch = this.onSubmit;
    }

    ngOnInit() {
        this.initForm();
        this.statusApprovals = this.getStatusApproval();
        this.statusPayments = this.getStatusPayment();
        this.paymentMethods = this.getMethod();
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.currencies = this._catalogueRepo.getListCurrency();
        this.requesters = this._systemRepo.getListSystemUser().pipe(
            tap((d) => {
                const rq = d.find(stf => stf.id === this.userLogged.id);
                !this.isUpdateRequesterFromRedux && rq && this.requester.setValue(!!rq ? rq.id : null);
            })
        );
        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.getDepartments();

        this._store.select(getSettlementPaymentSearchParamsState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.isUpdateRequesterFromRedux = true;
                        this.setDataFormSearchFromStore(res);
                    }
                }
            );
    }

    setDataFormSearchFromStore(data: ISearchSettlePayment) {
        this.formSearch.patchValue({
            referenceNo: !!data.referenceNos && !!data.referenceNos.length ? data.referenceNos.join('\n') : null,
            requestDate: !!data.requestDateFrom && !!data.requestDateTo ?
                { startDate: new Date(data.requestDateFrom), endDate: new Date(data.requestDateTo) } : null,
            statusApproval: !!data.statusApproval && data.statusApproval !== 'All' ? data.statusApproval : null,
            paymentMethod: !!data.paymentMethod && data.paymentMethod !== 'All' ? data.paymentMethod : null,
            requester: !!data.requester ? data.requester : null
        });
    }

    initForm() {
        this.formSearch = this._fb.group({
            referenceNo: [],
            requester: [],
            requestDate: [],
            modifiedDate: [],
            statusApproval: [],
            paymentMethod: [],
            currencyId: [],
            payeeId: [],
            departmentId: []
        });

        this.referenceNo = this.formSearch.controls['referenceNo'];
        this.requester = this.formSearch.controls['requester'];
        this.requestDate = this.formSearch.controls['requestDate'];
        this.modifiedDate = this.formSearch.controls['modifiedDate'];
        this.statusApproval = this.formSearch.controls['statusApproval'];
        this.paymentMethod = this.formSearch.controls['paymentMethod'];
        this.currencyId = this.formSearch.controls['currencyId'];
        this.payeeId = this.formSearch.controls['payeeId'];
        this.departmentId = this.formSearch.controls['departmentId'];
    }

    onSubmit() {
        const body: ISearchSettlePayment = {
            referenceNos: !!this.referenceNo.value ? this.referenceNo.value.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            advanceModifiedDateFrom: !!this.modifiedDate.value && !!this.modifiedDate.value.startDate ? formatDate(this.modifiedDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            advanceModifiedDateTo: !!this.modifiedDate.value && !!this.modifiedDate.value.endDate ? formatDate(this.modifiedDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            requestDateFrom: !!this.requestDate.value && !!this.requestDate.value.startDate ? formatDate(this.requestDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            requestDateTo: !!this.requestDate.value && !!this.requestDate.value.endDate ? formatDate(this.requestDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            paymentMethod: !!this.paymentMethod.value ? this.paymentMethod.value : 'All',
            statusApproval: !!this.statusApproval.value ? this.statusApproval.value : 'All',
            currencyId: !!this.currencyId.value ? this.currencyId.value : 'All',
            requester: !!this.requester.value ? this.requester.value : this.userLogged.id,
            payeeId: !!this.payeeId.value ? this.payeeId.value : null,
            departmentId: !!this.departmentId.value ? this.departmentId.value: null
        };
        this._store.dispatch(SearchListSettlePayment(body));
    }

    getStatusApproval(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'New', value: 'New' },
            { title: 'Request Approval', value: 'Request Approval' },
            { title: 'Leader Approved', value: 'Leader Approved' },
            { title: 'Department Manager Approved', value: 'Department Manager Approved' },
            { title: 'Accountant Manager Approved', value: 'Accountant Manager Approved' },
            { title: 'Done ', value: 'Done' },
            { title: 'Denied  ', value: 'Denied' },
        ];
    }

    getStatusPayment(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Settled', value: 'Settled' },
            { title: 'Not Settled', value: 'NotSettled' },
            { title: 'Partial Settlement', value: 'PartialSettlement' },
        ];
    }

    getMethod(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Cash', value: 'Cash' },
            { title: 'Bank Transfer', value: 'Bank' },
        ];
    }

    getDepartments() {
        this._systemRepo.getAllDepartment()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    this.departments = data.map(x => ({ "name": x.deptNameAbbr, "id": x.id }));
                },
            );
    }
    
    reset() {
        this.resetFormControl(this.requestDate);
        this.resetFormControl(this.modifiedDate);
        this.resetFormControl(this.referenceNo);
        this.resetFormControl(this.paymentMethod);
        this.resetFormControl(this.statusApproval);
        this.resetFormControl(this.currencyId);
        this.resetFormControl(this.payeeId);
        this.resetFormControl(this.departmentId);

        this._store.dispatch(SearchListSettlePayment({ requester: this.userLogged.id }));
    }
}

export interface ISearchSettlePayment {
    referenceNos: string[];
    requester: string;
    requestDateFrom: string;
    requestDateTo: string;
    advanceModifiedDateFrom: string;
    advanceModifiedDateTo: string;
    paymentMethod: string;
    statusApproval: string;
    currencyId: string;
    payeeId: string;
    departmentId: string;
}