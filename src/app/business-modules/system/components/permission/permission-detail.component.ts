import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { PermissionSample, PermissionSampleGeneral, PermissionGeneralItem } from 'src/app/shared/models';
import { AppPage } from 'src/app/app.base';
import { ConfirmPopupComponent } from '@common';
import { PermissionFormCreateComponent } from 'src/app/business-modules/system/permission/components/form-create-permission/form-create-permission.component';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'detail-permission',
    templateUrl: './permission-detail.component.html',
    styleUrls: ['./../../../system/permission/add/add-permission.component.scss']
})
export class ShareSystemDetailPermissionComponent extends AppPage {
    @ViewChild(PermissionFormCreateComponent) formCreateComponent: PermissionFormCreateComponent;
    @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
    @ViewChild('stickyMenu') menuElement: ElementRef;

    permissionId: string = '';

    levelPermissions: string[];

    permissionSample: PermissionSample;

    type: string = '';
    userId: string = '';
    id: string = '';
    ids: string = '';
    idUserPermission: string = '';

    menuPosition: number = 0;
    isSticky: boolean = false;

    @HostListener('window:scroll', ['$event'])
    handleScroll() {
        const windowScroll = window.pageYOffset;
        if (windowScroll + 70 >= this.menuPosition + 42) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }
    constructor(
        protected _systemRepo: SystemRepo,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        private _activedRouter: ActivatedRoute,
        protected _router: Router,


    ) {
        super();
        // super(_systemRepo, _progressService, _toastService, _router);
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
        this.levelPermissions = [
            'None', 'Owner', 'Group', 'Department', 'Office', 'Company', 'All'
        ];
        this._activedRouter.params
            .pipe(
                tap((param: Params) => {
                    if (param.id) {
                        this.permissionId = param.id;
                    }
                    if (param.type) {
                        if (param.type === "user") {
                            this.userId = param.id;
                        }
                        if (param.type === "office") {
                            this.id = param.id;
                            this.userId = param.uid;
                        }
                        if (param.type === "company" || param.type === "department" || param.type === "group") {
                            this.id = param.ido;
                            this.userId = param.uid;
                        }

                        this.idUserPermission = param.permissionId;
                        this.permissionId = '';
                        console.log(param.type);
                        this.type = param.type;
                        // this.userId = param.idu;
                        console.log('userid here', this.userId);
                        // this.id = param.ido;
                        this.ids = param.id;
                        //this.idUserPermission = param.ido;
                    }
                }),
                switchMap(() =>
                    this.type === 'office' || this.type === 'group' || this.type === 'department' || this.type === 'company' ? this._systemRepo.getUserPermission(this.userId, this.id, 'office')
                        : this.type === 'user' ? this._systemRepo.getUserPermission(null, this.idUserPermission, 'user')
                            : this._systemRepo.getPermissionSample(this.permissionId)
                                .pipe(catchError(this.catchError))
                )
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.permissionSample = new PermissionSample(res);
                        console.log(this.permissionSample);
                        if (this.type !== 'office' && this.type !== 'user' && this.type !== 'group' && this.type !== 'department' && this.type !== 'company') {
                            setTimeout(() => {
                                this.formCreateComponent.formCreate.setValue({
                                    permissionName: this.permissionSample.name,
                                    role: this.formCreateComponent.roles.filter(role => role.id === this.permissionSample.roleId)[0],
                                    type: this.formCreateComponent.types.filter(type => type.value === this.permissionSample.type)[0],
                                    status: this.formCreateComponent.statuss.filter(status => status.value === this.permissionSample.active)[0],
                                });

                            }, 100);
                        }
                    } else {
                        this.permissionSample = new PermissionSample();
                    }
                }
            );
    }

    ngAfterViewInit() {
        this.menuPosition = this.menuElement.nativeElement.offsetTop;
    }

    updateUsersPermission() {
        this._progressRef.start();
        this._systemRepo.updateUsersPermission(this.permissionSample)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * get detail
                        if (this.type === 'office' || this.type === 'group' || this.type === 'department' || this.type === 'company') {
                            this._systemRepo.getUserPermission(this.userId, this.id, this.type)
                                .subscribe(
                                    (result: any) => {
                                        if (!!result) {
                                            this.permissionSample = new PermissionSample(result);
                                        }
                                    }
                                );
                        } else if (this.type === 'user') {
                            this._systemRepo.getUserPermission(null, this.idUserPermission, this.type)
                                .subscribe(
                                    (result: any) => {
                                        if (!!result) {
                                            this.permissionSample = new PermissionSample(result);
                                        }
                                    }
                                );
                        }

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    updatePermission(formDataCreate: { roleName: string; name: string; type: string; roleId: any; active: boolean }) {
        this.updatePermissionModel(formDataCreate);
        this._progressRef.start();
        this._systemRepo.updatePermissionGeneral(this.permissionSample)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * get detail
                        this._systemRepo.getPermissionSample(this.permissionId)
                            .subscribe(
                                (res: any) => {
                                    this.permissionSample = new PermissionSample(res);
                                }
                            )
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onSavePermissionSample() {
        this.confirmPopup.hide();
        if (this.type === 'office' || this.type === 'user' || this.type === 'deparment' || this.type === 'company' || this.type === 'group') {
            this.updateUsersPermission();
        } else {
            this.formCreateComponent.isSubmitted = true;
            if (this.formCreateComponent.formCreate.valid && !!this.formCreateComponent.role.value) {
                const body: any = {
                    roleName: this.formCreateComponent.formCreate.value.permissionName,
                    name: this.formCreateComponent.formCreate.value.permissionName,
                    roleId: !!this.formCreateComponent.formCreate.value.role ? this.formCreateComponent.formCreate.value.role.id : null,
                    active: this.formCreateComponent.formCreate.value.status.value,
                    type: this.formCreateComponent.formCreate.value.type.value

                };
                this.updatePermission(body);
            }
        }
    }

    showConfirm() {
        this.confirmPopup.show();
    }

    updatePermissionModel(formDataCreate: { roleName: string; name: string; type: string; roleId: any; active: boolean }) {
        this.permissionSample.active = formDataCreate.active;
        this.permissionSample.roleId = formDataCreate.roleId;
        this.permissionSample.roleName = formDataCreate.roleName;
        this.permissionSample.name = formDataCreate.roleName;
        this.permissionSample.type = formDataCreate.type;
    }

    backToDetail() {
        if (this.type === 'office') {
            this._router.navigate([`${RoutingConstants.SYSTEM.OFFICE}/${this.id}`]);
        } else if (this.type === 'user') {
            this._router.navigate([`${RoutingConstants.SYSTEM.USER_MANAGEMENT}/${this.userId}`]);
        } else if (this.type === 'group') {
            this._router.navigate([`${RoutingConstants.SYSTEM.GROUP}/${this.ids}`]);
        } else if (this.type === 'department') {
            this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}/${this.ids}`]);
        } else if (this.type === 'company') {
            this._router.navigate([`${RoutingConstants.SYSTEM.COMPANY}/${this.ids}`]);
        } else {
            this._router.navigate([`${RoutingConstants.SYSTEM.PERMISSION}`]);
        }
    }

    onChangeQuickSetup(data: string | boolean, type: string, permissionModuleGroup: PermissionSampleGeneral) {
        switch (type) {
            case 'access':
                permissionModuleGroup.sysPermissionGenerals.forEach((p: PermissionGeneralItem) => p.access = data as boolean);
                break;
            default:
                permissionModuleGroup.sysPermissionGenerals.forEach((p: PermissionGeneralItem) => p.access && (p[type] = data));
                break;
        }
    }



}
