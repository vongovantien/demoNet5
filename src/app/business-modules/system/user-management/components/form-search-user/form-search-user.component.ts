import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'form-search-user',
    templateUrl: './form-search-user.component.html',
})
export class UserFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchUser> = new EventEmitter<ISearchUser>();

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
                { displayName: 'User Name', fieldName: 'username' },
                { displayName: 'Name En', fieldName: 'employeeNameEn' },
                { displayName: 'Full Name', fieldName: 'employeeNameVn' },
                { displayName: 'User Type', fieldName: 'userType' },
                { displayName: 'Status', fieldName: 'active' },
                { displayName: 'StaffCode', fieldName: 'staffCode' }
            ]
        };

    }

    searchData(searchObject: ISearchObject) {
        const searchData: ISearchUser = {
            type: searchObject.field,
            keyword: searchObject.searchString
        };

        this.onSearch.emit(searchData);
        console.log(searchData);
    }

    onReset(data: any) {
        this.onSearch.emit(data);
    }

}

interface ISearchUser {
    type: string;
    keyword: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
    searchString: string;
    field: string;
}
