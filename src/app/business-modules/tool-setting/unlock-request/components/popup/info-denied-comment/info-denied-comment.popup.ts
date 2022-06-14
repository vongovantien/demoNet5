import { Component } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { SettingRepo } from "@repositories";
import { catchError, finalize } from "rxjs/operators";
import { DeniedUnlockRequestResult } from "@models";

@Component({
    selector: 'info-denied-comment-popup',
    templateUrl: './info-denied-comment.popup.html'
})
export class UnlockRequestInfoDeniedCommentPopupComponent extends PopupBase {
    infoDenieds: DeniedUnlockRequestResult[] = [];

    constructor(
        private _settingRepo: SettingRepo,
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'No', field: 'no', sortable: true },
            { title: 'Name & Deny Time', field: 'nameAndTimeDeny', sortable: true },
            { title: 'Level Approval', field: 'levelApprove', sortable: true },
            { title: 'Comment', field: 'comment', sortable: true },
        ];
    }

    closePopup() {
        this.hide();
    }

    getDeniedComment(id: string) {
        this._settingRepo.getHistoryDenied(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    // this._progressRef.complete();
                })
            )
            .subscribe(
                (res: any) => {
                    this.infoDenieds = res;
                },
            );
    }
}