import { SearchListAdvancePayment } from './../../store/actions/advance-payment.action';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';

import { AppForm } from '@app';
import { User, Currency } from '@models';
import { formatDate } from '@angular/common';
import { SystemConstants } from '@constants';
import { CatalogueRepo, SystemRepo } from '@repositories';

import { takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


import { getAdvancePaymentSearchParamsState, IAdvancePaymentState } from '../../store/reducers';


@Component({
    selector: 'adv-payment-form-search',
    templateUrl: './form-search-advance-payment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdvancePaymentFormsearchComponent extends AppForm {

    formSearch: FormGroup;
    referenceNo: AbstractControl;
    requester: AbstractControl;
    requestDate: AbstractControl;
    modifiedDate: AbstractControl;
    statusApproval: AbstractControl;
    statusPayment: AbstractControl;
    paymentMethod: AbstractControl;
    currencyId: AbstractControl;

    statusApprovals: CommonInterface.ICommonTitleValue[];
    statusPayments: CommonInterface.ICommonTitleValue[];
    paymentMethods: CommonInterface.ICommonTitleValue[] = [];

    userLogged: User;

    currencies: Observable<Currency[]>;
    requesters: Observable<User[]>;

    isUpdateRequesterFromRedux: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _store: Store<IAdvancePaymentState>,
    ) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.statusApprovals = this.getStatusApproval();
        this.statusPayments = this.getStatusPayment();
        this.paymentMethods = this.getMethod();
        this.currencies = this._catalogueRepo.getListCurrency()

        this.requesters = this._systemRepo.getListSystemUser().pipe(
            tap((d: User[]) => {
                const rqter = d.find(x => x.id == this.userLogged.id);
                !this.isUpdateRequesterFromRedux && rqter && this.requester.setValue(rqter.id)
            })
        );

        this.subscriptionSearchParamState();

    }

    subscriptionSearchParamState() {
        this._store.select(getAdvancePaymentSearchParamsState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (data) {
                        this.isUpdateRequesterFromRedux = true;

                        let formData: any = {
                            referenceNo: data?.referenceNos?.toString().replace(/[,]/g, "\n") || null,
                            requester: data.requester,
                            requestDate: (!!data?.requestDateFrom && !!data?.requestDateTo) ?
                                { startDate: new Date(data?.requestDateFrom), endDate: new Date(data?.requestDateTo) } : null,
                            modifiedDate: (!!data?.advanceModifiedDateFrom && !!data?.advanceModifiedDateTo) ?
                                { startDate: new Date(data?.advanceModifiedDateFrom), endDate: new Date(data?.advanceModifiedDateTo) } : null,
                            statusApproval: data?.statusApproval === 'All' ? null : data?.statusApproval,
                            statusPayment: data?.statusPayment === 'All' ? null : data?.statusPayment,
                            paymentMethod: data?.paymentMethod === 'All' ? null : data?.paymentMethod,
                            currencyId: data?.currencyId || null,
                        };

                        this.formSearch.patchValue(formData);
                    }
                }
            );
    }

    initForm() {
        this.formSearch = this._fb.group({
            referenceNo: [],
            requester: [],
            requestDate: [],
            modifiedDate: [],
            statusApproval: [],
            statusPayment: [],
            paymentMethod: [],
            currencyId: [],
        });

        this.referenceNo = this.formSearch.controls['referenceNo'];
        this.requester = this.formSearch.controls['requester'];
        this.requestDate = this.formSearch.controls['requestDate'];
        this.modifiedDate = this.formSearch.controls['modifiedDate'];
        this.statusApproval = this.formSearch.controls['statusApproval'];
        this.statusPayment = this.formSearch.controls['statusPayment'];
        this.paymentMethod = this.formSearch.controls['paymentMethod'];
        this.currencyId = this.formSearch.controls['currencyId'];

    }

    setDataSearchFromRedux(data: ISearchAdvancePayment) {
        this.formSearch.patchValue({
            referenceNo: !!data.referenceNos && !!data.referenceNos.length ? data.referenceNos.join('\n') : null,
            requestDate: !!data.requestDateFrom && !!data.requestDateTo ? { startDate: new Date(data.requestDateFrom), endDate: new Date(data.requestDateTo) } : null,
            modifiedDate: !!data.advanceModifiedDateFrom && !!data.advanceModifiedDateTo ? { startDate: new Date(data.advanceModifiedDateFrom), endDate: new Date(data.advanceModifiedDateTo) } : null,
            statusApproval: !!data.statusApproval && data.statusApproval !== 'All' ? this.statusApprovals.filter(e => e.value === data.statusApproval)[0] : null,
            statusPayment: !!data.statusPayment && data.statusPayment !== 'All' ? this.statusPayments.filter(e => e.value === data.statusPayment)[0] : null,
            paymentMethod: !!data.paymentMethod && data.paymentMethod !== 'All' ? this.paymentMethods.filter(e => e.value === data.paymentMethod)[0] : null,
            requester: !!data.requester ? data.requester : null
        });
    }

    onSubmit() {
        const body: ISearchAdvancePayment = {
            referenceNos: !!this.referenceNo.value ? this.referenceNo.value.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            advanceModifiedDateFrom: !!this.modifiedDate.value && !!this.modifiedDate.value.startDate ? formatDate(this.modifiedDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            advanceModifiedDateTo: !!this.modifiedDate.value && !!this.modifiedDate.value.endDate ? formatDate(this.modifiedDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            requestDateFrom: !!this.requestDate.value && !!this.requestDate.value.startDate ? formatDate(this.requestDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            requestDateTo: !!this.requestDate.value && !!this.requestDate.value.endDate ? formatDate(this.requestDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            paymentMethod: !!this.paymentMethod.value ? this.paymentMethod.value : 'All',
            statusApproval: !!this.statusApproval.value ? this.statusApproval.value : 'All',
            statusPayment: !!this.statusPayment.value ? this.statusPayment.value : 'All',
            currencyId: !!this.currencyId.value ? this.currencyId.value : 'All',
            requester: !!this.requester.value ? this.requester.value : this.userLogged.id
        };
        this._store.dispatch(SearchListAdvancePayment(body));
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

    reset() {
        this.resetFormControl(this.requestDate);
        this.resetFormControl(this.modifiedDate);
        this.resetFormControl(this.referenceNo);
        this.resetFormControl(this.paymentMethod);
        this.resetFormControl(this.statusApproval);
        this.resetFormControl(this.statusPayment);
        this.resetFormControl(this.currencyId);

        this._store.dispatch(SearchListAdvancePayment({ requester: this.userLogged.id }));
    }
}

export interface ISearchAdvancePayment {
    referenceNos: string[];
    requester: string;
    requestDateFrom: string;
    requestDateTo: string;
    advanceModifiedDateFrom: string;
    advanceModifiedDateTo: string;
    paymentMethod: string;
    statusApproval: string;
    statusPayment: string;
    currencyId: string;
}

