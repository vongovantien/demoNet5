import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { Group } from 'src/app/shared/models/system/group';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemRepo, ExportRepo } from 'src/app/shared/repositories';
import { catchError, finalize, map } from 'rxjs/operators';
import { SortService } from 'src/app/shared/services';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html'
})
export class GroupComponent extends AppList implements OnInit {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    headers: CommonInterface.IHeaderTable[];
    titleConfirmDelete = 'Do you want to delete?';
    groups: Group[] = [];
    selectedGroup: any = null;

    constructor(
        private _progressService: NgProgress,
        private _systemRepo: SystemRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchGroup;
        this.requestSort = this.sortGroups;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'chargeNameEn', sortable: true },
            { title: 'Name (Local)', field: 'nameVn', sortable: true },
            { title: 'Name Abbr', field: 'shortName', sortable: true },
            { title: 'Department', field: 'departmentName', sortable: true },
            { title: 'Status', field: 'active', sortable: true }
        ];
        this.dataSearch = {
            all: null
        };
        this.searchGroup(this.dataSearch);
    }
    searchGroup(dataSearch?: any) {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.getGroup(this.page, this.pageSize, Object.assign({}, dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new Group(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems;
                    this.groups = res.data;
                },
            );
    }

    sortGroups(sort: string): void {
        this.groups = this._sortService.sort(this.groups, sort, this.order);
    }

    onDeleteGroup() {
        this.confirmDeletePopup.hide();
        this.deleteGroup(this.selectedGroup.id);
    }

    deleteGroup(id: any) {
        this._progressRef.start();
        this._systemRepo.deleteGroup(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchGroup(this.dataSearch);
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    onSearchGroup(dataSearch: any) {
        this.dataSearch = {};
        this.page = 1;
        if (!!dataSearch) {
            if (dataSearch.type === 'All') {
                this.dataSearch.all = dataSearch.keyword;
            } else {
                this.dataSearch.all = null;
                if (dataSearch.type === 'id') {
                    this.dataSearch.id = dataSearch.keyword;
                }
                if (dataSearch.type === 'code') {
                    this.dataSearch.code = dataSearch.keyword;
                }
                if (dataSearch.type === 'nameEn') {
                    this.dataSearch.nameEN = dataSearch.keyword;
                }
                if (dataSearch.type === 'nameVn') {
                    this.dataSearch.nameVN = dataSearch.keyword;
                }
                if (dataSearch.type === 'shortName') {
                    this.dataSearch.shortName = dataSearch.keyword;
                }
                if (dataSearch.type === 'departmentName') {
                    this.dataSearch.departmentName = dataSearch.keyword;
                }
            }
            this.searchGroup(this.dataSearch);
        }

    }

    confirmDelete(group) {
        this.selectedGroup = group;
        this.confirmDeletePopup.show();
    }

    export() {
        this._exportRepo.exportGroup(this.dataSearch)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}
