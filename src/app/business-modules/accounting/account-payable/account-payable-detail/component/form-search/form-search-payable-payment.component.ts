import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { formatDate } from '@angular/common';

import { CatalogueRepo, SystemRepo } from '@repositories';
import { Office, Partner } from '@models';
import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { AppForm } from 'src/app/app.form';

import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { getAccountPayablePaymentSearchState, IAccountPayablePaymentState } from '../../store/reducers';
import { SearchListAccountPayableDetail } from '../../store/actions';


@Component({
    selector: 'form-search-payable-payment',
    templateUrl: './form-search-payable-payment.component.html'
})
export class FormSearchPayablePaymentComponent extends AppForm implements OnInit {

    @Output() onSearch: EventEmitter<Partial<ISearchPayablePayment>> = new EventEmitter<Partial<ISearchPayablePayment>>();

    formSearch: FormGroup;

    partnerId: AbstractControl;
    referenceNo: AbstractControl;
    paymentDate: AbstractControl;
    paymentStatus: AbstractControl;
    searchType: AbstractControl;
    office: AbstractControl;
    transactionType: AbstractControl;

    partners: Observable<Partner[]>;
    offices: any[] = [];

    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountNo', label: 'ID' },
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameVn', label: 'Name Local' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    paymentStatusList: string[] = ['All', 'Unpaid', 'Paid A Part', 'Paid'];
    transactionTypes: string[] = ['All', 'Credit', 'OBH', 'ADV'];

    referenceTypes: CommonInterface.ICommonTitleValue[] = [
        { title: 'Voucher No', value: 'VoucherNo' },
        { title: 'Document No', value: 'DocumentNo' },
        { title: 'VAT Invoice', value: 'VatInv' }
    ];

