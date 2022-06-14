import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
    selector: 'form-search-import-job',
    templateUrl: 'form-search-import-job-detail.component.html'
})

export class ShareBusinessFormSearchImportJobComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDataJobDetail> = new EventEmitter<ISearchDataJobDetail>();
    @Input() service: string;

    filterTypes: CommonInterface.ICommonTitleValue[];
    formSearch: FormGroup;
    searchText: AbstractControl;
    filterType: AbstractControl;
    serviceDate: AbstractControl;


    constructor(
        private _fb: FormBuilder
    ) {
        super();
    }
    ngOnInit() {
        this.initFormSearch();
        this.filterTypes = [
            { title: 'Job ID', value: 'jobNo' },
            { title: 'MBL', value: 'mawb' },
            { title: this.service === 'air' ? 'Airline' : 'Supplier', value: 'supplierName' },
        ];
        this.filterType.setValue(this.filterTypes[0]);
    }
    searchJob() {
        const body: ISearchDataJobDetail = {
            all: null,
            jobNo: this.filterType.value.value === 'jobNo' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            mawb: this.filterType.value.value === 'mawb' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            fromDate: (!!this.serviceDate.value && !!this.serviceDate.value.startDate) ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: (!!this.serviceDate.value && !!this.serviceDate.value.endDate) ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            supplierName: this.filterType.value.value === 'supplierName' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
        };
        this.onSearch.emit(body);
    }
    resetSearch() {
        const date = new Date();
        this.serviceDate.setValue({
            startDate: new Date(date.getFullYear(), date.getMonth(), 1),
            endDate: new Date()
        });
        const body: ISearchDataJobDetail = {
            all: null,
            jobNo: null,
            mawb: null,
            supplierName: null,
            fromDate: (!!this.serviceDate.value && !!this.serviceDate.value.startDate) ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: (!!this.serviceDate.value && !!this.serviceDate.value.endDate) ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null
        };
        this.searchText.reset();
        this.filterType.setValue(this.filterTypes[0]);
        this.onSearch.emit(body);
    }

    initFormSearch() {
        const date = new Date();
        this.formSearch = this._fb.group({
            'searchText': [],
            'filterType': [],
            'serviceDate': [{
                startDate: new Date(date.getFullYear(), date.getMonth(), 1),
                endDate: new Date()
            }],

        });

        this.searchText = this.formSearch.controls['searchText'];
        this.filterType = this.formSearch.controls['filterType'];
        this.serviceDate = this.formSearch.controls['serviceDate'];
    }
}

interface ISearchDataJobDetail {
    all: string;
    jobNo: string;
    mawb: string;
    fromDate: string;
    toDate: string;
    supplierName: string;
}

