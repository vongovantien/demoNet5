import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SystemRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize, tap, switchMap } from 'rxjs/operators';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Department } from 'src/app/shared/models/system/department';
import { Group } from 'src/app/shared/models/system/group';
import { SortService } from 'src/app/shared/services';
import { AppList } from 'src/app/app.list';
import { SystemLoadUserLevelAction, IShareSystemState, checkShareSystemUserLevel } from './../../store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RoutingConstants } from '@constants';
import { environment } from 'src/environments/environment';
import { ConfirmPopupComponent } from '@common';
import { EmailSetting } from '@models';
import { DepartmentEmailComponent } from '../email/email-department.component';

declare var $: any;
@Component({
    selector: 'app-department-detail',
    templateUrl: './detail-department.component.html',
    styleUrls: ['./../department.component.scss']
})

export class DepartmentDetailComponent extends AppList {
    @ViewChild('image') el: ElementRef;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(DepartmentEmailComponent)
    departmentEmailComponent:DepartmentEmailComponent;
    
    formDetail: FormGroup;
    departmentCode: AbstractControl;
    nameEn: AbstractControl;
    nameLocal: AbstractControl;
    nameAbbr: AbstractControl;
    office: AbstractControl;
    company: AbstractControl;
    status: AbstractControl;
    email: AbstractControl;
    departmentType: AbstractControl;

    officeList: any[] = [];
    departmentTypeList: any[] = [];

    isSubmited: boolean = false;

    departmentId: number = 0;
    department: Department;

    grpHeaders: CommonInterface.IHeaderTable[];
    userHeaders: CommonInterface.IHeaderTable[];
    emailHeaders: CommonInterface.IHeaderTable[];

    groups: Group[] = [];
    SelectedDepartment: any;
    photoUrl: string = '';

    emailSettings: EmailSetting[] = [];
    selectedEmail: EmailSetting;

    isReadonly: Observable<boolean>;

