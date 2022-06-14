import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'form-search-company',
    templateUrl: './form-search-company.component.html',
})
export class CompanyInformationFormSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<ISearchCompany> = new EventEmitter<ISearchCompany>();

    selectedType: any = null;
    types: CommonInterface.ICommonTitleValue[];
    configSearch: any;

    searchObject: ISearchCompany = {};
    constructor() {
        super();
        this.requestSearch = this.searchData;
        this.requestReset = this.onReset;
    }

    ngOnInit(): void {
        this.configSearch = {
            typeSearch: 'outtab',
            settingFields: <CommonInterface.IValueDisplay[]>[
                { displayName: 'Company Code', fieldName: 'code' },
                { displayName: 'Name (EN)', fieldName: 'buNameEn' },
                { displayName: 'Name (Local)', fieldName: 'buNameVn' },
                { displayName: 'Name Abbr', fieldName: 'buNameAbbr' },
            ]
        };
    }

    searchData(searchObject: ISearchObject) {
        this.searchObject[searchObject.field] = searchObject.searchString;
        this.onSearch.emit(this.searchObject);
        this.searchObject = {};
    }

    onReset(data: any) {
        this.searchObject = {};
        this.searchObject.All = null;
        this.onSearch.emit(this.searchObject);
    }
}

interface ISearchCompany {
    [key: string]: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
    searchString: string;
    field: string;
}
