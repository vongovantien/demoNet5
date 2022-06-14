import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'form-search-office',
    templateUrl: './form-search-office.component.html',
})
export class OfficeFormSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<ISearchOffice> = new EventEmitter<ISearchOffice>();

    selectedType: any = null;
    types: CommonInterface.ICommonTitleValue[];
    configSearch: any;

    constructor() {
        super();
        this.requestSearch = this.searchData;
        this.requestReset = this.onReset;
    }

    ngOnInit(): void {
        this.configSearch = {
            typeSearch: 'outtab',
            settingFields: <CommonInterface.IValueDisplay[]>[
                { displayName: 'Office Code', fieldName: 'Code' },
                { displayName: 'Name EN', fieldName: 'NameEn' },
                { displayName: 'Name Local', fieldName: 'NameVn' },
                { displayName: 'Name Abbr', fieldName: 'NameAbbr' },
                { displayName: 'Taxcode', fieldName: 'Taxcode' },
                { displayName: 'Company', fieldName: 'Company' }
            ]
        };

    }

    searchData(searchObject: ISearchObject) {
        const searchData: ISearchOffice = {
            type: searchObject.field,
            keyword: searchObject.searchString
        };

        this.onSearch.emit(searchData);
        console.log(searchData);
    }

    onReset(data: any) {
        this.onSearch.emit(<any>{});
    }

}

interface ISearchOffice {
    type: string;
    keyword: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
    searchString: string;
    field: string;
}
