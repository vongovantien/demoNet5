import { Component, ViewChild } from '@angular/core';
import { StageModel } from 'src/app/shared/models/catalogue/stage.model';
import { SortService } from 'src/app/shared/services/sort.service';
import _findIndex from 'lodash/findIndex';
import _map from 'lodash/map';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { StageManagementAddPopupComponent } from './components/form-create/form-create-stage-management.popup';
import { ToastrService } from 'ngx-toastr';
import { CatalogueRepo, ExportRepo } from 'src/app/shared/repositories';
import { AppList } from 'src/app/app.list';
import { catchError, finalize, map } from 'rxjs/operators';
import { NgProgress } from '@ngx-progressbar/core';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-stage-management',
    templateUrl: './stage-management.component.html',
})
export class StageManagementComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) popupConfirm: ConfirmPopupComponent;
    @ViewChild(StageManagementAddPopupComponent) stageManagementAddPopupComponent: StageManagementAddPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    headers: CommonInterface.IHeaderTable[];

    listStages: StageModel[] = [];
    stage: StageModel = new StageModel();

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'id', displayName: 'Stage ID' },
            { fieldName: 'departmentName', displayName: 'Department' },
            { fieldName: 'stageNameEn', displayName: 'Name (EN)' },
            { fieldName: 'stageNameVn', displayName: 'Name (Local)' },
            { fieldName: 'code', displayName: 'Code' }
        ],
        typeSearch: TypeSearch.outtab
    };

    constructor(
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgessSerice: NgProgress,
        private _exportRepo: ExportRepo, ) {
        super();
        this._progressRef = this._ngProgessSerice.ref();
        this.requestList = this.getStages;
        this.requestSort = this.sortCommodity;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Department', sortable: true, field: 'deptName' },
            { title: 'Code', sortable: true, field: 'code' },
            { title: 'Name (Local)', sortable: true, field: 'stageNameVn' },
            { title: 'Name (EN)', sortable: true, field: 'stageNameEn' },
            { title: 'Description (Local)', sortable: true, field: 'descriptionVn' },
            { title: 'Description (EN)', sortable: true, field: 'descriptionEn' },
            { title: 'Status', sortable: true, field: 'active' },
        ];
        this.getStages();
    }

    onSearch(event: { field: string, searchString: string, displayName: string }) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.page = 1;
        this.getStages();
    }

    resetSearch() {
        this.dataSearch = {};
        this.getStages();
    }

    getStages() {
        this._progressRef.start();
        this._catalogueRepo.getStagePaging(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new StageModel(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.listStages = res.data;
                },
            );
    }

    sortCommodity(sortData: CommonInterface.ISortData): void {
        this.listStages = this._sortService.sort(this.listStages, sortData.sortField, sortData.order);
    }

    openPopupAddStage() {
        this.stageManagementAddPopupComponent.action = 'create';
        this.stageManagementAddPopupComponent.show();
    }

    onRequestStage() {
        this.getStages();
    }

    showDetailStage(stage) {
        console.log(stage)
        this._catalogueRepo.getDetailStage(stage.id).subscribe(
            (res: any) => {
                console.log(res)
                if (res.id !== 0) {
                    var _stage = new StageModel(res);
                    this.stageManagementAddPopupComponent.action = "update";
                    this.stageManagementAddPopupComponent.stageManagement = _stage;
                    this.stageManagementAddPopupComponent.getDetail();
                    this.stageManagementAddPopupComponent.show();
                } else {
                    this._toastService.error("Not found data");
                }
            },
        );
    }

    showConfirmDelete(data: any) {
        this.stage = data;
        this.confirmDeletePopup.show();
    }

    deleteStage() {
        this._catalogueRepo.deleteStage(this.stage.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getStages();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this.deleteStage();
    }

    export() {
        this._exportRepo.exportStage(this.dataSearch)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}
