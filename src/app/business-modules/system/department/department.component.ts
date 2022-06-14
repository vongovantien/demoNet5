import { Component, ViewChild } from '@angular/core';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { Router } from '@angular/router';
import { AppList } from 'src/app/app.list';
import { SystemRepo, ExportRepo } from 'src/app/shared/repositories';
import { Department } from 'src/app/shared/models/system/department';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize, map } from 'rxjs/operators';
import { SortService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { RoutingConstants, SystemConstants } from '@constants';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-department',
    templateUrl: './department.component.html',
})
export class DepartmentComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    headers: CommonInterface.IHeaderTable[];

    departments: Department[] = [];

    selectedDepartment: Department;

    constructor(private _router: Router,
        private _systemRepo: SystemRepo,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchDepartment;
        this.requestSort = this.sortDepartment;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Department Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'deptNameEn', sortable: true },
            { title: 'Name Local', field: 'deptName', sortable: true },
            { title: 'Name Abbr', field: 'deptNameAbbr', sortable: true },
            { title: 'Office', field: 'officeName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.dataSearch = {
            type: 'All'
        };
        this.searchDepartment(this.dataSearch);
    }

    showDeletePopup(department: Department) {
        this.selectedDepartment = department;
        this.confirmDeletePopup.show();
    }

    onSearchDepartment(data: any) {
        this.page = 1; // reset page.
        this.searchDepartment(data);
    }

    searchDepartment(dataSearch?: any) {
        this._progressRef.start();
        this._systemRepo.getDepartment(this.page, this.pageSize, Object.assign({}, dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new Department(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.departments = res.data;
                },
            );
    }

    gotoDetailDepartment(id: number) {
        this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}/${id}`]);
    }

    sortDepartment(sort: string): void {
        this.departments = this._sortService.sort(this.departments, sort, this.order);
    }

    onDeleteDepartment() {
        this.confirmDeletePopup.hide();
        this.deleteDepartment(this.selectedDepartment.id);
    }

    deleteDepartment(id: number) {
        this._progressRef.start();
        this._systemRepo.deleteDepartment(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchDepartment(this.dataSearch);
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    export() {
        this._exportRepo.exportDepartment(this.dataSearch)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
                (errors: any) => {
                    console.log(errors);
                },
                () => { }
            );
    }
}
