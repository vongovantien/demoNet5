import { Component, ViewChild } from '@angular/core';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { PagingService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { NgProgressComponent, NgProgress } from '@ngx-progressbar/core';
import { SystemConstants } from 'src/constants/system.const';
import { AppList } from 'src/app/app.list';
import { User } from 'src/app/shared/models';
import { Employee } from 'src/app/shared/models/system/employee';
import { AppPaginationComponent, InfoPopupComponent } from 'src/app/shared/common';
import { SystemRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-user-management-import',
    templateUrl: './user-management-import.component.html',
})
export class UserManagementImportComponent extends AppList {
    @ViewChild(InfoPopupComponent) importAlert: InfoPopupComponent;
    constructor(
        private pagingService: PagingService,
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService) {
        super();
        this._progressRef = this._progressService.ref();

    }
    data: any[];
    pagedItems: any[] = [];
    inValidItems: any[] = [];
    sysUser: User[] = [];
    totalValidRows: number = 0;
    totalRows: number = 0;
    isShowInvalid: boolean = true;
    pager: PagerSetting = PAGINGSETTING;
    inProgress: boolean = false;
    headers: CommonInterface.IHeaderTable[];
    @ViewChild(AppPaginationComponent) child;
    @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;

    isDesc = true;
    sortKey: string;


    ngOnInit() {
        this.headers = [
            { title: 'No', field: 'no', width: 100 },
            { title: 'Staff Code', field: 'staffCode', sortable: true },
            { title: 'User Name', field: 'username', sortable: true },
            { title: 'Full Name', field: 'employeeNameEn', sortable: true },
            { title: 'Name EN', field: 'employeeNameEn', sortable: true },
            { title: 'Title', field: 'title', sortable: true },
            { title: 'User Type', field: 'userType', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
            { title: 'Working Status', field: 'workingstatus', sortable: true },
            { title: 'Email', field: 'email', sortable: true },
            { title: 'Phone Number', field: 'tel', sortable: true },
            { title: 'Description', field: 'description', sortable: true },
            { title: 'User Role', field: 'userRole', sortable: true }
        ];
    }

    resetBeforeSelecedFile() {
        this.pager.currentPage = 1;
        this.pager.totalItems = 0;
        this.totalRows = this.totalValidRows = 0;
        this.pagedItems = [];
        this.isShowInvalid = true;
    }

    chooseFile(file: Event) {
        this.pager.totalItems = 0;
        if (file.target['files'] == null) { return; }
        this._progressRef.start();
        this._systemRepo.upLoadUserFile(file.target['files'])
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe((response: any) => {
                this.data = response.data;
                this.pager.totalItems = this.data.length;
                this.totalValidRows = response.totalValidRows;
                this.totalRows = this.data.length;
                this.pager.currentPage = 1;
                this.pagingData(this.data);
            }, () => {
            });
    }

    pagingData(data: any[]) {
        this.pager = this.pagingService.getPager(data.length, this.pager.currentPage, this.pager.pageSize);
        this.pager.numberPageDisplay = SystemConstants.OPTIONS_NUMBERPAGES_DISPLAY;
        this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
        this.pagedItems = data.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    downloadSample() {
        this._systemRepo.downloadUserExcel()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, "User-Import.xlsx");
                },
            );
    }

    setPage(pager: PagerSetting) {
        this.pager.currentPage = pager.currentPage;
        this.pager.pageSize = pager.pageSize;
        this.pager.totalPages = pager.totalPages;

        if (this.isShowInvalid) {
            this.pagingData(this.data);
        } else {
            this.pagingData(this.inValidItems);
        }
    }


    hideInvalid() {
        if (this.data == null || this.data == undefined) return;
        this.isShowInvalid = !this.isShowInvalid;
        this.sortKey = '';
        if (this.isShowInvalid) {
            this.pager.totalItems = this.data.length;
            this.pagingData(this.data);
        } else {
            this.inValidItems = this.data.filter(x => !x.isValid);
            this.pager.totalItems = this.inValidItems.length;
            this.setPage(this.pager);
        }

        this.pager.currentPage = 1;
        if (this.inValidItems.length > 0) {
            this.child.setPage(this.pager.currentPage);
        }
    }

    import(element) {
        if (this.data == null) { return; }
        if (this.totalRows - this.totalValidRows > 0) {
            this.importAlert.show();
        } else {
            const data = this.data.filter(x => x.isValid);
            this._progressRef.start();
            this._systemRepo.importUser(data)
                .pipe(
                    finalize(() => {
                        this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res) => {
                        if (res) {
                            this._toastService.success(res.message);
                            this.pager.totalItems = 0;
                            this.reset(element);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    reset(element) {
        this.data = null;
        this.pagedItems = null;
        this.pager.totalItems = 0;
        element.value = "";
        this.totalRows = this.totalValidRows = 0;
    }
}
export interface IAddUser {
    sysEmployeeModel: Employee;
    username: string;
    userType: string;
    workingStatus: string;
    isLdap: boolean;
    active: boolean;
}
