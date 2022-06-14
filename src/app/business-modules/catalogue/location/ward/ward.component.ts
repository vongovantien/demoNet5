import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { AppList } from 'src/app/app.list';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { AddWardPopupComponent } from './add-ward/add-ward.component';

import { catchError, finalize } from 'rxjs/operators';



@Component({
    selector: 'app-ward',
    templateUrl: './ward.component.html'
})

export class AppWardComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(AddWardPopupComponent) wardPopup: AddWardPopupComponent;

    wards: any[] = [];
    selectedWard: any;

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'nameEn', displayName: 'English Name' },
            { fieldName: 'nameVn', displayName: 'Local Name' },
            { fieldName: 'districtName', displayName: 'District' },
            { fieldName: 'provinceName', displayName: 'City-Province' },
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
        this.requestSearch = this.searchWard;
        this.requestList = this.getWards;
        this.requestSort = this.sortWard;
    }

    ngOnInit() {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Ward };
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'nameEn', sortable: true },
            { title: 'Name Local', field: 'nameVn', sortable: true },
            { title: 'District', field: 'districtName', sortable: true },
            { title: 'City-Province', field: 'provinceName', sortable: true },
            { title: 'Country', field: 'countryName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];

        this.getWards();
    }

    searchWard(event: CommonInterface.ISearchOption) {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Ward };
        this.dataSearch[event.field] = event.searchString;
        this.getWards();
    }

    getWards() {
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.pagingPlace(this.page, this.pageSize, this.dataSearch)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
                this._progressRef.complete();
            }))
            .subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.wards = res.data || [];
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortWard() {
        this.wards = this._sortService.sort(this.wards, this.sort, this.order);
    }

    resetSearch() {
        this.dataSearch = { placeType: CommonEnum.PlaceTypeEnum.Ward };
        this.getWards();
    }

    showAdd() {
        this.wardPopup.isSubmitted = false;
        this.wardPopup.isUpdate = false;

        this.wardPopup.formAddWard.reset();
        this.wardPopup.show();
    }

    showDetail(ward: any) {
        this.selectedWard = ward;
        if (this.selectedWard.id) {
            this.wardPopup.isUpdate = true;
            this.wardPopup.isSubmitted = false;

            this.wardPopup.formAddWard.patchValue(this.selectedWard);
            this.wardPopup.show();
        }
    }

    showConfirmDelete(ward: any) {
        this.selectedWard = ward;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();

        this._progressRef.start();
        this._catalogueRepo.deletePlace(this.selectedWard.id)
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
