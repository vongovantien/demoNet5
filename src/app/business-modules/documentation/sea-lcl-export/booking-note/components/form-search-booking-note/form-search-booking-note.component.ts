import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { formatDate } from '@angular/common';

@Component({
    selector: 'sea-lcl-export-form-search-booking-note',
    templateUrl: './form-search-booking-note.component.html',
})
export class SeaLCLExportBookingNoteFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchBookingNote> = new EventEmitter<ISearchBookingNote>();

    configSearch: any;
    defaultSetting: any = { fieldName: 'All', displayName: 'All' };
    settingFields: any[] = [this.defaultSetting];
    dateFromTo: any = {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
    };
    searchObject: any = {
        field: "",
        displayName: "",
        searchString: ""
    };
    constructor(
    ) {
        super();
        this.requestSearch = this.searchData;
        this.requestReset = this.onReset;
    }

    ngOnInit(): void {
        this.configSearch = {
            settingFields: <CommonInterface.IValueDisplay[]>[
                { displayName: 'Booking No', fieldName: 'bookingNo' },
                { displayName: 'Shipper', fieldName: 'shipperName' },
                { displayName: 'Consignee', fieldName: 'consigneeName' },
                { displayName: 'POL', fieldName: 'polName' },
                { displayName: 'POD', fieldName: 'podName' },
                { displayName: 'Creator', fieldName: 'creatorName' }
            ]
        };
        if (this.configSearch.settingFields) {
            this.configSearch.settingFields.forEach((element: any) => {
                this.settingFields.push(element);
            });
        }
        this.searchObject.field = this.defaultSetting.fieldName;
        this.searchObject.displayName = this.defaultSetting.displayName;
        this.searchObject.searchString = this.configSearch.searchString;
    }

    searchTypeChange(field, event) {
        if (field == 'All') {
            this.searchObject.displayName = "All";
        } else {
            this.searchObject.displayName = field.displayName;
        }
        this.searchObject.field = field.fieldName;
    }

    searchData() {

        const searchData = {
            type: this.searchObject.field,
            keyword: this.searchObject.searchString,
            fromDate: (!!this.dateFromTo && !!this.dateFromTo.startDate) ? formatDate(this.dateFromTo.startDate, 'yyyy-MM-dd', 'en') : null,
            toDate: (!!this.dateFromTo && !!this.dateFromTo.endDate) ? formatDate(this.dateFromTo.endDate, 'yyyy-MM-dd', 'en') : null,
        };

        this.onSearch.emit(searchData);
        console.log(searchData);
    }

    onReset() {
        this.searchObject = {
            field: this.defaultSetting.fieldName,
            displayName: this.defaultSetting.displayName,
            searchString: ""
        };
        const searchData = {
            type: null,
            keyword: null,
            fromDate: null,
            toDate: null
        };
        this.dateFromTo = null;
        this.onSearch.emit(searchData);
    }

}

interface ISearchBookingNote {
    type: string;
    keyword: string;
}

