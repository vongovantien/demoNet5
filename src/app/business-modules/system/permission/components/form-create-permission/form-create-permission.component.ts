import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { PermissionFormSearchComponent } from '../form-search-permission/form-search-permission.component';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { SystemRepo } from 'src/app/shared/repositories';
import { Role } from 'src/app/shared/models';
import { Router } from '@angular/router';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'form-create-permission',
    templateUrl: './form-create-permission.component.html',
})
export class PermissionFormCreateComponent extends PermissionFormSearchComponent {
    @ViewChild(ConfirmPopupComponent) popupConfirmSave: ConfirmPopupComponent;

    @Output() onSubmit: EventEmitter<IFormCreatePermission> = new EventEmitter<IFormCreatePermission>();
    formCreate: FormGroup;
    types: CommonInterface.IValueDisplay[];

    permissionName: AbstractControl;
    role: AbstractControl;

    roleList: Role[] = new Array<Role>();

    constructor(
        protected _fb: FormBuilder,
        protected _systemRepo: SystemRepo,
        private _router: Router
    ) {
        super(_fb, _systemRepo);
    }

    ngOnInit(): void {
        this.types = [
            { displayName: 'Standard', value: 'Standard' },
            { displayName: 'User', value: 'User' },
        ];

        this.initFormCreate();
        this.getSystemRole();

    }



    initFormCreate() {
        this.formCreate = this._fb.group({
            permissionName: ['', Validators.required],
            role: [],
            type: [],
            status: [],
        });

        this.permissionName = this.formCreate.controls["permissionName"];
        this.role = this.formCreate.controls["role"];

        this.formCreate.controls['type'].setValue(this.types[0]);
        this.formCreate.controls['status'].setValue(this.statuss[0]);

    }

    showConfirm(form: FormGroup) {
        this.isSubmitted = true;
        if (!!form && form.valid && !!this.role.value) {
            this.popupConfirmSave.show();
        }
    }

    onSaveSubmitForm(form: FormGroup) {
        this.popupConfirmSave.hide();
        const body: IFormCreatePermission = {
            roleName: form.value.permissionName,
            name: form.value.permissionName,
            roleId: !!form.value.role ? form.value.role.id : null,
            active: form.value.status.value,
            type: form.value.type.value

        };
        this.onSubmit.emit(body);
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.SYSTEM.PERMISSION}`]);
    }
}

interface IFormCreatePermission {
    roleName: string;
    name: string;
    type: string;
    roleId: any;
    active: boolean;
}
