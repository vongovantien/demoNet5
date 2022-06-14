import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ButtonModalSetting } from '../../models/layout/button-modal-setting.model';
import { ButtonType } from '../../enums/type-button.enum';
import { AppForm } from 'src/app/app.form';
@Component({
    selector: 'app-search-options',
    templateUrl: './search-options.component.html'
})
export class SearchOptionsComponent extends AppForm implements OnInit {
    @Input() configSearch: any;
    @Output() search = new EventEmitter<any>();
    @Output() reset_search = new EventEmitter<any>();

    defaultSetting: any = { fieldName: 'All', displayName: 'All' };
    settingFields: any[] = [this.defaultSetting];
    searchObject: any = {
        field: "",
        displayName: "",
        searchString: ""
    };

    resetButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.reset
    };

    constructor() {
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

    searchTypeChange(field, event) {
        if (field == 'All') {
            this.searchObject.displayName = "All";
        } else {
            this.searchObject.displayName = field.displayName;
        }
        this.searchObject.field = field.fieldName;
    }

    searchClick() {
        this.search.emit(this.searchObject);
    }

    resetSearch() {
        this.searchObject = {
            field: this.defaultSetting.fieldName,
            displayName: this.defaultSetting.displayName,
            searchString: ""
        };
        this.reset_search.emit(this.searchObject);
    }
}