    loginData: SystemInterface.IClaimUser;
    
    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _store: Store<IAccountPayablePaymentState>
    ) {
        super();
        this.requestSearch = this.submitSearch;
        this.requestReset = this.resetSearch;
    }

    ngOnInit(): void {
        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.loginData = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        
        this.initForm();
        this.subscriptionSearchParamState();
        this.getOffices();
    }

    initForm() {
        this.formSearch = this._fb.group({
            searchType: [this.referenceTypes[0].value],
            referenceNo: [null],
            partnerId: [],
            paymentDate: [{ startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) }],
            paymentStatus: [[this.paymentStatusList[1], this.paymentStatusList[2]]],
            office: [[this.loginData.officeId]],
            transactionType: [['All']]
        });

        this.partnerId = this.formSearch.controls["partnerId"];
        this.paymentDate = this.formSearch.controls["paymentDate"];
        this.paymentStatus = this.formSearch.controls["paymentStatus"];
        this.searchType = this.formSearch.controls["searchType"];
        this.referenceNo = this.formSearch.controls["referenceNo"];
        this.office = this.formSearch.controls["office"];
        this.transactionType = this.formSearch.controls["transactionType"];
    }

    // tslint:disable-next-line:no-any
    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.partnerId.setValue((data as Partner).id);
                break;
            default:
                break;
        }
    }

    submitSearch() {
        // tslint:disable-next-line:no-any
        const dataForm: { [key: string]: any } = this.formSearch.getRawValue();
        const status = !!dataForm.paymentStatus ? this.getSearchStatus(dataForm.paymentStatus) : null;
        const transaction = !!dataForm.transactionType ? this.getSearchStatus(dataForm.transactionType) : null;
        const body: ISearchPayablePayment = {
            // tslint:disable-next-line:no-any
            searchType: dataForm.searchType,
            // referenceNos: !!dataForm.referenceNo ? dataForm.referenceNo.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: any) => item.trim()) : null,
            referenceNos: dataForm.referenceNo,
            partnerId: dataForm.partnerId,
            paymentStatus: status,
            fromPaymentDate: (!!dataForm.paymentDate && !!dataForm.paymentDate.startDate) ? formatDate(dataForm.paymentDate.startDate, 'yyyy-MM-dd', 'en') : null,
            toPaymentDate: (!!dataForm.paymentDate && !!dataForm.paymentDate.endDate) ? formatDate(dataForm.paymentDate.endDate, 'yyyy-MM-dd', 'en') : null,
            office: !!dataForm.office ? this.getOfficeSearch(dataForm.office) : null,
            transactionType : transaction
        };
        this._store.dispatch(SearchListAccountPayableDetail(body));
        this.onSearch.emit(body);
    }

    getSearchStatus(paymentStatus: []) {
        let strStatus = null;
        if (!!paymentStatus) {
            strStatus = [];

            paymentStatus.forEach(element => {
                if (element !== 'All') {
                    strStatus.push(element);
                } else {
                    return [];
                }
            });
        }
        return strStatus;
    }

    getOfficeSearch(office: []){
        let strOffice = [];
        if (office.length > 0) {
            office.forEach(element => {
                strOffice.push(element);
            });
        }else{
            this.offices.forEach((item: Office)=> strOffice.push(item.id));
        }
        return strOffice;
    }

    getOffices() {
        this._systemRepo.getListOfficesByUserId(this.loginData.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: Office[]) => {
                    this.offices = res;
                },
            );
    }

    resetSearch() {
        this.formSearch.reset();
        this.searchType.setValue(this.referenceTypes[0].value);
        this.referenceNo.setValue(null);
        this.partnerId.setValue(null);
        this.paymentStatus.setValue([this.paymentStatusList[1], this.paymentStatusList[2]]);
        this.transactionType.setValue(['All']);
        this.office.setValue([this.loginData.officeId]);
        this.paymentDate.setValue([{ startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) }]);

        this.getOffices();
        this._store.dispatch(SearchListAccountPayableDetail({ searchType : this.referenceTypes[0].value, paymentStatus: this.getSearchStatus(this.paymentStatus.value)
            , fromPaymentDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd', 'en')
            , toPaymentDate: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd', 'en')
            , transactionType: ''
            , office: this.getSearchStatus(this.office.value) }));
    }

    selelectedSelect(event: string, type: string) {
        switch (type) {
            case "status":
                const currStatus = this.paymentStatus.value;
                if (currStatus.filter(x => x === 'All').length > 0 && event !== 'All') {
                    currStatus.splice(0);
                    currStatus.push(event);
                    this.paymentStatus.setValue(currStatus);

                }
                if (event === 'All') {
                    this.paymentStatus.setValue(['All']);
                }
                break;
            case "transaction":
                const currTrans = this.transactionType.value;
                if (currTrans.filter(x => x === 'All').length > 0 && event !== 'All') {
                    currTrans.splice(0);
                    currTrans.push(event);
                    this.transactionType.setValue(currTrans);

                }
                if (event === 'All') {
                    this.transactionType.setValue(['All']);
                }
                break;
        }
    }

    subscriptionSearchParamState() {
        this._store.select(getAccountPayablePaymentSearchState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (data) {
                        let formData: any = {
                            searchType: data.searchType,
                            referenceNo: !!data.referenceNos && !!data.referenceNos.length ? data.referenceNos : null,
                            partnerId: data.partnerId ? data.partnerId : null,
                            paymentDate: (!!data?.fromPaymentDate && !!data?.toPaymentDate) ?
                                { startDate: new Date(data?.fromPaymentDate), endDate: new Date(data?.toPaymentDate) } : null,
                            office: data.office.length === 0 ? (!!this.loginData ? [this.loginData.officeId] : null) : data.office,
                            paymentStatus: data.paymentStatus.length === 0 ? [this.paymentStatusList[0]] : data.paymentStatus,
                            transactionType: data.transactionType.length === 0 ? [this.transactionTypes[0]] : data.transactionType
                        };
                        this.formSearch.patchValue(formData);
                    }
                }
            );
    }
}

interface ISearchPayablePayment {
    searchType: string;
    referenceNos: string;
    partnerId: string;
    fromPaymentDate: string;
    toPaymentDate: string;
    office: string[];
    paymentStatus: string[];
    transactionType: string[];
}



