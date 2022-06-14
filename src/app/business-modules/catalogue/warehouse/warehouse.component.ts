import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { SortService } from '@services';
import { CatalogueRepo, ExportRepo } from '@repositories';
import { Warehouse } from '@models';

import { AppList } from 'src/app/app.list';
import { FormWarehouseComponent } from './components/form-warehouse.component';

import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { catchError, finalize, map, tap, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-warehouse',
    templateUrl: './warehouse.component.html',
})
export class WarehouseComponent extends AppList implements OnInit {

    @ViewChild(FormWarehouseComponent) formPopup: FormWarehouseComponent;
    @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) infoPopup: Permission403PopupComponent;


    warehouses: Warehouse[] = [];
    warehouse: Warehouse = new Warehouse();

    criteria: any = { placeType: CommonEnum.PlaceTypeEnum.Warehouse };

    constructor(private sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private toastService: ToastrService,
        private exportRepository: ExportRepo,
        private _progressService: NgProgress,
    ) {

        super();

        this._progressRef = this._progressService.ref();
        this.requestList = this.requestWarehouses;
        this.requestSort = this.onSortChange;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name(EN)', field: 'nameEn', sortable: true },
            { title: 'Name(Local)', field: 'nameVn', sortable: true },
            { title: 'Name(ABBR)', field: 'displayName', sortable: true },
            { title: 'Country', field: 'countryName', sortable: true },
            { title: 'City/Province', field: 'provinceName', sortable: true },
            { title: 'District', field: 'districtName', sortable: true },
            { title: 'Address', field: 'address', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.configSearch = {
            settingFields: [...this.headers.slice(0, 3)].map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab
        };
        this.getDataCombobox();
        this.requestWarehouses();

    }

    getDataCombobox() {
        forkJoin([
            this._catalogueRepo.getCountryByLanguage(),
            this._catalogueRepo.getProvinces(),
            this._catalogueRepo.getDistricts()
        ])
            .pipe(catchError(this.catchError))
            .subscribe(
                ([countries, provinces, districts]) => {
                    this.formPopup.countries = this.utility.prepareNg2SelectData(countries || [], 'id', 'name');
                    this.formPopup.provinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    this.formPopup.districts = this.utility.prepareNg2SelectData(districts || [], 'id', 'name_VN');
                },
                () => { },
            );
    }

    requestWarehouses() {
        this.isLoading = true;
        this._catalogueRepo.pagingPlace(this.page, this.pageSize, Object.assign({}, this.criteria))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((res: any) => {
                    return {
                        data: res.data,
                        totalItems: res.totalItems,
                    };
                })
            ).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.totalItems = res.totalItems || 0;
                    this.warehouses = (res.data || []).map(i => new Warehouse(i)) || [];
                },
            );
    }

    onSortChange() {
        this.warehouses = this.sortService.sort(this.warehouses, this.sort, this.order);
    }

    showAdd() {
        this.formPopup.warehouseForm.reset();
        this.formPopup.code.enable();
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [false, false];
        this.formPopup.title = "Add Warehouse";
        this.formPopup.show();
    }

    showDetail(item: Warehouse) {
        this._catalogueRepo.checkAllowGetDetailPlace(item.id)
            .pipe(
                tap((res: boolean) => res),
                switchMap((res: boolean) => {
                    if (res) {
                        return this._catalogueRepo.getDetailPlace(item.id);
                    } else {
                        return of(false);
                    }
                })
            )
            .subscribe(
                (res: Warehouse | boolean) => {
                    if (!res) {
                        this.infoPopup.show();
                    } else {
                        this.warehouse = res as Warehouse;
                        this.formPopup.warehouse = res as Warehouse;

                        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];
                        this.formPopup.isShowUpdate = this.warehouse.permission.allowUpdate;
                        this.formPopup.title = "Update Warehouse";

                        this.formPopup.code.disable();
                        this.formPopup.setFormValue(res as Warehouse);
                        this.formPopup.show();

                    }
                }
            );
    }

    onDelete(event) {
        this.confirmPopup.hide();
        if (event) {
            this._catalogueRepo.deletePlace(this.warehouse.id)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                ).subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this.toastService.success(res.message, '');

                            this.page = 1;
                            this.requestList();
                        } else {
                            this.toastService.error(res.message || 'Có lỗi xảy ra', '');
                        }
                    },
                );
        }
    }

    showConfirmDelete(item: Warehouse) {
        this._catalogueRepo.checkAllowDeletePlace(item.id)
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.warehouse = item;
                        this.confirmPopup.show();
                    } else {
                        this.infoPopup.show();
                    }
                }
            );
    }
    resetSearch(event: { field: string; searchString: any; }) {
        this.criteria = {
            placeType: CommonEnum.PlaceTypeEnum.Warehouse
        };
        this.onSearch(event);
    }

    onSearch(event: { field: string; searchString: any; }) {
        const curLanguage = localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE);
        if (event.field === "All") {
            this.criteria.all = event.searchString;
            if (this.criteria.all.toLowerCase() === "active") {
                this.criteria.all = "";
                this.criteria.active = true;
            } else if (this.criteria.all.toLowerCase() === "inactive") {
                this.criteria.all = "";
                this.criteria.active = false;
            } else {
                this.criteria.active = null;
            }
        } else {
            this.criteria = {
                placeType: CommonEnum.PlaceTypeEnum.Warehouse
            };
            this.criteria[event.field] = event.searchString;
            if (curLanguage === SystemConstants.LANGUAGES.ENGLISH) {
                if (event.field === "countryName") {
                    this.criteria.countryNameEN = event.searchString;
                }
                if (event.field === "provinceName") {
                    this.criteria.provinceNameEN = event.searchString;
                }
                if (event.field === "districtName") {
                    this.criteria.districtNameEN = event.searchString;
                }
                if (event.field === "displayName") {
                    this.criteria.displayName = event.searchString;
                }
                if (event.field === "active") {
                    if (event.searchString.toLowerCase() === "active") {
                        this.criteria.active = true;
                    } else if (event.searchString.toLowerCase() === "inactive") {
                        this.criteria.active = false;
                    }
                }
            }
            if (curLanguage === SystemConstants.LANGUAGES.VIETNAM) {
                if (event.field === "countryName") {
                    this.criteria.countryNameVN = event.searchString;
                }
                if (event.field === "provinceName") {
                    this.criteria.provinceNameVN = event.searchString;
                }
                if (event.field === "districtName") {
                    this.criteria.districtNameVN = event.searchString;
                }
                if (event.field === "displayName") {
                    this.criteria.displayName = event.searchString;
                }
                if (event.field === "active") {
                    if (event.searchString.toLowerCase() === "active") {
                        this.criteria.active = true;
                    } else if (event.searchString.toLowerCase() === "inactive") {
                        this.criteria.active = false;
                    }
                }
            }
        }
        this.page = 1;
        this.requestWarehouses();
    }

    export() {
        this.exportRepository.exportPortIndex(this.criteria)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}
