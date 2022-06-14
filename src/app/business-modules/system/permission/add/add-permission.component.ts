import { Component, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { PermissionSample } from 'src/app/shared/models';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { PermissionFormCreateComponent } from '../components/form-create-permission/form-create-permission.component';
import { Router } from '@angular/router';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-create-permission',
    templateUrl: './add-permission.component.html',
    styleUrls: ['./add-permission.component.scss']
})
export class PermissionCreateComponent extends AppForm {
    @ViewChild(PermissionFormCreateComponent) formCreateComponent: PermissionFormCreateComponent;
    @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;

    permissionSample: PermissionSample = new PermissionSample();

    levelPermissions: string[];
    data: boolean = false;
    constructor(
        protected _systemRepo: SystemRepo,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        protected _router: Router

    ) {
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit(): void {
        this.levelPermissions = [
            'Owner', 'Group', 'Department', 'Office', 'Company', 'All'
        ];

        this.getPermissionSample();
    }

    getPermissionSample(id?: string) {
        this._progressRef.start();
        this._systemRepo.getPermissionSample(id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    this.permissionSample = new PermissionSample(res);
                    console.log(this.permissionSample);
                }
            );
    }

    onSavePermissionSample() {
        this.confirmPopup.hide();

        this.formCreateComponent.isSubmitted = true;
        if (this.formCreateComponent.formCreate.valid && !!this.formCreateComponent.role.value) {
            const body: any = {
                roleName: this.formCreateComponent.formCreate.value.permissionName,
                name: this.formCreateComponent.formCreate.value.permissionName,
                roleId: !!this.formCreateComponent.formCreate.value.role ? this.formCreateComponent.formCreate.value.role.id : null,
                active: this.formCreateComponent.formCreate.value.status.value,
                type: this.formCreateComponent.formCreate.value.type.value

            };
            this.onSavePermission(body);
        }
    }

    onSavePermission(formDataCreate: { roleName: string; name: string; type: string; roleId: any; active: boolean }) {
        this._progressRef.start();

        this.updatePermissionModel(formDataCreate);

        this._systemRepo.createPermissionSample(this.permissionSample)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * reset modal
                        this.getPermissionSample();

                        // * Reset form.
                        this.formCreateComponent.isSubmitted = false;
                        // this.formCreateComponent.resetFormControl(this.formCreateComponent.permissionName);

                        // * Update default control
                        this.formCreateComponent.formCreate.controls['type'].setValue(this.formCreateComponent.types[0]);
                        this.formCreateComponent.formCreate.controls['status'].setValue(this.formCreateComponent.statuss[0]);
                        this._router.navigate([`${RoutingConstants.SYSTEM.PERMISSION}/${res.data.id}`]);

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );

    }

    updatePermissionModel(formDataCreate: { roleName: string; name: string; type: string; roleId: any; active: boolean }) {
        this.permissionSample.active = formDataCreate.active;
        this.permissionSample.roleId = formDataCreate.roleId;
        this.permissionSample.roleName = formDataCreate.roleName;
        this.permissionSample.name = formDataCreate.roleName;
        this.permissionSample.type = formDataCreate.type;
    }


    showConfirm() {
        this.confirmPopup.show();
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.SYSTEM.PERMISSION}`]);
    }

}


