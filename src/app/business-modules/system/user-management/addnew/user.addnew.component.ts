import { Component, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { FormAddUserComponent } from '../components/form-add-user/form-add-user.component';
import { Employee } from 'src/app/shared/models/system/employee';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { finalize, catchError } from 'rxjs/operators';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-user.addnew',
    templateUrl: './user.addnew.component.html'
})
export class UserAddNewComponent extends AppPage {

    @ViewChild(FormAddUserComponent) formAdd: FormAddUserComponent;

    constructor(
        private _progressService: NgProgress,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router) {
        super();
        this._progressRef = this._progressService.ref();
    }
    ngOnInit() {
    }

    create() {
        this.formAdd.isSubmited = true;
        if (this.formAdd.formGroup.valid) {
            this._progressRef.start();
            const body: IAddUser = {
                sysEmployeeModel: {
                    id: '',
                    employeeNameEn: this.formAdd.employeeNameEn.value,
                    employeeNameVn: this.formAdd.employeeNameVn.value,
                    tel: this.formAdd.phone.value,
                    email: this.formAdd.email.value,
                    title: this.formAdd.title.value,
                    staffCode: this.formAdd.staffcode.value,
                    personalId: this.formAdd.personalId.value
                },
                username: this.formAdd.username.value,
                userType: this.formAdd.usertype.value.value,
                workingStatus: this.formAdd.workingg.value.value,
                isLdap: this.formAdd.ldap.value,
                active: this.formAdd.active.value.value,
                description: this.formAdd.description.value,
                //
                creditLimit: this.formAdd.creditLimit.value,
                creditRate: this.formAdd.creditRate.value,
                userRole: this.formAdd.userRole.value.value,

            };

            this._systemRepo.addNewUser(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this._router.navigate([`${RoutingConstants.SYSTEM.USER_MANAGEMENT}/${res.data}`]);
                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }
    }
}


export interface IAddUser {
    sysEmployeeModel: Partial<Employee>;
    username: string;
    userType: string;
    workingStatus: string;
    isLdap: boolean;
    active: boolean;
    description: string;
    //
    creditLimit: number;
    creditRate: number;
    userRole: string;
}
