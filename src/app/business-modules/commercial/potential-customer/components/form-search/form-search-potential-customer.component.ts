import { Component, OnInit, Output, EventEmitter, Input, } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'form-search-potential-customer',
    templateUrl: './form-search-potential-customer.component.html'
})

export class CommercialFormSearchPotentialCustomerComponent extends AppForm implements OnInit {

    @Input() configSearch: any;
    @Output() onSearch = new EventEmitter<any>();
    @Output() onReset = new EventEmitter<any>();

    defaultSetting: any = { fieldName: 'all', displayName: 'All' };
    settingFields: any[] = [this.defaultSetting];
    searchObject: any = {
        field: "",
        displayName: "",
        searchString: ""
    };

    constructor(
    ) {
        super();
        this.requestReset = this.resetSearch;
    }

    ngOnInit() {
        this.getSettings(this.configSearch);
    }

    getSettings(configSearch: any): any {
        if (this.configSearch.settingFields) {
            this.configSearch.settingFields.forEach((element: any) => {
                this.settingFields.push(element);
            });
        }
        this.searchObject.field = this.defaultSetting.fieldName;
        this.searchObject.displayName = this.defaultSetting.displayName;
        this.searchObject.searchString = configSearch.searchString;

    }

    resetSearch() {
        this.searchObject = {
            field: this.defaultSetting.fieldName,
            displayName: this.defaultSetting.displayName,
            searchString: ""
        };
        this.onReset.emit(this.searchObject);

    }

    searchTypeChange(field) {
        if (field === 'All') {
            this.searchObject.displayName = "All";
        } else {
            this.searchObject.displayName = field.displayName;
        }
        this.searchObject.field = field.fieldName;
    }

    searchClick() {
        this.onSearch.emit(this.searchObject);
    }

}
