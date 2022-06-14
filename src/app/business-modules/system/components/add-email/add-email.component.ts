import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter, ViewChild } from "@angular/core";
import {
    FormGroup,
    FormBuilder,
    AbstractControl,
    Validators,
} from "@angular/forms";
import { SystemRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";
import { catchError } from "rxjs/operators";
import { ConfirmPopupComponent } from "@common";
import { ActivatedRoute, Params } from "@angular/router";
import { EmailSetting } from "src/app/shared/models/system/emailSetting";

@Component({
    selector: "add-email-component",
    templateUrl: "./add-email.component.html",
})
export class ShareSystemAddEmailComponent extends PopupBase {
    @Output() onRequestEmailSetting: EventEmitter<any> =
        new EventEmitter<any>();
    @ViewChild("confirmUpdatePopup") confirmUpdatePopup: ConfirmPopupComponent;
    @ViewChild("confirmCancelPopup") confirmCancelPopup: ConfirmPopupComponent;

    formEmailSetting: FormGroup;
    emailSetting: EmailSetting = new EmailSetting();
    emailSettingToUpdate: EmailSetting = new EmailSetting();
    emailSelected: EmailSetting = new EmailSetting();

    isSubmited: boolean = false;
    action: string = "create";

    emailType: AbstractControl;
    emailInfo: AbstractControl;
    departmentId: number;
    selectedEmailType: string;
    minDateExpired: any = null;
    minDateEffective: any = null;

    emailTypeList = [
        { name: "Active Agreement" },
        { name: "Active Partner" },
        { name: "Approve Settlement" },
        { name: "Approve Advance" },
        { name: "Receive Debit Note" },
        { name: "Receive Credit Note" },
        { name: "AR - Alert" },
    ];

    constructor(
        private _activedRouter: ActivatedRoute,
        private _fb: FormBuilder,

        private _systemRepo: SystemRepo,
        private _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: Params) => {
            this.departmentId = param.id;
        });
        this.initForm();
    }

    initForm() {
        this.formEmailSetting = this._fb.group({
            emailType: ['', Validators.required],
            emailInfo: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(500),
                ]),
            ],
        });

        this.emailType = this.formEmailSetting.controls["emailType"];
        this.emailInfo = this.formEmailSetting.controls["emailInfo"];
    }

    saveEmailInfo() {
        this.isSubmited = true;
        const _emailSetting: EmailSetting = {
            emailType: this.emailType.value,
            emailInfo: this.emailInfo.value,
            deptId: this.departmentId,
            userCreated: this.emailSelected.userCreated,
            createDate: this.emailSelected.createDate,
        };
        this.emailSettingToUpdate = _emailSetting;
        if (this.action === "create") {
            this._systemRepo
                .addEmailInfo(_emailSetting)
                .pipe(catchError(this.catchError))
                .subscribe((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onRequestEmailSetting.emit();
                        this.closeEmailSetting();
                    } else {
                        this._toastService.error(res.message);
                    }
                });
        } else {
            this.confirmUpdatePopup.show();
        }
    }

    closePopup() {
        this.confirmCancelPopup.show();
    }

    closeEmailSetting() {
        this.hide();
        this.isSubmited = false;
        this.emailSetting = new EmailSetting();
        this.formEmailSetting.reset();
        this._progressRef.complete()
    }
    onCancelEmailSetting() {
        this.confirmCancelPopup.hide();
        this.closeEmailSetting();
    }

    onUpdateEmailSetting() {
        this.confirmUpdatePopup.hide();
        this.emailSettingToUpdate.id = this.emailSelected.id;
        this._systemRepo
            .updateEmailInfo(this.emailSettingToUpdate)
            .pipe(catchError(this.catchError))
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(res.message);
                    this.onRequestEmailSetting.emit();
                    this.closeEmailSetting();
                } else {
                    this._toastService.error(res.message);
                }
            });
    }
}
