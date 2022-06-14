import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { User, Customer } from '@models';
import { Observable } from 'rxjs';
import { AbstractControl, FormGroup, FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { JobConstants, AccountingConstants } from '@constants';

@Component({
    selector: 'form-search-accounting-management',
    templateUrl: './form-search-accounting-management.component.html'
})

export class AccountingManagementFormSearchComponent extends AppForm implements OnInit {
    @Output() onSearch: EventEmitter<ISearchDataInvoiceCDNote> = new EventEmitter<ISearchDataInvoiceCDNote>();
    @Output() onReset: EventEmitter<ISearchDataInvoiceCDNote> = new EventEmitter<ISearchDataInvoiceCDNote>();

    partners: Observable<Customer[]>;
    creators: Observable<User[]>;

    filterTypes: string[] = ['All', 'Debit', 'Credit', 'Invoice'];
    status: string[] = AccountingConstants.STATUS_CD;

    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;

    displayFieldsCreator: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameVn', label: 'Full Name' }
    ];

    partner: AbstractControl;
    searchText: AbstractControl;
    creator: AbstractControl;
    exportDate: AbstractControl;
    accountingDate: AbstractControl;
    filterType: AbstractControl;
    filterStatus: AbstractControl;

    formSearch: FormGroup;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder
    ) {
        super();

        this.requestReset = this.resetSearch;
    }

    ngOnInit() {
        this.initForm();

        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL, null);
        this.creators = this._systemRepo.getSystemUsers();
    }

    initForm() {
        this.formSearch = this._fb.group({
            searchText: [],
            partner: [],
            exportDate: [],
            accountingDate: [],
            creator: [],
            filterType: [this.filterTypes[0]],
            filterStatus: []
        });

        this.partner = this.formSearch.controls['partner'];
        this.creator = this.formSearch.controls['creator'];
        this.searchText = this.formSearch.controls['searchText'];
        this.filterType = this.formSearch.controls['filterType'];
        this.exportDate = this.formSearch.controls['exportDate'];
        this.accountingDate = this.formSearch.controls['accountingDate'];
        this.filterStatus = this.formSearch.controls['filterStatus'];

    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.formSearch.controls['partner'].setValue(data.id);
                break;
            case 'creator':
                this.formSearch.controls['creator'].setValue(data.id);
                break;
            default:
                break;
        }
    }

    searchInvoiceCDnote() {
        const s = (!!this.exportDate.value && !!this.exportDate.value.startDate) ? formatDate(this.exportDate.value.startDate, 'yyyy-MM-dd', 'en') : null;
        const body: ISearchDataInvoiceCDNote = {
            referenceNos: this.searchText.value,
            partnerId: this.partner.value,
            creatorId: this.creator.value,
            type: this.filterType.value === 'All' ? null : this.filterType.value,
            status: this.filterStatus.value,
            fromExportDate: this.exportDate.value ? (this.exportDate.value.startDate !== null ? formatDate(this.exportDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            toExportDate: this.exportDate.value ? (this.exportDate.value.endDate !== null ? formatDate(this.exportDate.value.endDate, 'yyyy-MM-dd', 'en') : null) : null,
            fromAccountingDate: this.accountingDate.value ? (this.accountingDate.value.startDate !== null ? formatDate(this.accountingDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            toAccountingDate: this.accountingDate.value ? (this.accountingDate.value.endDate !== null ? formatDate(this.accountingDate.value.endDate, 'yyyy-MM-dd', 'en') : null) : null,
        };
        this.onSearch.emit(body);
    }

    resetSearch() {
        this.resetKeywordSearchCombogrid();
        this.formSearch.reset();

        this.resetFormControl(this.partner);
        this.resetFormControl(this.creator);
        this.onReset.emit(<any>{ transactionType: null });
    }
}
interface ISearchDataInvoiceCDNote {
    referenceNos: string;
    partnerId: string;
    creatorId: string;
    type: string;
    status: string;
    fromExportDate:string;
    toExportDate:string;
    fromAccountingDate:string;
    toAccountingDate:string;
}
