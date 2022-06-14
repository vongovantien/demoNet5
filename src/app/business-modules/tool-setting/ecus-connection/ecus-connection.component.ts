import { Component, OnInit, ViewChild } from '@angular/core';

import { AppList } from 'src/app/app.list';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { OperationRepo } from '@repositories';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { SortService } from '@services';
import { CommonEnum } from '@enums';
import { EcusConnection } from '@models';

import { EcusConnectionFormPopupComponent } from './form-ecus/form-ecus.component';

import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-ecus-connection',
    templateUrl: './ecus-connection.component.html',
})
export class EcusConnectionComponent extends AppList implements OnInit {

    @ViewChild(EcusConnectionFormPopupComponent) formEcus: EcusConnectionFormPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    EcusConnections: EcusConnection[] = [];

    SearchFields: CommonInterface.ISearchOption[] = [
        { fieldName: 'name', displayName: 'Name' },
        { fieldName: 'username', displayName: 'User Name' },
        { fieldName: 'serverName', displayName: 'Server Name' },
        { fieldName: 'dbname', displayName: 'Database Name' }
    ];

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: this.SearchFields,
        typeSearch: CommonEnum.TypeSearch.outtab
    };

    indexConnectToDelete: number = -1;

    constructor(
        private _toastService: ToastrService,
        private _ngProgessService: NgProgress,
        private _operationRepo: OperationRepo,
        private sortService: SortService) {
        super();

        this.requestSort = this.sortEcus;
        this.requestList = this.getEcusConnections;
        this._progressRef = this._ngProgessService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Name', field: 'name', sortable: true },
            { title: 'User Name', field: 'username', sortable: true },
            { title: 'Full Name', field: 'fullname', sortable: true },
            { title: 'Server Name', field: 'serverName', sortable: true },
            { title: 'DB Name', field: 'dbName', sortable: true },
            { title: 'Status', field: 'inactive', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
        ];

        this.getEcusConnections({});
    }

    onSearch(event: { field: string; searchString: any; }) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.page = 1;
        this.getEcusConnections(this.dataSearch);
    }

    resetSearch() {
        this.dataSearch = {};
        this.page = 1;
        this.getEcusConnections(this.dataSearch);
    }

    showFormAdd() {
        this.formEcus.title = 'Add new Ecus Connection';
        this.formEcus.formGroup.reset();
        this.formEcus.userCreatedName = null;
        this.formEcus.userModifiedName = null;
        this.formEcus.datetimeCreated = null;
        this.formEcus.datetimeModified = null;
        this.formEcus.isShowUpdate = false;
        this.formEcus.isAllowUpdate = true;
        this.formEcus.active.setValue(false);
        this.formEcus.show();
    }

    getEcusConnections(dataSearch: any) {
        this._progressRef.start();
        this.isLoading = true;
        this._operationRepo.getListEcus(this.page, this.pageSize, Object.assign({}, dataSearch))
            .pipe(
                finalize(() => { this._progressRef.complete(); this.isLoading = false; })
            ).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    if (!!res) {
                        this.totalItems = res.totalItems;
                        this.EcusConnections = res.data || [];
                        console.log(this.EcusConnections);
                    }
                }
            );
    }

    getEcusConnectionDetails(id: number) {
        this._progressRef.start();
        this._operationRepo.checkDetailPermissionEcus(id)
            .pipe(
                finalize(() => { this._progressRef.complete(); this.confirmDeletePopup.hide(); })
            )
            .subscribe(
                (response: boolean) => {
                    if (!response) {
                        this.permissionPopup.show();
                    } else {
                        this._operationRepo.getDetailEcus(id)
                            .pipe()
                            .subscribe(
                                (res: EcusConnection) => {
                                    if (!!res) {

                                        this.formEcus.formGroup.patchValue(res);
                                        this.formEcus.title = 'Detail/Edit Connection';

                                        this.formEcus.datetimeCreated = res.datetimeCreated;
                                        this.formEcus.userCreatedName = res.userCreatedName;
                                        this.formEcus.datetimeModified = res.datetimeModified;
                                        this.formEcus.userModifiedName = res.userModifiedName;
                                        this.formEcus.userCreated = res.userCreated;

                                        this.formEcus.isShowUpdate = true;

                                        this.formEcus.companyId = res.companyId;
                                        this.formEcus.officeId = res.officeId;
                                        this.formEcus.departmentId = res.departmentId;
                                        this.formEcus.groupId = res.groupId;

                                        this.formEcus.isAllowUpdate = res.permission.allowUpdate;
                                        this.formEcus.show();
                                    }
                                }
                            );
                    }
                }
            );
    }

    sortEcus() {
        this.EcusConnections = this.sortService.sort(this.EcusConnections, this.sort, this.order);
    }

    deleteEcus(ecus: EcusConnection) {
        this._progressRef.start();
        this._operationRepo.checkDeletePermissionEcus(ecus.id)
            .pipe(
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: boolean) => {
                    if (!res) {
                        this.permissionPopup.show();
                    } else {
                        this.indexConnectToDelete = ecus.id;
                        this.confirmDeletePopup.show();
                    }
                }
            );
    }

    onDeleteEcus() {
        this._progressRef.start();
        this._operationRepo.deleteEcus(this.indexConnectToDelete)
            .pipe(
                finalize(() => { this._progressRef.complete(); this.confirmDeletePopup.hide(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.resetSearch();
                    } else {
                        this._toastService.error(res.message);
                    }
                });
    }

}
