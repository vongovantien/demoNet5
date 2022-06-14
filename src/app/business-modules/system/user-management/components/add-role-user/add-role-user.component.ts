import { Component, Input, ViewChild } from '@angular/core';
import { Company, Office, PermissionSample } from '@models';
import { SystemRepo } from '@repositories';
import { finalize, catchError, switchMap, tap } from 'rxjs/operators';
import { AppList } from 'src/app/app.list';
import cloneDeep from 'lodash/cloneDeep';
import { ConfirmPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RoutingConstants, SystemConstants } from '@constants';
import { DataService } from '@services';
@Component({
    selector: 'add-role-user',
    templateUrl: 'add-role-user.component.html'
})

export class AddRoleUserComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    companies: Company[] = [];
    listRoles: PermissionSample[] = [];
    offices: Office[] = [];
    roles: any[] = [];
    officeData: Office[] = [];
    idRole: string = '';
    isSubmitted: boolean = false;
    idOffice: string = '';
    listRolesTemp: PermissionSample[] = [];
    id: string = '';

    constructor(
        private _systemRepo: SystemRepo,
        protected _toastService: ToastrService,
        private _progressService: NgProgress,
        private _router: Router,
        private _activedRouter: ActivatedRoute,
        private _dataService: DataService

    ) {
        super();
        this._progressRef = this._progressService.ref();
    }
    ngOnInit() {
        this._activedRouter.params.subscribe((param: Params) => {
            if (param.id) {
                this.id = param.id;
            }
        });
        this.headers = [
            { title: 'Role Name', field: 'name', required: true },
            { title: 'Company', field: '', required: true },
            { title: 'Office', field: 'officeId', required: true },
        ];
        this.getDataCombobox();
        this.getCompanies();
        this.getOffices();

        if (!!this.id) {
            this.getPermissionsByUserId();
        }

        this._dataService.currentMessage.subscribe(
            (v) => {
                this.getCompanies();
                this.getOffices();
            }
        );
    }

    getDataCombobox() {
        this._systemRepo.getComboboxPermission()
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.roles = res;
                },
            );
    }

    getCompanies() {
        this._systemRepo.getListCompaniesByUserId(this.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.companies = res;
                },
            );
    }

    getOffices() {
        this._systemRepo.getListOfficesByUserId(this.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.officeData = res;
                    this.listRoles.forEach(item => {
                        item.offices = res;
                    });
                },
            );
    }

    cancelSave() {
        this.listRoles = this.listRoles.filter(x => !!x.id);
    }

    getPermissionsByUserId() {
        this._systemRepo.getListPermissionsByUserId(this.id).pipe(
            catchError(this.catchError),
            finalize(() => { this.isLoading = false; }),
            tap((roles: any) => this.listRoles = roles),
            switchMap((listRole: any) => this._systemRepo.getListOfficesByUserId(this.id))
        ).subscribe(
            (res: any) => {
                if (!!res) {
                    this.officeData = res;
                    this.listRoles.forEach(i => {
                        i.offices = res;
                    });
                    setTimeout(() => {
                        this.listRoles.forEach(item => {
                            item.offices.forEach(i => {
                                if (item.buid === i.buid) {
                                    item.offices = this.officeData.filter(x => x.buid === item.buid);
                                }
                            });
                        });
                    }, 300);


                    this.listRolesTemp = this.listRoles;
                }
            },
        );
    }

    selectedCompany(id: string, item: any) {
        item.offices = cloneDeep(this.officeData.filter(x => x.buid === id));
        item.buid = id;
        item.officeId = null;
        this.checkDupAll();
    }

    selectedRole(item: any, id: string) {
        item.permissionSampleId = id;
        this.checkDupAll();
    }

    selectedOffice(item: PermissionSample, id: string) {
        item.officeId = id;
        this.checkDupAll();
    }

    checkOffice(id: string) {
        let dupOffice: boolean = false;
        this.idOffice = id;
        for (const role of this.listRoles) {
            if (
                role.officeId === this.idOffice
            ) {
                dupOffice = true;
                break;
            }
        }
        return dupOffice;
    }

    addNewLine() {
        const psm = new PermissionSample();
        psm.offices = this.officeData;
        psm.buid = !!this.companies.length ? this.companies[0].id : null;
        psm.offices = cloneDeep(this.officeData.filter(x => x.buid === psm.buid));
        psm.officeId = !!psm.offices.length ? psm.offices[0].id : null;

        this.listRoles.push(psm);
    }

    deleteRole(index: number, id: string) {
        if (id !== "" && id !== null) {
            this.idRole = id;
            this.confirmDeletePopup.show();

        } else {
            this.listRoles.splice(index, 1);
            this.checkDupAll();
        }
    }

    onDeleteRole() {
        if (this.idRole !== null && this.idRole !== "") {
            this.confirmDeletePopup.hide();
            this._progressRef.start();
            this._systemRepo.deleteRole(this.idRole)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                ).subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this.getPermissionsByUserId();
                        } else {
                            this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                        }
                    },
                );
        }
    }

    saveRole() {
        this.isSubmitted = true;
        if (!this.listRoles.length) {
            this._toastService.warning("Please add role");
            return;
        }
        if (!this.checkValidate()) {
            return;
        }
        this.listRoles.forEach(item => {
            item.userId = this.id;
            if (!item.id) {
                item.id = SystemConstants.EMPTY_GUID;
            }
        });
        this.addRoleToUser(this.listRoles);
    }

    addRoleToUser(role: PermissionSample[]) {
        this._progressRef.start();
        this._systemRepo.addRoleToUser(role)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getPermissionsByUserId();
                    } else {
                        if (!!res.data) {
                            this._toastService.error(res.message);
                            if (!!res.data && !!res.data.length) {
                                console.log(res.data);
                                res.data.forEach(item => {
                                    this.listRoles.forEach(element => {
                                        if (item.officeId === element.officeId
                                        ) {
                                            element.isDup = true;
                                        } else {
                                            element.isDup = false;
                                        }
                                    });
                                });
                            }
                        }
                    }
                }
            );
    }

    checkValidate() {
        let valid: boolean = true;
        for (const userlv of this.listRoles) {
            if (
                userlv.permissionSampleId === null
                || userlv.officeId === null
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    checkDup(roles: PermissionSample[], id: string[], idOffice: string[]) {
        roles.forEach(element => {
            id.forEach(item => {
                if (element.permissionSampleId === item) {
                    element.isDup = true;
                } else {
                    element.isDup = false;
                }
            });
            idOffice.forEach(item => {
                if (element.officeId === item) {
                    element.isDup = true;
                } else {
                    element.isDup = false;
                }
            });
        });
        console.log(roles);
    }

    checkDupAll() {
        const object = {};
        const objecto = {};
        const objectc = {};

        const id: string[] = [];
        const ido: string[] = [];
        const idc: string[] = [];

        const officeArr: string[] = [];
        const companyArr: string[] = [];

        this.listRoles.forEach(element => {

            officeArr.push(element.officeId);
            companyArr.push(element.buid);

        });

        this.listRoles.forEach(function (item) {
            if (!object[item.permissionSampleId]) {
                object[item.permissionSampleId] = 0;

            }
            object[item.permissionSampleId] += 1;
        });

        for (const prop in object) {
            if (object[prop] >= 2) {
                id.push(prop);
            }
        }

        officeArr.forEach(function (item) {
            if (!objecto[item]) {
                objecto[item] = 0;

            }
            objecto[item] += 1;
        });

        for (const prop in objecto) {
            if (objecto[prop] >= 2) {
                ido.push(prop);
            }
        }
        companyArr.forEach(function (item) {
            if (!objectc[item]) {
                objectc[item] = 0;

            }
            objectc[item] += 1;
        });

        for (const prop in objectc) {
            if (objectc[prop] >= 2) {
                idc.push(prop);
            }
        }

        if (id.length > 0) {
            id.forEach(item => {
                this.listRoles.forEach((element) => {

                    if (element.permissionSampleId === item && ido.includes(element.officeId) && idc.includes(element.buid)
                    ) {
                        element.isDup = true;
                    } else {
                        element.isDup = false;
                    }
                });
            });
            let count = 0;
            this.listRoles.forEach(element => {
                if (element.isDup) {
                    count++;
                }
                if (count === 1) {
                    element.isDup = false;
                }
            });

            if (count > 1) {
                id.forEach(item => {
                    this.listRoles.forEach((element) => {
                        if (element.permissionSampleId === item && ido.includes(element.officeId) && idc.includes(element.buid)
                        ) {
                            element.isDup = true;
                        } else {
                            element.isDup = false;
                        }
                    });
                });
            }
        } else {
            this.listRoles.forEach(element => {
                element.isDup = false;
            });
        }
    }

    gotoUserPermission(id: string) {
        const type = 'user';
        this._router.navigate([`${RoutingConstants.SYSTEM.USER_MANAGEMENT}/${this.id}/permission/${id}/${type}`]);
    }

}
