import { Component, ViewChild, Input } from "@angular/core";
import { Router } from "@angular/router";
import { SystemRepo } from "@repositories";
import { ConfirmPopupComponent } from "@common";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { Store } from "@ngrx/store";
import { User, UserLevel } from "@models";

import { AppList } from "src/app/app.list";

import { catchError, finalize, takeUntil } from "rxjs/operators";
import cloneDeep from "lodash/cloneDeep";
import { IShareSystemState, getShareSystemUserLevelState, SystemLoadUserLevelAction } from "../../store";
import { RoutingConstants } from "@constants";

@Component({
    selector: 'form-user-level',
    templateUrl: 'add-user.component.html',
    styleUrls: ['./add-user.component.scss']
})

export class ShareSystemAddUserComponent extends AppList {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @Input() object: any = {};
    @Input() type: string = null;

    users: User[] = [];
    headers: CommonInterface.IHeaderTable[] = [];
    positions: CommonInterface.INg2Select[];
    usersLevels: UserLevel[] = [];
    userLevelTemp: UserLevel[] = [];


    indexRemove: number = null;
    idUserLevel: number = null;

    criteria: any = {}; // * search model.

    isSubmitted: boolean = false;

    constructor(
        private _systemRepo: SystemRepo,
        protected _toastService: ToastrService,
        private _progressService: NgProgress,
        private _router: Router,
        private _store: Store<IShareSystemState>

    ) {
        super();
        this._progressRef = this._progressService.ref();

    }
    ngOnInit() {
        if (this.type === 'group') {
            this.positions = [
                { id: 'Manager-Leader', text: 'Manager-Leader' },
                { id: 'Deputy', text: 'Deputy' },
                { id: 'Assistant', text: 'Assistant' },
                { id: 'Staff', text: 'Staff' },
            ];
        } else {
            this.positions = [
                { id: 'Manager-Leader', text: 'Manager-Leader' },
                { id: 'Deputy', text: 'Deputy' },
                { id: 'Assistant', text: 'Assistant' },
            ];
        }

        this.headers = [
            { title: 'User Name', field: 'username', required: true },
            { title: 'Full Name', field: 'employeeNameVn', required: true },
            { title: 'Position', field: 'Position', required: true },
        ];
        this.getUsers();

        this._store.select(getShareSystemUserLevelState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result: UserLevel[]) => {
                    this.usersLevels = (result || []).map((lv: UserLevel) => new UserLevel(lv));
                    this.userLevelTemp = cloneDeep(this.usersLevels);
                }
            );
    }

    getUsers() {
        this._systemRepo.getListSystemUser({ active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.users = res;
                    }
                },
            );
    }

    addNewLine() {
        this.isSubmitted = true;
        this.userLevelTemp.push(new UserLevel());
    }

    cancelSave() {
        this.userLevelTemp = cloneDeep(this.usersLevels);
    }

    selectedUser(userLevel: UserLevel, currenUser: User) {
        this.isSubmitted = true;
        const object = {};
        const userId: string[] = [];

        if (!currenUser) { return; }

        userLevel.employeeName = currenUser.employeeNameVn;
        userLevel.userId = currenUser.id;

        // * check duplicate
        this.userLevelTemp.forEach(function (item) {
            if (!object[item.userId]) {
                object[item.userId] = 0;
            }
            object[item.userId] += 1;
        });

        for (const prop in object) {
            if (object[prop] >= 2) {
                userId.push(prop);
            }
        }
        if (userId.length > 0) {
            this.userLevelTemp = this.checkDup(this.userLevelTemp, userId);
        } else {
            this.userLevelTemp.forEach(i => i.isDup = false);
        }
    }

    checkDup(userLevel: UserLevel[], userId: string[]) {
        userLevel.forEach(element => {
            userId.forEach(item => {
                if (element.userId === item) {
                    element.isDup = true;
                } else {
                    element.isDup = false;
                }
            });
        });
        return userLevel;
    }

    deleteUserLevel(index: number, id: number) {
        if (id !== null && id !== 0) {
            this.idUserLevel = id;
            this.confirmDeletePopup.show();

        } else {
            this.indexRemove = index;
            this.userLevelTemp.splice(this.indexRemove, 1);
        }
    }

    onDeleteUserLevel() {
        if (this.idUserLevel !== null) {
            this.confirmDeletePopup.hide();
            this._progressRef.start();
            this._systemRepo.deleteUserLevel(this.idUserLevel)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                ).subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');

                            this.queryUserLevel();
                        } else {
                            this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                        }
                    },
                );
        }
    }

    checkValidate() {
        let valid: boolean = true;
        for (const userlv of this.userLevelTemp) {
            if (
                userlv.userId === null
                || userlv.position === null
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    saveUserLevel() {
        this.usersLevels = cloneDeep(this.userLevelTemp);
        if (!this.usersLevels.length) {
            this._toastService.warning("Please add user Level");
            return;
        }

        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }
        if (this.type === 'company') {
            this.usersLevels.forEach(item => {
                item.companyId = this.object.id;
            });
            this.addUserToCompany(this.usersLevels);
        }
        if (this.type === 'office') {
            this.usersLevels.forEach(item => {
                item.companyId = this.object.buid;
                item.officeId = this.object.id;

            });
            this.addUserToOffice(this.usersLevels);

        }
        if (this.type === 'department') {
            this.usersLevels.forEach(item => {
                item.companyId = this.object.companyId;
                item.officeId = this.object.branchId;
                item.departmentId = this.object.id;
            });
            this.addUserToDepartment(this.usersLevels);
        }
        if (this.type === 'group') {
            this.usersLevels.forEach(item => {
                item.companyId = this.object.companyId;
                item.officeId = this.object.officeId;
                item.departmentId = this.object.departmentId;
                item.groupId = this.object.id;
            });
            this.addUserToGroup(this.usersLevels);
        }
    }

    queryUserLevel() {
        if (this.type === 'company') {
            this.criteria.companyId = this.object.id;
            this.criteria.type = this.type;
        }
        if (this.type === 'office') {
            this.criteria.officeId = this.object.id;
            this.criteria.companyId = this.object.buid;
            this.criteria.type = this.type;
        }
        if (this.type === 'department') {
            this.criteria.companyId = this.object.companyId;
            this.criteria.departmentId = this.object.id;
            this.criteria.officeId = this.object.branchId;
            this.criteria.type = this.type;
        }

        if (this.type === 'group') {
            this.criteria.companyId = this.object.companyId;
            this.criteria.officeId = this.object.officeId;
            this.criteria.departmentId = this.object.departmentId;
            this.criteria.groupId = this.object.id;
            this.criteria.type = this.type;
        }
        this._store.dispatch(new SystemLoadUserLevelAction(this.criteria));
        // this._systemRepo.queryUserLevels(this.criteria).pipe(catchError(this.catchError))
        //     .subscribe(
        //         (data: any) => {
        //             if (!!data) {
        //                 this.usersLevels = data.map((lv: UserLevel) => new UserLevel(lv));
        //                 this.userLevelTemp = cloneDeep(this.usersLevels);
        //             }
        //         },
        //     );
    }

    gotoUserPermission(id: string, officeId: string) {
        if (this.type === "office") {
            this._router.navigate([`${RoutingConstants.SYSTEM.OFFICE}/${officeId}/${id}/${this.type}`]);
        }
        if (this.type === "company") {
            this._router.navigate([`${RoutingConstants.SYSTEM.COMPANY}/${this.object.id}/${officeId}/${id}/${this.type}`]);
        }
        if (this.type === "department") {
            this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}/${this.object.id}/${officeId}/${id}/${this.type}`]);
        }
        if (this.type === "group") {
            this._router.navigate([`${RoutingConstants.SYSTEM.GROUP}/${this.object.id}/${officeId}/${id}/${this.type}`]);
        }
    }

    addUserToCompany(userLevel: UserLevel[]) {
        this._progressRef.start();
        this._systemRepo.addUserToCompany(userLevel)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.queryUserLevel();
                    } else {
                        this._toastService.error(res.message);
                        if (!!res.data && !!res.data.length) {
                            this.checkDup(this.usersLevels, res.data);
                        }
                    }
                }
            );
    }

    addUserToOffice(userLevel: UserLevel[]) {
        this._progressRef.start();
        this._systemRepo.addUserToOffice(userLevel)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.queryUserLevel();
                    } else {
                        if (!!res.data) {
                            this._toastService.error(res.message);
                            if (!!res.data && !!res.data.length) {
                                this.checkDup(this.usersLevels, res.data);
                            }
                        }
                    }
                }
            );
    }

    addUserToDepartment(userLevel: UserLevel[]) {
        this._progressRef.start();
        this._systemRepo.addUserToDepartment(userLevel)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.queryUserLevel();
                    } else {
                        if (!!res.data) {
                            this._toastService.error(res.message);
                            if (!!res.data && !!res.data.length) {
                                this.checkDup(this.usersLevels, res.data);
                            }
                        }
                    }
                }
            );
    }

    addUserToGroup(userLevel: UserLevel[]) {
        this._progressRef.start();
        this._systemRepo.addUserToGroupLevel(userLevel)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.queryUserLevel();
                    } else {
                        if (!!res.data) {
                            this._toastService.error(res.message);
                            if (!!res.data && !!res.data.length) {
                                this.checkDup(this.usersLevels, res.data);
                            }
                        }
                    }
                }
            );
    }
}


