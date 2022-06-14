import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { AppList } from 'src/app/app.list';
import { AddDistrictPopupComponent } from './add-district/add-district.component';

import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-district',
    templateUrl: './district.component.html'
})

export class AppDistrictComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(AddDistrictPopupComponent) districtPopup: AddDistrictPopupComponent;

    districts: any[] = [];
    selectedDistrict: any;

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'nameEn', displayName: 'English Name' },
            { fieldName: 'nameVn', displayName: 'Local Name' },
            { fieldName: 'provinceName', displayName: 'Province-City' },
            { fieldName: 'countryName', displayName: 'Country' }
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
        this.requestSearch = this.searchProvince;
        this.requestList = this.getProvince;
        this.requestSort = this.sortProvince;
    }

    ngOnInit() {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.District };
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'nameEn', sortable: true },
            { title: 'Name Local', field: 'nameVn', sortable: true },
            { title: 'City-Province', field: 'provinceName', sortable: true },
            { title: 'Country', field: 'countryName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];

        this.getProvince();
    }

    searchProvince(event: CommonInterface.ISearchOption) {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.District };
        this.dataSearch[event.field] = event.searchString;
        this.getProvince();
    }

    getProvince() {
        this._progressRef.start();
        this.isLoading = true;
        this._catalogueRepo.pagingPlace(this.page, this.pageSize, this.dataSearch)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
                this._progressRef.complete();
            }))
            .subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.districts = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortProvince() {
        this.districts = this._sortService.sort(this.districts, this.sort, this.order);
    }

    resetSearch() {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.District };
        this.getProvince();
    }

    showAdd() {
        this.districtPopup.isSubmitted = false;
        this.districtPopup.isUpdate = false;

        this.districtPopup.formAddDistrict.reset();
        this.districtPopup.show();
    }

    showDetail(district: any) {
        this.selectedDistrict = district;
        if (this.selectedDistrict.id) {
            this.districtPopup.isUpdate = true;
            this.districtPopup.isSubmitted = false;

            this.districtPopup.formAddDistrict.patchValue(this.selectedDistrict);
            this.districtPopup.show();
        }
    }

    showConfirmDelete(district: any) {
        this.selectedDistrict = district;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();

        this._progressRef.start();
        this._catalogueRepo.deletePlace(this.selectedDistrict.id)
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
