import { Component, ViewChild } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { FormBuilder, FormGroup, AbstractControl, Validators } from "@angular/forms";
import { NgProgress } from "@ngx-progressbar/core";
import { AppForm } from "src/app/app.form";
import { SettingRepo } from "@repositories";
import { UnlockRequestListJobComponent } from "../components/list-job-unlock-request/list-job-unlock-request.component";
import { CommonEnum } from "@enums";
import { UnlockRequestInputDeniedCommentPopupComponent } from "../components/popup/input-denied-comment/input-denied-comment.popup";
import { catchError, finalize } from "rxjs/operators";
import { SetUnlockRequestModel } from "@models";
import { formatDate } from "@angular/common";
import { ConfirmPopupComponent } from "@common";
import { UnlockRequestProcessApproveComponent } from "../components/process-approve-unlock-request/process-approve-unlock-request.component";
import { RoutingConstants } from "@constants";
declare var $: any;

@Component({
    selector: 'app-unlock-request-detail',
    templateUrl: './detail-unlock-request.component.html'
})

export class UnlockRequestDetailComponent extends AppForm {
    @ViewChild(UnlockRequestListJobComponent, { static: true }) listJobComponent: UnlockRequestListJobComponent;
    @ViewChild(UnlockRequestInputDeniedCommentPopupComponent) inputDeniedCommentPopup: UnlockRequestInputDeniedCommentPopupComponent;
    @ViewChild('confirmCancelPopup') confirmCancelPopup: ConfirmPopupComponent;
    @ViewChild(UnlockRequestProcessApproveComponent) processApprovalComponent: UnlockRequestProcessApproveComponent;
    @ViewChild('confirmCancelRequestPopup') confirmCancelRequestPopup: ConfirmPopupComponent;

    formDetail: FormGroup;
    subject: AbstractControl;
    requester: AbstractControl;
    unlockType: AbstractControl;
    serviceDate: AbstractControl;
    generalReason: AbstractControl;

    unlockRequest: SetUnlockRequestModel;

    unlockTypeList: string[] = ['Shipment', 'Advance', 'Settlement', 'Change Service Date'];

    unlockTypeEnum: CommonEnum.UnlockTypeEnum = CommonEnum.UnlockTypeEnum.SHIPMENT;
    isSubmited: boolean = false;
    action: string = 'update';

