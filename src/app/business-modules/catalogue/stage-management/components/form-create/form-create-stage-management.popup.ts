import { Component, EventEmitter, Output } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { FormBuilder, FormGroup, AbstractControl, Validators } from "@angular/forms";
import { CatalogueRepo, SystemRepo } from "src/app/shared/repositories";
import { ToastrService } from "ngx-toastr";
import { catchError } from "rxjs/operators";
import { StageModel } from "src/app/shared/models/catalogue/stage.model";

@Component({
    selector: 'form-create-stage-management-popup',
    templateUrl: './form-create-stage-management.popup.html'
})

export class StageManagementAddPopupComponent extends PopupBase {
    @Output() onRequestStage: EventEmitter<any> = new EventEmitter<any>();

    formStage: FormGroup;
    stageManagement: StageModel = new StageModel();

    isSubmited: boolean = false;
    action: string = 'create';

    listDepartment: any[] = [];
    departmentActive: any[] = [];

    stageCode: AbstractControl;
    stageNameEn: AbstractControl;
    stageNameVn: AbstractControl;
    stageDepartment: AbstractControl;
    stageActive: AbstractControl;
    stageDescriptionVn: AbstractControl;
    stageDescriptionEn: AbstractControl;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.getDepartments();
    }

    initForm() {
        this.formStage = this._fb.group({
            stageCode: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(50)
                ])
            ],
            stageNameEn: ['',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(6)
                ])
            ],
            stageNameVn: ['',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(6)
                ])
            ],
            stageDepartment: [null,
                Validators.compose([
                    Validators.required
                ])
            ],
            stageActive: [''],
            stageDescriptionVn: [''],
            stageDescriptionEn: [''],
        });

        this.stageCode = this.formStage.controls['stageCode'];
        this.stageNameEn = this.formStage.controls['stageNameEn'];
        this.stageNameVn = this.formStage.controls['stageNameVn'];
        this.stageDepartment = this.formStage.controls['stageDepartment'];
        this.stageActive = this.formStage.controls['stageActive'];
        this.stageDescriptionVn = this.formStage.controls['stageDescriptionVn'];
        this.stageDescriptionEn = this.formStage.controls['stageDescriptionEn'];
    }

    getDepartments() {
        this._systemRepo.getAllDepartment()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    this.listDepartment = data.map(x => ({ "text": x.code, "id": x.id }));
                },
            );
    }

    saveStage() {
        this.isSubmited = true;
        if (this.formStage.valid) {
            const _stage: StageModel = {
                id: this.stageManagement.id,
                code: this.stageCode.value,
                stageNameVn: this.stageNameVn.value,
                stageNameEn: this.stageNameEn.value,
                departmentId: this.stageDepartment.value.id,
                descriptionVn: this.stageDescriptionVn.value,
                descriptionEn: this.stageDescriptionEn.value,
                userCreated: this.stageManagement.userCreated,
                datetimeCreated: this.stageManagement.datetimeCreated,
                userModified: this.stageManagement.userModified,
                datetimeModified: this.stageManagement.datetimeModified,
                active: this.stageActive.value,
                inactiveOn: this.stageManagement.inactiveOn,
                deptName: ''
            };
            console.log(_stage);
            if (this.action == "create") {
                this._catalogueRepo.addNewStage(_stage)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestStage.emit();
                                this.closePopup();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            } else {
                this._catalogueRepo.updateStage(_stage)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestStage.emit();
                                this.closePopup();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            }
        }
    }

    getDetail() {
        this.formStage.setValue({
            stageCode: this.stageManagement.code,
            stageNameEn: this.stageManagement.stageNameEn,
            stageNameVn: this.stageManagement.stageNameVn,
            stageDepartment: { id: this.stageManagement.departmentId, text: this.listDepartment.find(x => x.id === this.stageManagement.departmentId).text },
            stageActive: this.stageManagement.active,
            stageDescriptionVn: this.stageManagement.descriptionVn,
            stageDescriptionEn: this.stageManagement.descriptionEn
        });
    }

    closePopup() {
        this.hide();
        this.isSubmited = false;
        this.stageManagement = new StageModel();
        this.formStage.reset();
    }

}