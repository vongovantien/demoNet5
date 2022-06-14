import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { UserGroup } from 'src/app/shared/models/system/userGroup.model';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SystemRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'form-user-group',
    templateUrl: './form-user-group.component.html'
})
export class FormUserGroupComponent extends PopupBase implements OnInit {
    @Input() title: string;
    @Input() userGroup: UserGroup = null;
    @Output() isSaved = new EventEmitter<boolean>();

    formGroup: FormGroup;
    isSubmitted: boolean = false;

    users: any[] = [];
    levelPemissions: any[] = [];
    positions: any[] = [];
    permissions: any[] = [];

    user: AbstractControl;

    constructor(private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formGroup = this._fb.group({
            user: ['', Validators.compose([
                Validators.required,
            ])],
            level: [''],
            position: [''],
            permission: ['']
        });
        this.user = this.formGroup.controls['user'];
    }

    setValueFormGroup(res: any) {
        if (res == null) {
            this.formGroup.setValue({
                user: '',
                level: '',
                position: '',
                permission: ''
            });
        } else {
            this.formGroup.setValue({
                user: this.users.filter(i => i.id === res.userId)[0] || null,
                level: '',
                position: '',
                permission: ''
            });
        }
    }

    save() {
        this.isSubmitted = true;
        if (this.formGroup.valid) {
            this._progressRef.start();
            const body: any = {
                id: this.userGroup.id,
                groupId: this.userGroup.groupId,
                userId: this.user.value.id
            };
            if (this.userGroup.id > 0) {
                this.updateUserGroup(body);
            } else {
                this.addUserToGroup(body);
            }
        }
    }

    updateUserGroup(body: any) {
        this._systemRepo.updateUserGroup(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.formGroup.reset();
                        this.isSubmitted = false;
                        this._toastService.success(res.message, '');
                        this.isSaved.emit(true);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    addUserToGroup(body: any) {
        this._systemRepo.addUserToGroup(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.initForm();
                        this.isSubmitted = false;
                        this._toastService.success(res.message, '');
                        this.isSaved.emit(true);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    resetForm() {
        this.hide();
        this.formGroup.reset();
        this.isSubmitted = false;

    }
}
