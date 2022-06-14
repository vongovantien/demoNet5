import { Component, ViewChild } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { NgProgress } from "@ngx-progressbar/core";
import { FormBuilder, FormGroup, AbstractControl, Validators } from "@angular/forms";
import { AppForm } from "src/app/app.form";
import { SettingRepo } from "@repositories";
import { UnlockRequestListJobComponent } from "../components/list-job-unlock-request/list-job-unlock-request.component";
import { User, SetUnlockRequestModel } from "@models";
import { RoutingConstants, SystemConstants } from "@constants";
import { CommonEnum } from "@enums";
import { catchError, finalize } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { ConfirmPopupComponent } from "@common";

@Component({
    selector: 'app-unlock-request-add',
    templateUrl: './add-unlock-request.component.html'
})

export class UnlockRequestAddNewComponent extends AppForm {
    @ViewChild(UnlockRequestListJobComponent) listJobComponent: UnlockRequestListJobComponent;
    @ViewChild('confirmCancelPopup') confirmCancelPopup: ConfirmPopupComponent;
    formAdd: FormGroup;
    subject: AbstractControl;
    requester: AbstractControl;
    unlockType: AbstractControl;
    serviceDate: AbstractControl;
    generalReason: AbstractControl;

    unlockTypeEnum: CommonEnum.UnlockTypeEnum = CommonEnum.UnlockTypeEnum.SHIPMENT;

    unlockTypeList: string[] = ['Shipment', 'Advance', 'Settlement', 'Change Service Date'];

    isSubmited: boolean = false;
    userLogged: User;
    tableDefault: string = `<table style="width: 100%;border: 1px solid #dddddd;border-collapse: collapse;"><tbody><tr><td style="width: 50%;border: 1px solid #dddddd;">JOB ID
				<br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;">CHARGE NAME
				<br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;"><span style="color: red;">CURRENT VALUE</span><br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;"><span style="color: red;">UPDATE VALUE</span><br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;"><span style="color: red;">PROFIT BEFORE REVISING</span><br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;"><span style="color: red;">PROFIT AFTER REVISING</span><br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;">REASON
				<br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr><tr><td style="width: 50.0000%;border: 1px solid #dddddd;">ANY OTHER SPECIAL REQUIREMENT
				<br><br></td><td style="width: 50.0000%;border: 1px solid #dddddd;"><br></td></tr></tbody></table>`;
    constructor(
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _fb: FormBuilder,
        private _settingRepo: SettingRepo,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
        this.getUserLogged();
    }

    initForm() {
        this.formAdd = this._fb.group({
            subject: ["Unlock Shipment", Validators.required],
            requester: [null, Validators.required],
            unlockType: [this.unlockTypeList[0]],
            serviceDate: [{
                startDate: new Date(),
                endDate: new Date(),
            }],
            generalReason: [this.tableDefault]
        });

        this.subject = this.formAdd.controls['subject'];
        this.requester = this.formAdd.controls['requester'];
        this.unlockType = this.formAdd.controls['unlockType'];
        this.serviceDate = this.formAdd.controls['serviceDate'];
        this.generalReason = this.formAdd.controls['generalReason'];
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.requester.setValue(this.userLogged.preferred_username);
    }

    getUnlockTypeEnumAndSetValueField(type: string) {
        switch (type) {
            case "Shipment":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.SHIPMENT;
                this.subject.setValue("Unlock Shipment");
                this.generalReason.setValue(this.tableDefault);
                break;
            case "Advance":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.ADVANCE;
                this.subject.setValue("Unlock Advance");
                this.generalReason.setValue(null);
                break;
            case "Settlement":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.SETTEMENT;
                this.subject.setValue("Unlock Settlement");
                this.generalReason.setValue(null);
                break;
            case "Change Service Date":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE;
                this.subject.setValue("Unlock Change Service Date");
                this.generalReason.setValue(this.tableDefault);
                break;
            default:
                break;
        }
    }

    getUnlockTypeEnumAndSetValue(e: string) {
        this.getUnlockTypeEnumAndSetValueField(e);
        this.listJobComponent.dataJobs = [];
    }

    save() {
        this.isSubmited = true;
        if (this.formAdd.valid) {
            if (!this.listJobComponent.dataJobs.length) {
                this._toastService.warning("Unlock request don't have any job/advance/settlement in this period, Please check it again!");
                return;
            }
            const _unlockRequest: SetUnlockRequestModel = {
                id: SystemConstants.EMPTY_GUID,
                subject: this.subject.value,
                requester: null,
                unlockType: this.unlockType.value,
                newServiceDate: this.unlockTypeEnum === CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE ? (this.serviceDate.value.startDate !== null ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                generalReason: this.generalReason.value,
                requestDate: null,
                requestUser: null,
                statusApproval: null,
                userCreated: null,
                datetimeCreated: null,
                userModified: null,
                datetimeModified: null,
                groupId: 0,
                departmentId: 0,
                officeId: SystemConstants.EMPTY_GUID,
                companyId: SystemConstants.EMPTY_GUID,
                jobs: this.listJobComponent.dataJobs,
                requesterName: null,
                userNameCreated: null,
                userNameModified: null,
                isRequester: false,
                isManager: false,
                isApproved: false,
                isShowBtnDeny: false
            };
            this._progressRef.start();
            this._settingRepo.addNewUnlockRequest(_unlockRequest)
                .pipe(catchError(this.catchError), finalize(() => {
                    this._progressRef.complete();
                }))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this._router.navigate([`${RoutingConstants.TOOL.UNLOCK_REQUEST}/${res.data.id}`]);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );

        }
    }

    sendRequest() {
        this.isSubmited = true;
        if (this.formAdd.valid) {
            if (!this.listJobComponent.dataJobs.length) {
                this._toastService.warning("Unlock request don't have any job/advance/settlement in this period, Please check it again!");
                return;
            }
            const _unlockRequest: SetUnlockRequestModel = {
                id: SystemConstants.EMPTY_GUID,
                subject: this.subject.value,
                requester: null,
                unlockType: this.unlockType.value,
                newServiceDate: this.unlockTypeEnum === CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE ? (this.serviceDate.value.startDate !== null ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                generalReason: this.generalReason.value,
                requestDate: null,
                requestUser: null,
                statusApproval: null,
                userCreated: null,
                datetimeCreated: null,
                userModified: null,
                datetimeModified: null,
                groupId: 0,
                departmentId: 0,
                officeId: SystemConstants.EMPTY_GUID,
                companyId: SystemConstants.EMPTY_GUID,
                jobs: this.listJobComponent.dataJobs,
                requesterName: null,
                userNameCreated: null,
                userNameModified: null,
                isRequester: false,
                isManager: false,
                isApproved: false,
                isShowBtnDeny: false
            };
            this._progressRef.start();
            this._settingRepo.sendRequestUnlock(_unlockRequest)
                .pipe(catchError(this.catchError), finalize(() => {
                    this._progressRef.complete();
                }))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success('Send Request successfully', 'Save Success !');
                            this._router.navigate([`${RoutingConstants.TOOL.UNLOCK_REQUEST}/${res.data.id}`]);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );

        }
    }

    confirmCancel() {
        this.confirmCancelPopup.show();
    }

    onCancelUnlock() {
        this.confirmCancelPopup.hide();
        this._router.navigate([`${RoutingConstants.TOOL.UNLOCK_REQUEST}`]);
    }
}