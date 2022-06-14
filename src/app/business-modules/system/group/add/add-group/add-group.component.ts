import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-add-group',
    templateUrl: './add-group.component.html'
})
export class AddGroupComponent extends AppForm implements OnInit {
    formGroup: FormGroup;
    types: CommonInterface.ICommonTitleValue[] = [
        { title: 'Active', value: true },
        { title: 'Inactive', value: false },
    ];
    code: AbstractControl;
    groupNameEN: AbstractControl;
    groupNameVN: AbstractControl;
    groupNameAbbr: AbstractControl;
    department: AbstractControl;
    active: AbstractControl;
    email: AbstractControl;
    departments: any[] = [];

    constructor(protected _router: Router,
        protected _progressService: NgProgress,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _fb: FormBuilder) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.getDepartments();
        this.initForm();
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
            email: ['',
                Validators.compose([
                    Validators.maxLength(150)
                ])],
            active: [this.types[0]],
        });

        this.code = this.formGroup.controls['code'];
        this.groupNameEN = this.formGroup.controls['groupNameEN'];
        this.groupNameVN = this.formGroup.controls['groupNameVN'];
        this.groupNameAbbr = this.formGroup.controls['groupNameAbbr'];
        this.department = this.formGroup.controls['department'];
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
                    this.departments = res;
                    console.log(this.departments);
                },
            );
    }
    create() {
        this.isSubmitted = true;
        if (this.formGroup.valid) {
            this._progressRef.start();
            const body: any = {
                code: this.code.value,
                nameEn: this.groupNameEN.value,
                nameVn: this.groupNameVN.value,
                shortName: this.groupNameAbbr.value,
                departmentId: this.department.value.id,
                active: this.active.value.value,
                email: this.email.value
            };
            this._systemRepo.addNewGroup(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._router.navigate([`${RoutingConstants.SYSTEM.GROUP}/${res.data.id}`]);
                            this._toastService.success(res.message, '');
                            this.isSubmitted = false;
                            // this.initForm();
                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }
    }
    cancel() {
        this._router.navigate([`${RoutingConstants.SYSTEM.GROUP}`]);
    }
}