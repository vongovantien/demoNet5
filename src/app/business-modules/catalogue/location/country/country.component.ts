import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { AppList } from 'src/app/app.list';

import { SortService } from '@services';
import { CatalogueRepo } from '@repositories';
import { ConfirmPopupComponent } from '@common';
import { CommonEnum } from '@enums';

import { FormCountryPopupComponent } from './add-country/add-country.component';
import { CountryModel } from 'src/app/shared/models/catalogue/country.model';

import { catchError, finalize } from 'rxjs/operators';



@Component({
    selector: 'app-country',
    templateUrl: './country.component.html'
})

export class AppCountryComponent extends AppList implements OnInit {

    @ViewChild(FormCountryPopupComponent) formCountry: FormCountryPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    countries: CountryModel[] = [];
    selectedCountry: CountryModel;

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'nameEn', displayName: 'English Name' },
            { fieldName: 'nameVn', displayName: 'Local Name' }
        ],
        typeSearch: CommonEnum.TypeSearch.outtab
    };

    constructor(
        private _ngProgressService: NgProgress,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _toastService: ToastrService

    ) {
        super();

        this._progressRef = this._ngProgressService.ref();
        this.requestSearch = this.searchCountry;
        this.requestList = this.getCountries;
        this.requestSort = this.sortCountries;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'nameEn', sortable: true },
            { title: 'Name Local', field: 'nameVn', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];

        this.getCountries();
    }

    searchCountry(event: CommonInterface.ISearchOption) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.getCountries();
    }

    getCountries() {
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.pagingCountry(this.page, this.pageSize, this.dataSearch)
            .pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            })).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.countries = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortCountries() {
        this.countries = this._sortService.sort(this.countries, this.sort, this.order);
    }

    resetSearch() {
        this.dataSearch = {};
        this.getCountries();
    }

    showAdd() {
        this.formCountry.isSubmitted = false;
        this.formCountry.formAddCountry.reset();
        this.formCountry.show();
    }

    showDetail(country: CountryModel) {
        this.selectedCountry = country;
        if (this.selectedCountry.id) {
            this.formCountry.isUpdate = true;
            this.formCountry.isSubmitted = false;
            this.formCountry.id = country.id;

            this.formCountry.formAddCountry.patchValue(this.selectedCountry);
            this.formCountry.show();
        }
    }

    showConfirmDelete(country: CountryModel) {
        this.selectedCountry = country;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();

        this._progressRef.start();
        this._catalogueRepo.deleteCountry(this.selectedCountry.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this.resetSearch();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}

