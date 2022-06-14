import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { SystemRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Department } from 'src/app/shared/models/system/department';
import { AppForm } from 'src/app/app.form';
import { RoutingConstants } from '@constants';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
    selector: 'app-department-new',
    templateUrl: './add-department.component.html',
    styleUrls: ['./../department.component.scss']
})

export class DepartmentAddNewComponent extends AppForm {
    @ViewChild('image') el: ElementRef;
    
    formAdd: FormGroup;
    departmentCode: AbstractControl;
    nameEn: AbstractControl;
    nameLocal: AbstractControl;
    nameAbbr: AbstractControl;
    office: AbstractControl;
    email: AbstractControl;
    status: AbstractControl;
    departmentType: AbstractControl;

    officeList: any[] = [];
    departmentTypeList: any[] = [];

    isSubmited: boolean = false;
    photoUrl: string = '';

    constructor(
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _fb: FormBuilder,
        private _zone: NgZone
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initDataInform();
        this.initForm();
    }

    initForm() {
        this.formAdd = this._fb.group({
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
            status: [],
            departmentType: []
        });

        this.departmentCode = this.formAdd.controls['departmentCode'];
        this.nameEn = this.formAdd.controls['nameEn'];
        this.nameLocal = this.formAdd.controls['nameLocal'];
        this.nameAbbr = this.formAdd.controls['nameAbbr'];
        this.office = this.formAdd.controls['office'];
        this.email = this.formAdd.controls['email'];
        this.status = this.formAdd.controls['status'];
        this.departmentType = this.formAdd.controls['departmentType'];

        this.status.setValue(true);
    }

    initDataInform() {
        this.getOffices();
        this.getDeptTypes();
    }

    saveDepartment() {
        [this.departmentType].forEach((control: AbstractControl) => this.setError(control));
        this.isSubmited = true;
        if (this.formAdd.valid) {
            const dept: Department = {
                id: 0,
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
            // Add new Department
            this._systemRepo.addNewDepartment(dept)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}/${res.data.id}`]);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    getOffices() {
        this._systemRepo.getAllOffice()
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (data: any) => {
                    this.officeList = data.map((item: any) => ({ "id": item.id, "text": item.shortName }));
                },
            );
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
                    this.departmentType.setValue(this.departmentTypeList[1].id);
                },
            );
    }

    back() {
        this._router.navigate([`${RoutingConstants.SYSTEM.DEPARTMENT}`]);
    }

    ngAfterViewInit() {
        this.initImageLibary();
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


