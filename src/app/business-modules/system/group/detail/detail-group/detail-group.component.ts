import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SystemRepo } from '@repositories';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfirmPopupComponent } from '@common';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { Group, UserGroup } from '@models';

import { AppForm } from 'src/app/app.form';

import { catchError, finalize, tap } from 'rxjs/operators';
import { PreviousRouteService } from 'src/app/shared/services/previous-route';
import { RoutingConstants } from '@constants';
import { checkShareSystemUserLevel, IShareSystemState, SystemLoadUserLevelAction } from '../../../store';


@Component({
    selector: 'app-detail-group',
    templateUrl: './detail-group.component.html',
})
export class GroupDetailComponent extends AppForm implements OnInit {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    formGroup: FormGroup;
    types: CommonInterface.ICommonTitleValue[] = [
        { title: 'Active', value: true },
        { title: 'Inactive', value: false },
    ];
    groupId: number = 0;
    departments: any[] = [];
    code: AbstractControl;
    groupNameEN: AbstractControl;
    groupNameVN: AbstractControl;
    groupNameAbbr: AbstractControl;
    department: AbstractControl;
    officeName: AbstractControl;
    companyName: AbstractControl;
    email: AbstractControl;
    active: AbstractControl;
    group: Group = null;
    userHeaders: CommonInterface.IHeaderTable[];
    userGroup: UserGroup = new UserGroup();
    allUsers: any[] = null;
    previousUrl: string;

    constructor(private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _fb: FormBuilder,
        private _activedRouter: ActivatedRoute,
        private _toastService: ToastrService,
        private _location: Location,
        private _store: Store<IShareSystemState>,
        private previousRouteService: PreviousRouteService,
        private router: Router
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.previousUrl = this.previousRouteService.getPreviousUrl();
    }

    ngOnInit() {
        this.getUsers();
        this.initForm();
        this._activedRouter.params.subscribe((param: Params) => {
            if (param.id) {
                this.groupId = Number(param.id);
                this.getDepartments();
                this.userHeaders = [
                    { title: 'User Name', field: 'userName', sortable: true },
                    { title: 'Full Name', field: 'employeeName', sortable: true },
                    { title: 'Position', field: 'position', sortable: true },
                    { title: 'Permission', field: 'permission', sortable: true },
                    { title: 'Level Permission', field: 'levelPermission', sortable: true },
                    { title: 'Status', field: 'active', sortable: true }
                ];
            }
        });
        this.isReadonly = this._store.select(checkShareSystemUserLevel);
    }

    getGroupDetail(groupId: number) {
        this._systemRepo.getDetailGroup(groupId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res != null) {
                        this.group = res;
                        this._store.dispatch(new SystemLoadUserLevelAction({ companyId: this.group.companyId, officeId: this.group.officeId, departmentId: this.group.departmentId, groupId: this.group.id, type: 'group' }));

                        this.setValueFormGroup(res);
                    } else {
                        this.router.navigate([`${RoutingConstants.SYSTEM.GROUP}`]);
                        this.formGroup.reset();
                    }
                });
    }

    setValueFormGroup(res: any) {
        this.formGroup.setValue({
            code: res.code,
            groupNameEN: res.nameEn,
            groupNameVN: res.nameVn,
            groupNameAbbr: res.shortName,
            department: this.departments.filter(i => i.id === res.departmentId)[0] || null,
            active: this.types.filter(i => i.value === res.active)[0] || [],
            companyName: res.companyName,
            officeName: res.officeName,
            email: res.email
        });
    }

    initForm() {
        this.formGroup = this._fb.group({
            code: ['', Validators.compose([
                Validators.required,
            ])],
            groupNameEN: ['', Validators.compose([
                Validators.required,
            ])],
            groupNameVN: ['', Validators.compose([
                Validators.required,
            ])],
            groupNameAbbr: ['', Validators.compose([
                Validators.required,
            ])],
            department: ['', Validators.compose([
                Validators.required
            ])],
            officeName: [{ value: '', disabled: true }, Validators.compose([
                Validators.required
            ])],
            companyName: [{ value: '', disabled: true }, Validators.compose([
                Validators.required
            ])],
            email: ['',
                Validators.compose([
                    Validators.maxLength(150)
                ])],
            active: [this.types[0], Validators.compose([
                Validators.required
            ])],
        });

        this.code = this.formGroup.controls['code'];
        this.groupNameEN = this.formGroup.controls['groupNameEN'];
        this.groupNameVN = this.formGroup.controls['groupNameVN'];
        this.groupNameAbbr = this.formGroup.controls['groupNameAbbr'];
        this.department = this.formGroup.controls['department'];
        this.officeName = this.formGroup.controls['officeName'];
        this.companyName = this.formGroup.controls['companyName'];
        this.email = this.formGroup.controls['email'];
        this.active = this.formGroup.controls['active'];
    }

    getDepartments() {
        this._systemRepo.getAllDepartment()
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; })
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.departments = res;
                        this.getGroupDetail(this.groupId);
                    }
                },
            );
    }

    cancel() {
        this.router.navigate([`${RoutingConstants.SYSTEM.GROUP}`]);

    }

    update() {
        this.isSubmitted = true;
        if (this.formGroup.valid) {
            this._progressRef.start();
            const body: any = {
                id: this.group.id,
                code: this.code.value,
                nameEn: this.groupNameEN.value,
                nameVn: this.groupNameVN.value,
                shortName: this.groupNameAbbr.value,
                departmentId: this.department.value.id,
                active: this.active.value.value,
                userCreated: this.group.userCreated,
                datetimeCreated: this.group.datetimeCreated,
                userModified: this.group.userModified,
                datetimeModified: this.group.datetimeModified,
                email: this.email.value
            };
            this._systemRepo.updateGroup(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        this.getGroupDetail(this.groupId);
                        this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }
    }

    getUsers() {
        this._systemRepo.getListSystemUser()
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                })
            )
            .subscribe(
                (res: any) => {
                    this.allUsers = res;
                },
            );
    }

    confirmDelete(item) {
        this.userGroup = item;
        this.confirmDeletePopup.show();
    }

    onDeleteGroup() {
        this.confirmDeletePopup.hide();
        this.deleteUserGroup(this.userGroup.id);
    }

    deleteUserGroup(id: number) {
        this._progressRef.start();
        this._systemRepo.deleteUserGroup(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }
}
