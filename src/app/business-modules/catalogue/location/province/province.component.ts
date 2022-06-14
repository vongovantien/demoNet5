import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { AppList } from 'src/app/app.list';
import { AddProvincePopupComponent } from './add-province/add-province.component';

import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-province',
    templateUrl: './province.component.html'
})

export class AppProvinceComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(AddProvincePopupComponent) provincePopup: AddProvincePopupComponent;

    provinces: any[] = [];
    selectedProvince: any;

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'nameEn', displayName: 'English Name' },
            { fieldName: 'nameVn', displayName: 'Local Name' },
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
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Province };
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'nameEn', sortable: true },
            { title: 'Name Local', field: 'nameVn', sortable: true },
            { title: 'Country', field: 'countryName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];

        this.getProvince();
    }

    searchProvince(event: CommonInterface.ISearchOption) {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Province };
        this.dataSearch[event.field] = event.searchString;
        this.getProvince();
    }

    getProvince() {
        this._progressRef.start();
        this.isLoading = true;
        this._catalogueRepo.pagingPlace(this.page, this.pageSize, this.dataSearch)
            .pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            }))
            .subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.provinces = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortProvince() {
        this.provinces = this._sortService.sort(this.provinces, this.sort, this.order);
    }

    resetSearch() {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Province };
        this.getProvince();
    }

    showAdd() {
        this.provincePopup.isSubmitted = false;
        this.provincePopup.isUpdate = false;

        this.provincePopup.formProvince.reset();
        this.provincePopup.show();
    }

    showDetail(province: any) {
        this.selectedProvince = province;
        if (this.selectedProvince.id) {
            this.provincePopup.isUpdate = true;
            this.provincePopup.isSubmitted = false;

            this.provincePopup.formProvince.patchValue(this.selectedProvince);
            this.provincePopup.show();
        }
    }

    showConfirmDelete(province: any) {
        this.selectedProvince = province;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();

        this._progressRef.start();
        this._catalogueRepo.deletePlace(this.selectedProvince.id)
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
