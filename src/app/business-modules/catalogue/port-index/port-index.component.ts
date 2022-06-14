import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { PortIndex } from '@models';
import { SortService } from '@services';
import { CatalogueRepo, ExportRepo } from '@repositories';

import { SystemConstants } from 'src/constants/system.const';
import { AppList } from 'src/app/app.list';

import { FormPortIndexComponent } from './components/form-port-index.component';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { CommonEnum } from '@enums';

import { of } from 'rxjs';
import { catchError, finalize, map, tap, switchMap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-port-index',
    templateUrl: './port-index.component.html'
})
export class PortIndexComponent extends AppList implements OnInit {
    @ViewChild(FormPortIndexComponent) formPopup: FormPortIndexComponent;
    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    portIndexs: Array<PortIndex> = [];
    portIndex: PortIndex = new PortIndex();

    criteria: any = { placeType: CommonEnum.PlaceTypeEnum.Port };

    constructor(private sortService: SortService,
        private exportRepository: ExportRepo,
        private catalogueRepo: CatalogueRepo,
        private toastService: ToastrService,
        private _progressService: NgProgress) {
        super();

        this._progressRef = this._progressService.ref();
        this.requestList = this.requestPortIndex;
        this.requestSort = this.onSortChange;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name(EN)', field: 'nameEn', sortable: true },
            { title: 'Name(Local)', field: 'nameVn', sortable: true },
            { title: 'Country', field: 'countryName', sortable: true },
            { title: 'Zone', field: 'areaName', sortable: true },
            { title: 'Mode', field: 'modeOfTransport', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.configSearch = {
            settingFields: this.headers.map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab
        };
        this.requestPortIndex();
        this.getDataCombobox();
    }

    requestPortIndex() {
        this.isLoading = true;
        this.catalogueRepo.pagingPlace(this.page, this.pageSize, Object.assign({}, this.criteria))
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
                    this.portIndexs = res.data || [];
                },
            );
    }

    onSearch(event) {
        this.criteria = {
            placeType: CommonEnum.PlaceTypeEnum.Port
        };
        if (event.field === "All") {
            this.criteria.all = event.searchString;
        } else {
            const language = localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE);
            if (language === SystemConstants.LANGUAGES.ENGLISH) {
                if (event.field === "countryName") {
                    this.criteria.countryNameEN = event.searchString;
                }
                if (event.field === "areaName") {
                    this.criteria.areaNameEN = event.searchString;
                }
            } else {
                if (event.field === "countryName") {
                    this.criteria.countryNameVN = event.searchString;
                }
                if (event.field === "areaName") {
                    this.criteria.areaNameVN = event.searchString;
                }
            }
            if (language === SystemConstants.LANGUAGES.VIETNAM) {
            }
            if (event.field === "code") {
                this.criteria.code = event.searchString;
            }
            if (event.field === "nameEn") {
                this.criteria.nameEN = event.searchString;
            }
            if (event.field === "nameVn") {
                this.criteria.nameVN = event.searchString;
            }
            if (event.field === "modeOfTransport") {
                this.criteria.modeOfTransport = event.searchString;
            }
        }
        this.page = 1;
        this.requestList();
    }

    resetSearch(event) {
        this.criteria = {
            placeType: CommonEnum.PlaceTypeEnum.Port
        };
        this.onSearch(event);
    }

    showAdd() {
        this.formPopup.portindexForm.reset();
        this.formPopup.isShowUpdate = true;
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [false, false];
        this.formPopup.title = "Add Port Index";
        this.formPopup.code.enable();
        this.formPopup.show();
    }

    showDetail(item: PortIndex) {
        this.catalogueRepo.checkAllowGetDetailPlace(item.id)
            .pipe(
                tap((res: boolean) => res),
                switchMap((res: boolean) => {
                    if (res) {
                        return this.catalogueRepo.getDetailPlace(item.id);
                    } else {
                        return of(false);
                    }
                })
            ).subscribe(
                (res: PortIndex | boolean) => {
                    if (!res) {
                        this.info403Popup.show();
                    } else {
                        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];
                        this.formPopup.title = "Update Port Index";

                        this.formPopup.code.disable();
                        this.formPopup.portIndex = res as PortIndex;
                        this.formPopup.isShowUpdate = (res as PortIndex).permission.allowUpdate;

                        this.formPopup.setFormValue(res);
                        this.formPopup.show();
                    }
                }
            );
    }

    getDataCombobox() {
        this.getCountries();
        this.getAreas();
        this.getModeOfTransport();
    }

    getModeOfTransport() {
        this.catalogueRepo.getModeOfTransport()
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (responses) => {
                    if (responses) {
                        this.formPopup.modes = this.utility.prepareNg2SelectData(responses, 'id', 'name');
                    } else {
                        this.formPopup.modes = [];
                    }
                }
            );
    }

    getAreas() {
        this.catalogueRepo.getAreas()
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (responses) => {
                    if (responses) {
                        this.formPopup.areas = this.utility.prepareNg2SelectData(responses, 'id', 'nameEn');
                    } else {
                        this.formPopup.areas = [];
                    }
                }
            );
    }

    getCountries() {
        this.catalogueRepo.getCountry()
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (responses) => {
                    if (responses) {
                        this.formPopup.countries = this.utility.prepareNg2SelectData(responses, 'id', 'nameEn');
                    } else {
                        this.formPopup.countries = [];
                    }
                }
            );
    }

    showConfirmDelete(item: PortIndex) {
        this.catalogueRepo.checkAllowDeletePlace(item.id)
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.confirmDeletePopup.show();
                        this.portIndex = item;
                    } else {
                        this.info403Popup.show();
                    }
                }
            )
    }

    onDelete(event) {
        this.confirmDeletePopup.hide();
        if (event) {
            this.catalogueRepo.deletePlace(this.portIndex.id)
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

    onSortChange() {
        this.portIndexs = this.sortService.sort(this.portIndexs, this.sort, this.order);
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
