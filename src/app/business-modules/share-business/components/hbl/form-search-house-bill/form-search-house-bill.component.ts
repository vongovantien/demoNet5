import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { formatDate } from '@angular/common';

@Component({
    selector: 'form-search-house-bill-detail',
    templateUrl: './form-search-house-bill.component.html',
})

export class ShareBusinessFormSearchHouseBillComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDataHbl> = new EventEmitter<ISearchDataHbl>();
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
            { title: 'HBL', value: 'hwbno' },
            { title: 'MBL', value: 'mawb' },
            { title: 'Customer', value: 'customerName' },
            { title: 'Saleman', value: 'saleManName' }
        ];
        this.filterType.setValue(this.filterTypes[0]);
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

    searchHbl() {
        const body: ISearchDataHbl = {
            all: null,
            mawb: this.filterType.value.value === 'mawb' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            hwbno: this.filterType.value.value === 'hwbno' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            fromDate: (!!this.serviceDate.value && !!this.serviceDate.value.startDate) ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: (!!this.serviceDate.value && !!this.serviceDate.value.endDate) ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerName: this.filterType.value.value === 'customerName' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            salemanName: this.filterType.value.value === 'saleManName' ? (this.searchText.value ? this.searchText.value.trim() : '') : null
        };
        this.onSearch.emit(body);
    }

    resetSearch() {
        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const body: ISearchDataHbl = {
            all: null,
            mawb: null,
            hwbno: null,
            customerName: null,
            salemanName: null,
            fromDate: formatDate(startDate, 'yyyy-MM-dd', 'en'),
            toDate: formatDate(new Date(), 'yyyy-MM-dd', 'en')
        };
        // this.formSearch.reset();
        this.searchText.reset();
        this.serviceDate.setValue({ startDate: startDate, endDate: new Date() });
        this.filterType.setValue(this.filterTypes[0]);

        this.onSearch.emit(body);
    }

}
interface ISearchDataHbl {
    all: string;
    mawb: string;
    hwbno: string;
    customerName: string;
    salemanName: string;
    fromDate: string;
    toDate: string;
}

