import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';

import { SystemFileManageRepo, SystemRepo } from '@repositories';
import { catchError, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { RoutingConstants, SystemConstants } from '@constants';
import { AppForm } from '../app.form';
import { environment } from 'src/environments/environment';
import { GlobalState } from '../global-state';
import { Employee, Bank, UserLevel } from '@models';
import * as fromShare from '../business-modules/share-business/store';
import UUID from 'validator/lib/isUUID';


declare var $: any;
import { GetCatalogueBankAction, getCatalogueBankState, UpdateCurrentUser } from '@store';
@Component({
    selector: 'user-profile-page',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfilePageComponent extends AppForm {
    @ViewChild('image') el: ElementRef;

    currentUserId: string;

    formUser: FormGroup;
    employeeNameVn: AbstractControl;
    employeeNameEn: AbstractControl;
    title: AbstractControl;
    email: AbstractControl;
    bankAccountNo: AbstractControl;
    bankName: AbstractControl;
    tel: AbstractControl;
    description: AbstractControl;
    staffCode: AbstractControl;
    username: AbstractControl;
    workingStatus: AbstractControl;
    creditLimit: AbstractControl;
    creditRate: AbstractControl;
    personalId: AbstractControl;

    photoUrl: string;
    banks: Observable<Bank[]>;
    bankCode: AbstractControl;

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Bank Code' },
        { field: 'bankNameEn', label: 'Bank Name EN' },
    ];

    headersuslv: CommonInterface.IHeaderTable[] = [
        { title: '', field: 'isDefault' },
        { title: 'Group Name', field: 'groupName' },
        { title: 'Company', field: 'companyName' },
        { title: 'Office', field: 'officeName' },
        { title: 'Department', field: 'departmentName' },
        { title: 'Position', field: 'position' },

    ];

    selectedUserLevel: UserLevel;

    userLevels: UserLevel[] = [];

    constructor(
        private _ngProgressService: NgProgress,
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _systemFileManageRepo: SystemFileManageRepo,
        private _activedRoute: ActivatedRoute,
        private _toastService: ToastrService,
        private _zone: NgZone,
        private _globalState: GlobalState,
        private _store: Store<any>,
        private _router: Router,

    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this.initForm();
        this._store.dispatch(new GetCatalogueBankAction());

        this.banks = this._store.select(getCatalogueBankState);

        this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    if (p.id && UUID(p.id)) {
                        return p.id;
                    }
                    return null;
                }),
                tap(id => this.currentUserId = id),
                switchMap((id) => this._systemRepo.getDetailUser(id))
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        console.log(res.data);
                        this.setUserForForm(res.data);
                    }
                }
            );

            this.getListUserLevelByUserId();
    }

    ngAfterViewInit() {
        this.initImageLibary();
    }

    initImageLibary() {
        let selectImg = null;
        this._zone.runOutsideAngular(() => {
            $(this.el.nativeElement).froalaEditor({
                requestWithCORS: true,
                language: 'vi',
                imageEditButtons: ['imageReplace'],
                imageMaxSize: 5 * 1024 * 1024,
                imageAllowedTypes: ['jpeg', 'jpg', 'png'],
                requestHeaders: {
                    Authorization: `Bearer ${localStorage.getItem(SystemConstants.ACCESS_TOKEN)}`,
                    Module: 'User', // thu muc anh chua anh cua user.
                    ObjectId: `${this.currentUserId}`,
                },
                imageUploadURL: `//${environment.HOST.FILE_SYSTEM}/api/v1/en-US/AWSS3/UploadImages/System/User/${this.currentUserId}`,
                imageUploadMethod: 'PUT',
                imageManagerLoadURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/User?userId=${this.currentUserId}`,
                imageManagerDeleteURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/Delete`,
                imageManagerDeleteMethod: 'DELETE',
                imageManagerDeleteParams: { id: selectImg?.id }
            }).on('froalaEditor.contentChanged', (e: any) => {
                this.photoUrl = e.target.src;
            }).on('froalaEditor.imageManager.imageDeleted', (e, editor, data) => {
                if (e.error) {
                    this._toastService.error("Xóa thất bại");
                } else
                    this._toastService.success("Xóa thành công");


            }).on('froalaEditor.image.error', (e, editor, error, response) => {
                console.log(error);
                switch (error.code) {
                    case 5:
                        this._toastService.error("Size image invalid");
                        break;
                    case 6:
                        this._toastService.error("Image invalid");
                        break;
                    default:
                        this._toastService.error(error.message);
                        break;
                }
            })
        });
    }

    initForm() {
        this.formUser = this._fb.group({
            employeeNameVn: ['',
                Validators.compose([
                    Validators.required
                ])],
            employeeNameEn: ['',
                Validators.compose([
                    Validators.required
                ])],
            title: [],
            email: ['',
                Validators.compose([
                    Validators.required, Validators.pattern(SystemConstants.CPATTERN.EMAIL)
                ])],
            bankAccountNo: [],
            bankName: [],
            tel: [],
            description: [],

            // view only
            staffCode: [],
            username: [],
            workingStatus: [],
            creditLimit: [],
            creditRate: [],
            personalId: [],
            bankCode: [{ value: null, disabled: true }],
        });
        //
        this.employeeNameVn = this.formUser.controls['employeeNameVn'];
        this.employeeNameEn = this.formUser.controls['employeeNameEn'];
        this.title = this.formUser.controls['title'];
        this.email = this.formUser.controls['email'];
        this.bankAccountNo = this.formUser.controls['bankAccountNo'];
        this.bankName = this.formUser.controls['bankName'];
        this.tel = this.formUser.controls['tel'];
        this.description = this.formUser.controls['description'];

        // view only
        this.staffCode = this.formUser.controls['staffCode'];
        this.username = this.formUser.controls['username'];
        this.workingStatus = this.formUser.controls['workingStatus'];
        this.creditLimit = this.formUser.controls['creditLimit'];
        this.creditRate = this.formUser.controls['creditRate'];
        this.personalId = this.formUser.controls['personalId'];
        this.bankCode = this.formUser.controls['bankCode'];
    }

    setUserForForm(body: any) {
        this.formUser.patchValue({
            employeeNameVn: body.employeeNameVn,
            employeeNameEn: !!body.sysEmployeeModel ? body.sysEmployeeModel.employeeNameEn : null,
            title: !!body.sysEmployeeModel ? body.sysEmployeeModel.title : null,
            email: !!body.sysEmployeeModel ? body.sysEmployeeModel.email : null,
            bankAccountNo: !!body.sysEmployeeModel ? body.sysEmployeeModel.bankAccountNo : null,
            bankName: !!body.sysEmployeeModel ? body.sysEmployeeModel.bankName : null,
            tel: !!body.sysEmployeeModel ? body.sysEmployeeModel.tel : null,
            description: body.description,
            staffCode: !!body.sysEmployeeModel ? body.sysEmployeeModel.staffCode : null,
            username: body.username,
            workingStatus: body.workingStatus,
            creditLimit: body.creditLimit,
            creditRate: body.creditRate,
            personalId: !!body.sysEmployeeModel ? body.sysEmployeeModel.personalId : null,
            bankCode: !!body.sysEmployeeModel ? body.sysEmployeeModel.bankCode : null
        });
        this.photoUrl = body.avatar;
    }
    handleUpdateUser() {
        const form = this.formUser.getRawValue();
        if (this.formUser.invalid) {
            return;
        }
        const body = {
            employeeNameVn: form.employeeNameVn,
            employeeNameEn: form.employeeNameEn,
            title: !form.title ? '' : form.title,
            email: form.email,
            bankAccountNo: !form.bankAccountNo ? '' : form.bankAccountNo,
            bankName: !form.bankName ? '' : form.bankName,
            tel: !form.tel ? '' : form.tel,
            description: !form.description ? '' : form.description,
            avatar: this.photoUrl,
            personalId: form.personalId,
            bankCode: form.bankCode,
        };
        this.onUpdate(body);
    }

    onUpdate(body: any) {
        this._progressRef.start();
        this._systemRepo.updateProfile(body)
            .pipe(catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this.updateStoreUser(body);
                    this._toastService.success("Upload profile successful");
                    this._globalState.notifyDataChanged('profile', res.data as Employee);
                } else {
                    this._toastService.error("Upload profile fail");
                }
            });
    }
    onSelectDataFormInfo(data: any) {
        if (data) {
            this.bankName.setValue(data.bankNameEn);
            this.bankCode.setValue(data.code);
        }
    }

    // Update value changes on user profile to store
    updateStoreUser(body: any) {
        const user = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        user.email = body.email;
        user.phone_number = body.tel;
        user.nameEn = body.employeeNameEn;
        user.nameVn = body.employeeNameVn;
        user.bankAccountNo = body.bankAccountNo;
        user.bankName = body.bankName;
        user.bankCode = body.bankCode;
        this._store.dispatch(UpdateCurrentUser(user));
        this.saveUserLevel();
    }

    getListUserLevelByUserId() {
        this._systemRepo.getListUserLevelByUserId(this.currentUserId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.userLevels = res;
                    }
                },
            );
    }

    onSelectUserLevel(item: UserLevel) {
        this.selectedUserLevel = item;
        this.userLevels.forEach(x=>x.isDefault=false);
        item.isDefault=true;
    }

    cancel() {
        this._router.navigate(['/home/dashboard']);
    }

    saveUserLevel() {
        if (!!this.selectedUserLevel) {
            this.selectedUserLevel.isDefault = true;
            this._systemRepo.setdefaultUserLeve(this.selectedUserLevel.id)
                .subscribe(
                    (res: any) => {
                        console.log(res);
                        if (res.status) {
                            this._toastService.success(res.message);
                            this.getListUserLevelByUserId();
                        }
                    }
                )
        }
    }
}
