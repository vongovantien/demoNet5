import { Component, OnInit } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { SystemRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { finalize, catchError } from 'rxjs/operators';
import { UserLevel } from 'src/app/shared/models/system/userlevel';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-form-add-user',
    templateUrl: './form-add-user.component.html'
})
export class FormAddUserComponent extends AppList {
    formGroup: FormGroup;
    isSubmited: boolean = false;
    isDetail: boolean = false;
    SelectedUser: any = {};
    staffcode: AbstractControl;
    username: AbstractControl;
    employeeNameVn: AbstractControl;
    employeeNameEn: AbstractControl;
    title: AbstractControl;
    active: AbstractControl;
    usertype: AbstractControl;
    workingg: AbstractControl;
    email: AbstractControl;
    phone: AbstractControl;
    description: AbstractControl;
    ldap: AbstractControl;
    personalId: AbstractControl;
    userLevels: UserLevel[] = [];
    headersuslv: CommonInterface.IHeaderTable[];
    //
    creditLimit: AbstractControl;
    creditRate: AbstractControl;
    userRole: AbstractControl;

    status: CommonInterface.ICommonTitleValue[] = [
        { title: 'Active', value: true },
        { title: 'Inactive', value: false },
    ];

    usertypes: CommonInterface.ICommonTitleValue[] = [
        { title: 'Normal User', value: 'Normal User' },
        { title: 'Local Admin', value: 'Local Admin' },
        { title: 'Super Admin', value: 'Super Admin' }
    ];

    working: CommonInterface.ICommonTitleValue[] = [
        { title: 'Working', value: 'Working' },
        { title: 'Maternity leave', value: 'Maternity leave' },
        { title: 'Off', value: 'Off' }
    ];

    userRoles: CommonInterface.ICommonTitleValue[] = [
        {
            "title": "CS Document",
            "value": "CS"
        },
        {
            "title": "Sale",
            "value": "Sale"
        },
        {
            "title": "Accountant",
            "value": "FIN"
        },
        {
            "title": "Internal Audit",
            "value": "IA"
        },
        {
            "title": "Account Receivable",
            "value": "AR"
        },
        {
            "title": "BOD",
            "value": "BOD"
        }
    ];

    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress,

    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    initForm() {
        this.formGroup = this._fb.group({
            staffcode: ['',
                Validators.compose([
                    Validators.required
                ])],
            username: ['',
                Validators.compose([
                    Validators.required
                ])],
            employeeNameVn: ['',
                Validators.compose([
                    Validators.required
                ])],
            employeeNameEn: ['',
                Validators.compose([
                    Validators.required
                ])],
            title: [],
            usertype: [this.usertypes[0]],
            active: [this.status[0]],
            workingg: [this.working[0]],
            email: ['', Validators.compose([
                Validators.required,
                Validators.pattern(SystemConstants.CPATTERN.EMAIL),
            ])],
            phone: [],
            description: [],
            ldap: [true],
            //
            creditLimit: [],
            creditRate: [],
            personalId: [],
            userRole: [this.userRoles[0],
            Validators.compose([
                Validators.required
            ])]
        });

        this.staffcode = this.formGroup.controls['staffcode'];
        this.username = this.formGroup.controls['username'];
        this.employeeNameVn = this.formGroup.controls['employeeNameVn'];
        this.employeeNameEn = this.formGroup.controls['employeeNameEn'];
        this.title = this.formGroup.controls['title'];
        this.usertype = this.formGroup.controls['usertype'];
        this.active = this.formGroup.controls['active'];
        this.email = this.formGroup.controls['email'];
        this.phone = this.formGroup.controls['phone'];
        this.description = this.formGroup.controls['description'];
        this.ldap = this.formGroup.controls['ldap'];
        this.workingg = this.formGroup.controls['workingg'];
        //
        this.creditLimit = this.formGroup.controls['creditLimit'];
        this.creditRate = this.formGroup.controls['creditRate'];
        this.personalId = this.formGroup.controls['personalId'];
        this.userRole = this.formGroup.controls['userRole'];

    }

    ngOnInit() {
        this.initForm();
        this.headersuslv = [
            { title: 'Group Name', field: 'groupName' },
            { title: 'Company', field: 'companyName' },
            { title: 'Office', field: 'officeName' },
            { title: 'Department', field: 'departmentName' },
            { title: 'Position', field: 'position' },
        ];

    }



    resetPassword(id: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.resetPasswordUser(id)
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
