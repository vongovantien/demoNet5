import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'department-form-search',
    templateUrl: './form-search-department.component.html'
})

export class DepartmentFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDepartment> = new EventEmitter<ISearchDepartment>();
    configSearch: any;

    constructor() {
        super();
        this.requestSearch = this.searchData;
        this.requestReset = this.onReset;
    }

    ngOnInit() {
        this.configSearch = {
            typeSearch: 'outtab',
            settingFields: <CommonInterface.IValueDisplay[]>[
                { displayName: 'Department Code', fieldName: 'Code' },
                { displayName: 'Name EN', fieldName: 'DeptNameEn' },
                { displayName: 'Name Local', fieldName: 'DeptName' },
                { displayName: 'Name Abbr', fieldName: 'DeptNameAbbr' },
                { displayName: 'Office', fieldName: 'OfficeName' },
            ]
        };
    }

    searchData(searchObject: ISearchObject) {
        const searchData: ISearchDepartment = {
            type: searchObject.field,
            keyword: searchObject.searchString
        };
        this.onSearch.emit(searchData);
    }

    onReset(data: any) {
        this.onSearch.emit(data);
    }
}

interface ISearchDepartment {
    type: string;
    keyword: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
    searchString: string;
    field: string;
}