    constructor(
        private _toastService: ToastrService,
        private _router: Router,
        private _fb: FormBuilder,
        private _progressService: NgProgress,
        private _settingRepo: SettingRepo,
        private _activedRouter: ActivatedRoute,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: Params) => {
            if (param.id) {
                this.initForm();
                this.getDetail(param.id);
            }
        });

    }

    initForm() {
        this.formDetail = this._fb.group({
            subject: [null, Validators.required],
            requester: [null, Validators.required],
            unlockType: [],
            serviceDate: [],
            generalReason: []
        });

        this.subject = this.formDetail.controls['subject'];
        this.requester = this.formDetail.controls['requester'];
        this.unlockType = this.formDetail.controls['unlockType'];
        this.serviceDate = this.formDetail.controls['serviceDate'];
        this.generalReason = this.formDetail.controls['generalReason'];
    }

    getDetail(id: string) {
        this._progressRef.start();
        this._settingRepo.getDetailUnlockRequest(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (res: any) => {
                    if (res.id !== 0) {
                        this.unlockRequest = new SetUnlockRequestModel(res);
                        switch (this.unlockRequest.statusApproval) {
                            case 'New':
                            case 'Denied':
                                this.action = 'update';
                                // TODO : Read more Documentation Lib
                                $("#textEditor").froalaEditor("edit.on");
                                break;
                            default:
                                this.action = 'read';
                                // TODO : Read more Documentation Lib
                                $("#textEditor").froalaEditor("edit.off");
                                break;
                        }
                        // const indexUnlockType = this.unlockTypeList.findIndex(x => x.id === this.unlockRequest.unlockType);
                        // let _unlockTypeActive = [];
                        // if (indexUnlockType > -1) {
                        //     _unlockTypeActive = [this.unlockTypeList[indexUnlockType]];
                        // }
                        this.formDetail.setValue({
                            subject: this.unlockRequest.subject,
                            requester: this.unlockRequest.requesterName,
                            unlockType: this.unlockRequest.unlockType,
                            serviceDate: !!this.unlockRequest.newServiceDate ? { startDate: new Date(this.unlockRequest.newServiceDate), endDate: new Date(this.unlockRequest.newServiceDate) } : { startDate: new Date(), endDate: new Date() },
                            generalReason: this.unlockRequest.generalReason,
                        });
                        this.listJobComponent.dataJobs = this.unlockRequest.jobs;
                        this.getUnlockTypeEnum(this.unlockRequest.unlockType);
                        this.processApprovalComponent.getInfoProcessApprove(this.unlockRequest.id);


                    } else {
                        // Reset 
                        this.formDetail.reset();
                        this.listJobComponent.dataJobs = [];
                        this._toastService.error("Not found data");
                    }
                },
            );
    }

    selectedUnlockType(e: string) {
        this.getUnlockTypeEnum(e);
        this.listJobComponent.dataJobs = [];
    }

    getUnlockTypeEnum(type: string) {
        switch (type) {
            case "Shipment":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.SHIPMENT;
                break;
            case "Advance":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.ADVANCE;
                break;
            case "Settlement":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.SETTEMENT;
                break;
            case "Change Service Date":
                this.unlockTypeEnum = CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE;
                break;
            default:
                break;
        }
    }

    save() {
        this.isSubmited = true;
        if (this.formDetail.valid) {
            if (!this.listJobComponent.dataJobs.length) {
                this._toastService.warning("Unlock request don't have any job/advance/settlement in this period, Please check it again!");
                return;
            }
            const _unlockRequest: SetUnlockRequestModel = {
                id: this.unlockRequest.id,
                subject: this.subject.value,
                requester: this.unlockRequest.requester,
                unlockType: this.unlockType.value,
                newServiceDate: this.unlockTypeEnum === CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE ? (this.serviceDate.value.startDate !== null ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                generalReason: this.generalReason.value,
                requestDate: this.unlockRequest.requestDate,
                requestUser: this.unlockRequest.requestUser,
                statusApproval: this.unlockRequest.statusApproval,
                userCreated: this.unlockRequest.userCreated,
                datetimeCreated: this.unlockRequest.datetimeCreated,
                userModified: this.unlockRequest.userModified,
                datetimeModified: this.unlockRequest.datetimeModified,
                groupId: this.unlockRequest.groupId,
                departmentId: this.unlockRequest.departmentId,
                officeId: this.unlockRequest.officeId,
                companyId: this.unlockRequest.companyId,
                jobs: this.listJobComponent.dataJobs,
                requesterName: null,
                userNameCreated: null,
                userNameModified: null,
                isRequester: false,
                isManager: false,
                isApproved: false,
                isShowBtnDeny: false
            };
            console.log(_unlockRequest);
            this._progressRef.start();
            this._settingRepo.updateUnlockRequest(_unlockRequest)
                .pipe(catchError(this.catchError), finalize(() => {
                    this._progressRef.complete();
                }))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this.getDetail(res.data.id);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    sendRequest() {
        this.isSubmited = true;
        if (this.formDetail.valid) {
            if (!this.listJobComponent.dataJobs.length) {
                this._toastService.warning("Unlock request don't have any job/advance/settlement in this period, Please check it again!");
                return;
            }
            const _unlockRequest: SetUnlockRequestModel = {
                id: this.unlockRequest.id,
                subject: this.subject.value,
                requester: this.unlockRequest.requester,
                unlockType: this.unlockType.value,
                newServiceDate: this.unlockTypeEnum === CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE ? (this.serviceDate.value.startDate !== null ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                generalReason: this.generalReason.value,
                requestDate: this.unlockRequest.requestDate,
                requestUser: this.unlockRequest.requestUser,
                statusApproval: this.unlockRequest.statusApproval,
                userCreated: this.unlockRequest.userCreated,
                datetimeCreated: this.unlockRequest.datetimeCreated,
                userModified: this.unlockRequest.userModified,
                datetimeModified: this.unlockRequest.datetimeModified,
                groupId: this.unlockRequest.groupId,
                departmentId: this.unlockRequest.departmentId,
                officeId: this.unlockRequest.officeId,
                companyId: this.unlockRequest.companyId,
                jobs: this.listJobComponent.dataJobs,
                requesterName: null,
                userNameCreated: null,
                userNameModified: null,
                isRequester: false,
                isManager: false,
                isApproved: false,
                isShowBtnDeny: false
            };
            console.log(_unlockRequest);
            this._progressRef.start();
            this._settingRepo.sendRequestUnlock(_unlockRequest)
                .pipe(catchError(this.catchError), finalize(() => {
                    this._progressRef.complete();
                }))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success('Send Request successfully', 'Save Success !', { positionClass: 'toast-bottom-right' });
                            this.getDetail(res.data.id);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    cancelRequest() {
        this._progressRef.start();
        this._settingRepo.cancelRequestUnlockRequest(this.unlockRequest.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    console.log(res);
                    if (res.status) {
                        this._toastService.success(res.message, 'Cancel request Is Successfull');
                        this.getDetail(this.unlockRequest.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    confirmRequest() {
        this._progressRef.start();
        this._settingRepo.approveUnlockRequest(this.unlockRequest.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, 'Approve Is Successfull');
                        this.getDetail(this.unlockRequest.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    showInputCommentDeny() {
        this.inputDeniedCommentPopup.show();
    }

    sendDeny(comment: string) {
        this._progressRef.start();
        this._settingRepo.deniedApproveUnlockRequest(this.unlockRequest.id, comment)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, 'Denie Is Successfull');
                        this.getDetail(this.unlockRequest.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    confirmCancel() {
        this.confirmCancelPopup.show();
    }

    onCancelUnlock() {
        this.confirmCancelPopup.hide();
        this._router.navigate([`${RoutingConstants.TOOL.UNLOCK_REQUEST}`]);
    }

    // RECALL REQUEST
    confirmCancelRequest() {
        this.confirmCancelRequestPopup.show();
    }

    onCancelRequest() {
        this.confirmCancelRequestPopup.hide();
        this.cancelRequest();
    }
}