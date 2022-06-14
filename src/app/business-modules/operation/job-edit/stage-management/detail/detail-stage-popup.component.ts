import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl, Validators, FormControl } from "@angular/forms";
import { formatDate } from "@angular/common";
import { ToastrService } from "ngx-toastr";

import { PopupBase } from "@app";
import { SystemRepo, OperationRepo } from "@repositories";
import { User, Stage } from "@models";

import { takeUntil, catchError, finalize } from "rxjs/operators";

@Component({
    selector: "detail-stage-popup",
    templateUrl: "./detail-stage-popup.component.html",
    styleUrls: ['./detail-stage-popup.component.scss']
})
export class OpsModuleStageManagementDetailComponent extends PopupBase implements OnInit, OnChanges {

    @Input() data: Stage = null;
    @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();

    form: FormGroup;
    stageName: AbstractControl;
    processTime: AbstractControl;
    description: AbstractControl;
    comment: AbstractControl;
    departmentName: AbstractControl;
    mainPersonInCharge: AbstractControl;
    realPersonInCharge: AbstractControl;
    status: AbstractControl;

    deadLineDate: AbstractControl;

    statusStage: string[] = ['InSchedule', 'Processing', 'Done', 'Overdued', 'Pending', 'Deleted'];

    systemUsers: User[];
    displayFields: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'UserName' },
        { field: 'employeeNameEn', label: 'FullName' },
    ];

    isSummited: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _operationRepo: OperationRepo,
        private _toaster: ToastrService,
        private _systemRepo: SystemRepo
    ) {
        super();
        this.initForm();
    }

    ngOnChanges() {
        if (!!this.data) {
            this.initFormUpdate();
        }
    }

    ngOnInit() {
        this.getListSystemUser();
    }

    initForm() {
        this.form = this._fb.group({
            'stageName': [{ value: '', disabled: true }, Validators.compose([
                Validators.required,
            ])],
            'processTime': [, Validators.compose([
                Validators.min(1)
            ])],
            'departmentName': [{ value: '', disabled: true }, Validators.compose([
                Validators.required,
            ])],
            'description': [''],
            'comment': [''],
            'deadLineDate': [{
                startDate: null,
                endDate: null
            }],
            mainPersonInCharge: [null, Validators.required],
            realPersonInCharge: [null],
            'status': [this.statusStage[0]]

        });
        this.stageName = this.form.controls['stageName'];
        this.processTime = this.form.controls['processTime'];
        this.description = this.form.controls['description'];
        this.comment = this.form.controls['comment'];
        this.departmentName = this.form.controls['departmentName'];
        this.deadLineDate = this.form.controls['deadLineDate'];
        this.mainPersonInCharge = this.form.controls['mainPersonInCharge'];
        this.realPersonInCharge = this.form.controls['realPersonInCharge'];
        this.status = this.form.controls['status'];
    }

    initFormUpdate() {
        this.form.setValue({
            stageName: this.data.stageNameEN,
            comment: this.data.comment || '',
            departmentName: this.data.departmentName,
            description: this.data.description || '',
            processTime: this.data.processTime,
            deadLineDate: !!this.data.deadline ? { startDate: new Date(this.data.deadline), endDate: new Date(this.data.deadline) } : null,
            mainPersonInCharge: this.data.mainPersonInCharge,
            realPersonInCharge: this.data.realPersonInCharge,
            status: this.data.status
        });

    }
    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'mainPersonInCharge':
                this.mainPersonInCharge.setValue(data.id);
                break;
            case 'realPersonInCharge':
                this.realPersonInCharge.setValue(data.id);
                break;
            default:
                break;
        }
    }
    onSubmit(form: FormGroup) {
        this.isSummited = true;
        if (form.invalid) {
            return;
        }
        if ((form.value.status === 'Pending' || form.value.status === "Deleted") && !form.value.comment) {
            return;
        }

        const body = {
            id: this.data.id,
            jobId: this.data.jobId,
            stageId: this.data.stageId,
            name: this.data.name,
            orderNumberProcessed: this.data.orderNumberProcessed,
            mainPersonInCharge: this.mainPersonInCharge.value || "admin",
            realPersonInCharge: this.realPersonInCharge.value,
            processTime: form.value.processTime,
            comment: form.value.comment,
            description: form.value.description,
            deadline: !!form.value.deadLineDate.startDate ? formatDate(form.value.deadLineDate.startDate, 'yyyy-MM-ddTHH:mm', 'en') : null,
            status: form.value.status
        };
        this._operationRepo.updateStageToJob(body).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
            finalize(() => { }),
        ).subscribe(
            (res: any) => {
                if (!res.status) {
                    this._toaster.error(res.message);
                } else {
                    this.onSuccess.emit();
                    this._toaster.success(res.message);
                    this.hide();
                }
            },
        );
    }

    getListSystemUser() {
        this._systemRepo.getListSystemUser().pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
            finalize(() => { }),
        ).subscribe(
            (res: any[]) => {
                if (!res) {
                } else {
                    this.systemUsers = res;
                }
            },
        )
    }

    onCancel() {
        this.isSummited = false;
        this.hide();
    }
    resetFormControl(control: FormControl | AbstractControl) {
        if (!!control && control instanceof FormControl) {
            control.setValue(null);
            control.markAsUntouched({ onlySelf: true });
            control.markAsPristine({ onlySelf: true });
        }
    }
}