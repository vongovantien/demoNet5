import { Component, ElementRef, Input, NgZone, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { SystemRepo } from "src/app/shared/repositories";
import { ToastrService } from "ngx-toastr";
import { NgProgress } from "@ngx-progressbar/core";
import { catchError, finalize, tap, switchMap } from "rxjs/operators";
import {
    FormBuilder,
} from "@angular/forms";
import { AppList } from "src/app/app.list";
import { EmailSetting } from "src/app/shared/models/system/emailSetting";
import { ConfirmPopupComponent } from "src/app/shared/common/popup";
import { ShareSystemAddEmailComponent } from "../../components/add-email/add-email.component";

declare var $: any;
@Component({
    selector: "app-department-email",
    templateUrl: "./email-department.component.html",
})
export class DepartmentEmailComponent extends AppList {
    
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild("image") el: ElementRef;
    @Input() department; // decorate the property with @Input()
    @ViewChild(ShareSystemAddEmailComponent) 
    shareSystemAddEmailComponent: ShareSystemAddEmailComponent;

    departmentId: number = 0;

    emailSettingHeaders: CommonInterface.IHeaderTable[];

    emailSettings: EmailSetting[] = [];
    selectedEmail: EmailSetting;

    constructor(
        private _activedRouter: ActivatedRoute,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _fb: FormBuilder,
        private _progressService: NgProgress
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: Params) => {
            if (param.id) {
                this.departmentId = param.id;
                console.log(this.departmentId);

                this.getEmailByDeptId();

                this.emailSettingHeaders = [
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
    }

    onRequestEmail() {
        this.getEmailByDeptId();
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

    onRequestEmailSetting() {
        this.getEmailByDeptId();
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

    openPopupAddEmailSetting() {
        this.shareSystemAddEmailComponent.action = "create";
        this.shareSystemAddEmailComponent.show();
    }
    openPopupUpdateEmailSetting(emailSetting: EmailSetting) {
        this.shareSystemAddEmailComponent.action = "update";
        this._progressRef.start();
        this._systemRepo
            .getEmailSettingByID(emailSetting.id)
            .pipe(catchError(this.catchError))
            .subscribe((data: any) => {
                this.shareSystemAddEmailComponent.emailSelected = data;
            });
        this.shareSystemAddEmailComponent.show();
    }
}
