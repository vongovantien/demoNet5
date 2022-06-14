import { AppForm } from "src/app/app.form";
import { Component, Output, EventEmitter, Input } from "@angular/core";
import { formatDate } from "@angular/common";
import { CatalogueRepo, SystemRepo } from "src/app/shared/repositories";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { Customer } from "src/app/shared/models/catalogue/customer.model";
import { User } from "src/app/shared/models";
import { Store } from "@ngrx/store";
import { IShareBussinessState, TransactionSearchListAction, getTransactionDataSearchState } from "../../store";
import { shareReplay, takeUntil } from "rxjs/operators";
import { CommonEnum } from "@enums";
import { SystemConstants } from "@constants";

@Component({
    selector: 'form-search-sea',
    templateUrl: './form-search-sea.component.html',
    styleUrls: ['./form-search-sea.component.scss']
})
export class ShareBusinessFormSearchSeaComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDataShipment> = new EventEmitter<ISearchDataShipment>();
    @Output() onReset: EventEmitter<ISearchDataShipment> = new EventEmitter<ISearchDataShipment>();
    @Input() transaction: number = 1;

    filterTypes: CommonInterface.ICommonTitleValue[];

    formSearch: FormGroup;
    searchText: AbstractControl;
    filterType: AbstractControl;
    serviceDate: AbstractControl;
    customer: AbstractControl;
    supplier: AbstractControl;
    agent: AbstractControl;
    saleman: AbstractControl;
    creator: AbstractControl;
    createdDate: AbstractControl;

    labelColoader: string = 'Shipping Line/Co-Loader';

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountNo', label: 'Partner ID' },
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' }
    ];

    displayFieldsSaleMan: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameVn', label: 'Full Name' },
        { field: 'role', label: 'Role' },
    ];

    customers: Observable<Customer[]>;
    suppliers: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    creators: Observable<User[]>;

    dataSearch: ISearchDataShipment;
    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IShareBussinessState>,
        private _systemRepo: SystemRepo) {
        super();

        this.requestReset = this.resetSearch;
    }

    ngOnInit(): void {
        this.initFormSearch();

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER, null);
        this.agents = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.AGENT, null);
        this.suppliers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CARRIER, null);

        this.creators = this._systemRepo.getSystemUsers({ active: true }).pipe(shareReplay());

        this.setDataForFilterType();
        this.setLabelColoader();

        // * Update form search from store
        this._store.select(getTransactionDataSearchState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (criteria: ISearchDataShipment) => {
                    if (!!Object.keys(criteria).length && criteria.transactionType === this.transaction) {
                        this.dataSearch = criteria;

                        ['jobNo', 'mawb', 'hwbno', 'soaNo', 'containerNo','creditDebitNo'].some(i => {
                            if (!!this.dataSearch[i]) {
                                this.filterType.setValue(this.filterTypes.find(d => d.value === i));
                                this.searchText.setValue(this.dataSearch[i]);
                                return true;
                            }
                        });
                    }
                }
            );
    }

    setDataForFilterType() {
        if (this.transaction === CommonEnum.TransactionTypeEnum.AirExport || this.transaction === CommonEnum.TransactionTypeEnum.AirImport) {
            this.filterTypes = [
                { title: 'Job ID', value: 'jobNo' },
                { title: 'MAWB No', value: 'mawb' },
                { title: 'HAWB No', value: 'hwbno' },
                { title: 'C/D No', value: 'creditDebitNo' },
                { title: 'SOA No', value: 'soaNo' },
            ];
        } else {
            this.filterTypes = [
                { title: 'Job ID', value: 'jobNo' },
                { title: 'Booking No', value: 'bookingNo' },
                { title: 'MBL No', value: 'mawb' },
                { title: 'HBL No', value: 'hwbno' },
                { title: 'Cont No', value: 'containerNo' },
                { title: 'Seal No', value: 'sealNo' },
                { title: 'Mark No', value: 'markNo' },
                { title: 'C/D No', value: 'creditDebitNo' },
                { title: 'SOA No', value: 'soaNo' },
            ];
        }
        this.filterType.setValue(this.filterTypes[0]);
    }

    setLabelColoader() {
        if (this.transaction === CommonEnum.TransactionTypeEnum.AirExport || this.transaction === CommonEnum.TransactionTypeEnum.AirImport) {
            this.labelColoader = "Airline/Co-Loader";
        }
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            searchText: [],
            filterType: [],
            serviceDate: [],
            customer: [],
            supplier: [],
            agent: [],
            saleman: [],
            creator: [],
            createdDate: [],
        });

        this.customer = this.formSearch.controls['customer'];
        this.supplier = this.formSearch.controls['supplier'];
        this.agent = this.formSearch.controls['agent'];
        this.saleman = this.formSearch.controls['saleman'];
        this.creator = this.formSearch.controls['creator'];

        this.searchText = this.formSearch.controls['searchText'];
        this.filterType = this.formSearch.controls['filterType'];
        this.serviceDate = this.formSearch.controls['serviceDate'];
        this.createdDate = this.formSearch.controls['createdDate'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.formSearch.controls['customer'].setValue(data.id);
                break;
            case 'supplier':
                this.formSearch.controls['supplier'].setValue(data.id);
                break;
            case 'agent':
                this.formSearch.controls['agent'].setValue(data.id);
                break;
            case 'saleman':
                this.formSearch.controls['saleman'].setValue(data.id);
                break;
            case 'creator':
                this.formSearch.controls['creator'].setValue(data.id);
                break;
            default:
                break;
        }
    }

    searchShipment() {
        const body: ISearchDataShipment = {
            all: null,
            jobNo: this.filterType.value.value === 'jobNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            mawb: this.filterType.value.value === 'mawb' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            hwbno: this.filterType.value.value === 'hwbno' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            containerNo: this.filterType.value.value === 'containerNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            sealNo: this.filterType.value.value === 'sealNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            markNo: this.filterType.value.value === 'markNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            creditDebitNo: this.filterType.value.value === 'creditDebitNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            soaNo: this.filterType.value.value === 'soaNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            bookingNo: this.filterType.value.value === 'bookingNo' ? (this.searchText.value ? this.searchText.value.trim().replace(SystemConstants.CPATTERN.UNICODE_ZERO_WIDTH, '') : '') : null,
            customerId: this.customer.value,
            coloaderId: this.supplier.value,
            agentId: this.agent.value,
            saleManId: this.saleman.value,
            userCreated: this.creator.value,
            fromDate: (!!this.createdDate.value && !!this.createdDate.value.startDate) ? formatDate(this.createdDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: (!!this.createdDate.value && !!this.createdDate.value.endDate) ? formatDate(this.createdDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            transactionType: null,
            fromServiceDate: (!!this.serviceDate.value && !!this.serviceDate.value.startDate) ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toServiceDate: (!!this.serviceDate.value && !!this.serviceDate.value.endDate) ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null
        };
        this.onSearch.emit(body);
        this._store.dispatch(new TransactionSearchListAction(body));
    }

    resetSearch() {
        this.resetKeywordSearchCombogrid();
        this.formSearch.reset();
        this.resetFormControl(this.customer);
        this.resetFormControl(this.supplier);
        this.resetFormControl(this.agent);
        this.resetFormControl(this.saleman);
        this.resetFormControl(this.creator);
        this.filterType.setValue(this.filterTypes[0]);
        this.onReset.emit(<any>{ transactionType: null });

        this._store.dispatch(new TransactionSearchListAction({}));

    }

    collapsed() {
        this.resetKeywordSearchCombogrid();
        this.resetFormControl(this.customer);
        this.resetFormControl(this.supplier);
        this.resetFormControl(this.agent);
        this.resetFormControl(this.saleman);
        this.resetFormControl(this.creator);
        this.resetFormControl(this.serviceDate);
        this.resetFormControl(this.createdDate);
    }

    expanded() {
        if (!!this.dataSearch) {
            const advanceSearchForm = {
                customer: this.dataSearch.customerId,
                supplier: this.dataSearch.coloaderId,
                agent: this.dataSearch.agentId,
                saleman: this.dataSearch.saleManId,
                creator: this.dataSearch.userCreated,
                serviceDate: !!this.dataSearch.fromServiceDate && !!this.dataSearch.toServiceDate ? {
                    startDate: new Date(this.dataSearch.fromServiceDate),
                    endDate: new Date(this.dataSearch.toServiceDate)
                } : null,
                createdDate: !!this.dataSearch.fromDate && !!this.dataSearch.toDate ? {
                    startDate: new Date(this.dataSearch.fromDate),
                    endDate: new Date(this.dataSearch.toDate)
                } : null
            };

            this.formSearch.patchValue(advanceSearchForm);
        }
    }
}

interface ISearchDataShipment {
    all: string;
    jobNo: string;
    mawb: string;
    hwbno: string;
    containerNo: string;
    sealNo: string;
    markNo: string;
    creditDebitNo: string;
    soaNo: string;
    customerId: string;
    coloaderId: string;
    agentId: string;
    saleManId: string;
    userCreated: string;
    fromDate: string;
    toDate: string;
    transactionType: Number;
    fromServiceDate: string;
    toServiceDate: string;
    bookingNo: string;
}