    constructor(
        private _activedRouter: ActivatedRoute,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _fb: FormBuilder,
        private _progressService: NgProgress,
        private _sortService: SortService,
        private _store: Store<IShareSystemState>,
        private _zone: NgZone
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortGroup;
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: Params) => {
            if (param.id) {
                this.departmentId = param.id;
                this.initForm();
                this.getDetail();
                this.getGroupsByDeptId(this.departmentId);

                this.grpHeaders = [
                    { title: 'Group Code', field: 'code', sortable: true },
                    { title: 'Name EN', field: 'nameEn', sortable: true },
                    { title: 'Name Local', field: 'nameVn', sortable: true },
                    { title: 'Name Abbr', field: 'shortName', sortable: true },
                    { title: 'Status', field: 'active', sortable: true },
                ];
                this.userHeaders = [
                    { title: 'User Name', field: 'userName', sortable: true },
                    { title: 'Full Name', field: 'fullName', sortable: true },
                    { title: 'Position', field: 'position', sortable: true },
                    { title: 'Permission', field: 'permission', sortable: true },
                    { title: 'Level Permission', field: 'levelPermission', sortable: true },
                    { title: 'Status', field: 'active', sortable: true },
                ];
                this.emailHeaders = [
                    { title: "Action", field: "action", sortable: false },
                    {
                        title: "Email Type",
                        field: "emailType",
                        sortable: false,
                    },
                    {
                        title: "Email Info",
                        field: "emailInfo",
                        sortable: false,
                    },
                    {
                        title: "Modified Date",
                        field: "modifiedDate",
                        sortable: false,
                    },
                    {
                        title: "Create Date",
                        field: "createDate",
                        sortable: false,
                    },
                ];

            }
        });
        this.isReadonly = this._store.select(checkShareSystemUserLevel);
    }

    ngAfterViewInit() {
        this.initImageLibary();
    }

    initForm() {
        this.formDetail = this._fb.group({
            departmentCode: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(50)
                ])
            ],
            nameEn: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            nameLocal: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            nameAbbr: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            office: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            email: [],
            company: [],
            status: [],
            departmentType: []
        });

        this.departmentCode = this.formDetail.controls['departmentCode'];
        this.nameEn = this.formDetail.controls['nameEn'];
        this.nameLocal = this.formDetail.controls['nameLocal'];
        this.nameAbbr = this.formDetail.controls['nameAbbr'];
        this.office = this.formDetail.controls['office'];
        this.company = this.formDetail.controls['company'];
        this.email = this.formDetail.controls['email'];
        this.status = this.formDetail.controls['status'];
        this.departmentType = this.formDetail.controls['departmentType'];
    }

    updateDepartment() {
        this.isSubmited = true;
        if (this.formDetail.valid) {
            const dept: Department = {
                id: this.departmentId,
                code: this.departmentCode.value,
                deptName: this.nameLocal.value,
                deptNameEn: this.nameEn.value,
                deptNameAbbr: this.nameAbbr.value,
                branchId: this.office.value,
                officeName: '',
                companyName: '',
                deptType: this.departmentType.value,
                email: this.email.value,
                userCreated: '',
                datetimeCreated: '',
                userModified: '',
                datetimeModified: '',
                active: this.status.value,
                inactiveOn: '',
                companyId: null,
                userNameCreated: '',
                userNameModified: '',
                signPath: this.photoUrl
            };

            this._progressRef.start();
            // Update Info Department
            this._systemRepo.updateDepartment(dept)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this.getDetail();
                        } else {
                            this._toastService.error(res.message);
                        }

                    }
                );
        }
    }

    back() {
        this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}`]);
    }

    getDetail() {
        this._progressRef.start();
        this._systemRepo.getAllOffice()
            .pipe(
                catchError(this.catchError),
                tap(data => {
                    this.officeList = data.map((item: any) => ({ "id": item.id, "text": item.shortName }));
                    this.getDeptTypes();
                }),
                switchMap(() => this._systemRepo.getDetailDepartment(this.departmentId).pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        this._progressRef.complete();
                    }), tap(data => {
                        this.SelectedDepartment = data;
                    })
                ))
            )
            .subscribe(
                (res: any) => {
                    if (res.id !== 0) {
                        this.department = new Department(res);
                        this._store.dispatch(new SystemLoadUserLevelAction({ companyId: this.department.companyId, officeId: this.department.branchId, departmentId: this.department.id, type: 'department' }));

                        this.formDetail.setValue({
                            departmentCode: res.code,
                            nameEn: res.deptNameEn,
                            nameLocal: res.deptName,
                            nameAbbr: res.deptNameAbbr,
                            office: res.branchId,
                            company: res.companyName,
                            status: res.active,
                            departmentType: res.deptType,
                            email: res.email
                        });
                        this.photoUrl = res.signPath;

                    } else {
                        // Reset 
                        this.formDetail.reset();
                        this._toastService.error("Not found data");
                    }
                },
            );
    }

    getGroupsByDeptId(id: number) {
        this._systemRepo.getGroupsByDeptId(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (data: any) => {
                    this.groups = data;
                },
            );
    }

    sortGroup(sort: string): void {
        this.groups = this._sortService.sort(this.groups, sort, this.order);
    }

    gotoDetailGroup(id: number) {
        this._router.navigate([`${RoutingConstants.SYSTEM.GROUP}/${id}`]);
    }

    getDeptTypes() {
        this._systemRepo.getListDeptType()
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (data: any) => {
                    this.departmentTypeList = data.map((item: any) => ({ id: item.value, text: item.displayName }));
                },
            );
    }

    getEmailByDeptId() {
        this._systemRepo
            .getListEmailSettingByDeptID(this.departmentId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe((data: any) => {
                this.emailSettings = data;
            });
    }

    showDeletePopup(emailSetting: EmailSetting) {
        this.selectedEmail = emailSetting;
        this.confirmDeletePopup.show();
    }

    onDeleteEmail() {
        this.confirmDeletePopup.hide();
        this.deleteEmailSetting(this.selectedEmail.id);
    }

    deleteEmailSetting(id: number) {
        this._progressRef.start();
        this._systemRepo
            .deleteEmailSetting(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.isLoading = false;
                    this._progressRef.complete();
                })
            )
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(res.message, "");
                    this.getEmailByDeptId();
                } else {
                    this._toastService.error(
                        res.message || "Có lỗi xảy ra",
                        ""
                    );
                }
            });
    }

    initImageLibary() {
        let selectImg = null;
        this._zone.run(() => {
            $(this.el.nativeElement).froalaEditor({
                requestWithCORS: true,
                language: 'vi',
                imageEditButtons: ['imageReplace'],
                imageMaxSize: 5 * 1024 * 1024,
                imageAllowedTypes: ['jpeg', 'jpg', 'png'],
                requestHeaders: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    Module: 'Department'
                },
                imageUploadURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/image`,
                imageManagerLoadURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/Department`,
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
                        this._toastService.error("Your image must under 5MB!");
                        break;
                    case 6:
                        this._toastService.error("Image invalid");
                        break;
                    default:
                        this._toastService.error(error.message);
                        break;
                }
            });
        });
    }
}


