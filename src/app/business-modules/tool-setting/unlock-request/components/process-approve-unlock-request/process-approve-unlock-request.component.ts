import { Component, OnInit, ViewChild } from "@angular/core";
import { AppForm } from "src/app/app.form";
import { UnlockRequestInfoDeniedCommentPopupComponent } from "../popup/info-denied-comment/info-denied-comment.popup";
import { SettingRepo } from "@repositories";
import { catchError, finalize } from "rxjs/operators";
import { SetUnlockRequestApproveModel } from "@models";

@Component({
    selector: 'process-approve-unlock-request',
    templateUrl: './process-approve-unlock-request.component.html',
    styleUrls: ['./process-approve-unlock-request.component.scss']
})

export class UnlockRequestProcessApproveComponent extends AppForm implements OnInit {
    @ViewChild(UnlockRequestInfoDeniedCommentPopupComponent) infoDeniedPopup: UnlockRequestInfoDeniedCommentPopupComponent;
    idUnlockRequest: string = '';
    processApprove: SetUnlockRequestApproveModel;
    constructor(
        private _settingRepo: SettingRepo,
    ) {
        super();
    }

    ngOnInit() {
    }

    showInfoDenied() {
        this.infoDeniedPopup.getDeniedComment(this.idUnlockRequest);
        this.infoDeniedPopup.show();
    }

    getInfoProcessApprove(id: string) {
        this.idUnlockRequest = id;
        this._settingRepo.getInfoApproveUnlockRequest(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    // this._progressRef.complete();
                })
            )
            .subscribe(
                (res: any) => {
                    this.processApprove = res;
                },
            );
    }
}