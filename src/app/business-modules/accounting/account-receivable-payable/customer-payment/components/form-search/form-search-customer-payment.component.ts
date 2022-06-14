import { formatDate } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AccountingConstants, JobConstants } from '@constants';
import { CommonEnum } from '@enums';
import { Currency, Customer, Partner, User } from '@models';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { Observable } from 'rxjs';
import { AppForm } from '@app';
import { Store } from '@ngrx/store';
import { SearchListCustomerPayment } from '../../store/actions';
import { customerPaymentReceipSearchState, ICustomerPaymentState } from '../../store/reducers';
import { takeUntil } from 'rxjs/operators';
import { isNull } from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'customer-payment-form-search',
    templateUrl: './form-search-customer-payment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class ARCustomerPaymentFormSearchComponent extends AppForm implements OnInit {

    formSearch: FormGroup;
    customerID: AbstractControl;
    creator: AbstractControl;
    refNo: AbstractControl;
    paymentType: AbstractControl;
    date: AbstractControl;
    dateType: AbstractControl;
    currency: AbstractControl;
    syncStatus: AbstractControl;
    status: AbstractControl;
    typeReceipt: AbstractControl;

    customerIDs: Observable<Customer[]>;
    creators: Observable<User[]>;
    Currencys: Observable<Currency[]>;

    displayFilesPartners: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;

    paymentTypes: string[] = AccountingConstants.PAYMENT_TYPE;
    dateTypes: string[] = AccountingConstants.DATE_TYPE;
    syncStatuss = AccountingConstants.SYNC_STATUSS;
    statuss = AccountingConstants.STATUS;
    typesReceipt: string[] = ['Customer', 'Agent'];
    statusRecepit: string[] = ['Draft', 'Cancel', 'Done'];

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _store: Store<ICustomerPaymentState>
    ) {
        super();
        this.requestReset = this.requestSearch;
    }

    ngOnInit() {
        this.initForm();

        this.customerIDs = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL, null);
        this.creators = this._systemRepo.getSystemUsers();
        this.Currencys = this._catalogueRepo.getListCurrency();
        this.subscriptionSearchParamState();
    }

    initForm() {
        this.formSearch = this._fb.group({
            refNo: [],
            paymentType: [],
            customerID: [],
            date: [{ startDate: new Date(new Date().setDate(new Date().getDate() - 29)), endDate: new Date() }],
            dateType: [],
            currency: [],
            status: [],
            syncStatus: [],
            typeReceipt: []
        });
        this.refNo = this.formSearch.controls['refNo'];
        this.paymentType = this.formSearch.controls['paymentType'];
        this.customerID = this.formSearch.controls['customerID'];
        this.date = this.formSearch.controls['date'];
        this.dateType = this.formSearch.controls['dateType'];
        this.currency = this.formSearch.controls['currency'];
        this.syncStatus = this.formSearch.controls['syncStatus'];
        this.typeReceipt = this.formSearch.controls['typeReceipt'];
        this.status = this.formSearch.controls['status'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.customerID.setValue((data as Partner).id);
                break;
            case 'currency':
                this.currency.setValue((data as Currency).id);
                break;
            default:
                break;
        }
    }

    search() {
        const body: IAcctReceiptCriteria = {
            refNo: this.refNo.value,
            paymentType: this.paymentType.value,
            customerID: this.customerID.value,
            dateFrom: (!!this.date.value && !!this.date.value.startDate) ? formatDate(this.date.value.startDate, 'yyyy-MM-dd', 'en') : null,
            dateTo: (!!this.date.value && !!this.date.value.endDate) ? formatDate(this.date.value.endDate, 'yyyy-MM-dd', 'en') : null,
            dateType: this.dateType.value,
            currency: this.currency.value,
            syncStatus: this.syncStatus.value,
            status: this.status.value,
            typeReceipt: this.typeReceipt.value
        };
        //this._listReceipt.onSearchCPs(body);
        this._store.dispatch(SearchListCustomerPayment(body))
    }

    reset() {
        this.resetKeywordSearchCombogrid();
        this.date.reset({ startDate: new Date(new Date().setDate(new Date().getDate() - 29)), endDate: new Date() });

        this.refNo.reset();
        this.paymentType.reset();
        this.customerID.reset();
        this.dateType.reset();
        this.currency.setValue(null);
        this.syncStatus.reset();
        this.status.reset();

        this._store.dispatch(SearchListCustomerPayment({}))
    }

    subscriptionSearchParamState() {
        this._store.select(customerPaymentReceipSearchState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (data) {
                        let formData: any = {
                            refNo: data?.refNo?.toString().replace(/[,]/g, "\n") || null,
                            paymentType: data.paymentType ? data.paymentType : null,
                            customerID: data?.customerID,
                            date: (!!data?.dateFrom && !!data?.dateTo) ? { startDate: new Date(data?.dateFrom), endDate: new Date(data?.dateTo) } : null,
                            dateType: data.dateType ? data.dateType : null,
                            currency: data.currency ? data.currency : null,
                            status: data.status ? data.status : null,
                            syncStatus: data.syncStatus ? data.syncStatus : null,
                            typeReceipt: data.typeReceipt ? data.typeReceipt : null
                        };

                        this.formSearch.patchValue(formData);
                    }
                }
            );
    }
}

export interface IAcctReceiptCriteria {
    refNo: string;
    paymentType: string;
    customerID: string;
    dateFrom: string;
    dateTo: string;
    dateType: string;
    currency: string;
    syncStatus: string;
    status: string;
    typeReceipt: string;
}
