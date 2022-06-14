import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { ButtonModalSetting } from '../../../shared/models/layout/button-modal-setting.model';
import { ButtonType } from '../../../shared/enums/type-button.enum';
import { SystemRepo } from 'src/app/shared/repositories';
import { map, catchError, finalize } from 'rxjs/operators';
import { NgProgress } from '@ngx-progressbar/core';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'src/app/shared/services';
import { Router } from '@angular/router';
import { ExportRepo } from 'src/app/shared/repositories';
import { User } from 'src/app/shared/models';
import { RoutingConstants, SystemConstants } from '@constants';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html'
})
export class UserManagementComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    criteria: any = {};
    users: User[] = [];
    selectedUser: User;
    headers: CommonInterface.IHeaderTable[];
    exportButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.export
    };
    saveButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.save
    };
    importButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.import
    };

    cancelButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.cancel
    };
    addButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.add
    };

    constructor(
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _router: Router,
        private _exportRepo: ExportRepo

    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchUser;
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {
        this.headers = [
            { title: 'User Name', field: 'username', sortable: true, width: 100 },
            { title: 'Name EN', field: 'employeeNameEn', sortable: true },
            { title: 'FullName', field: 'employeeNameVn', sortable: true },
            { title: 'User Type', field: 'userType', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.dataSearch = {
            type: 'All'
        };
        this.criteria.all = null;
        this.searchUser();
    }

    sortLocal(sort: string): void {
        this.users = this._sortService.sort(this.users, sort, this.order);
    }


    onSearchUser(dataSearch: any) {
        this.dataSearch = dataSearch;
        this.page = 1;
        this.criteria = {};
        if (this.dataSearch.type === 'All') {
            this.criteria.all = this.dataSearch.keyword;
            if (!!this.dataSearch.keyword && (this.dataSearch.keyword.toLowerCase() === "active" || this.dataSearch.keyword.toLowerCase() === "inactive")) {
                this.criteria.all = this.dataSearch.keyword.toLowerCase();
            }
        } else {
            this.criteria.all = null;
        }
        if (this.dataSearch.type === 'username') {

            this.criteria.username = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'employeeNameEn') {

            this.criteria.employeeNameEn = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'employeeNameVn') {

            this.criteria.employeeNameVn = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'userType') {

            this.criteria.userType = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'active') {
            if (this.dataSearch.keyword !== "") {
                if (this.dataSearch.keyword.toLowerCase() === "active") {
                    this.criteria.active = true;
                } else if (this.dataSearch.keyword.toLowerCase() === "inactive") {
                    this.criteria.active = false;
                } else {
                    this.criteria.active = null;
                }
            }

            // this.criteria.active = this.dataSearch.keyword === "Active" ? true : false;
            // this.criteria.active = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'staffCode') {

            this.criteria.staffCode = this.dataSearch.keyword;
        }
        this.searchUser();
    }


    searchUser() {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.getUser(this.page, this.pageSize, Object.assign({}, this.criteria))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    if (data.data != null) {
                        return {
                            data: data.data.map((item: any) => new User(item)),
                            totalItems: data.totalItems,
                        };
                    }
                    return {
                        data: new User(),
                        totalItems: 0,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.users = res.data;

                },
            );
    }

    showDeletePopup(user: User) {
        this.confirmDeletePopup.show();
        this.selectedUser = user;
    }

    onDeleteUser() {
        this.confirmDeletePopup.hide();
        this.deleteUser(this.selectedUser.id);
    }

    deleteUser(id: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.deleteUser(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchUser();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    gotoDetailUser(id: number) {
        this._router.navigate([`${RoutingConstants.SYSTEM.USER_MANAGEMENT}/${id}`]);
    }

    export() {
        this._exportRepo.exportUser(this.criteria)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
                (errors: any) => {
                },
                () => { }
            );
    }



}
