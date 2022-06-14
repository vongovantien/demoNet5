import { Component, OnInit } from '@angular/core';
import { CatalogueRepo } from '@repositories';
import { Observable } from 'rxjs';
import { Partner } from '@models';
import { JobConstants } from '@constants';

@Component({
    selector: 'app-design-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

    countries: Observable<Partner[]>;
    displayFieldCity: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_CITY_PROVINCE;
    selectedCountry: any = null;
    selectedCountryFreeText: any = null;
    countryText: string = " country 2ways binding text";

    constructor
        (
            private _catalogueRepo: CatalogueRepo
        ) { }

    ngOnInit() {
        this.countries = this._catalogueRepo.getAllProvinces();
    }

    onSelectDataFormInfo(data: any) {
        console.log(data);
        this.selectedCountry = data.id;
    }

    /**
    * ng2-select
    */
    public items: Array<string> = ['Option 1', 'Option 2', 'Option 3', 'Option 4',
        'Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10',];

    private value: any = {};
    private _disabledV: string = '0';
    public disabled: boolean = false;

    private get disabledV(): string {
        return this._disabledV;
    }

    private set disabledV(value: string) {
        this._disabledV = value;
        this.disabled = this._disabledV === '1';
    }

    public selected(value: any): void {
        console.log('Selected value is: ', value);
    }

    public removed(value: any): void {
        console.log('Removed value is: ', value);
    }

    public typed(value: any): void {
        console.log('New search input: ', value);
    }

    public refreshValue(value: any): void {
        this.value = value;
    }
}
