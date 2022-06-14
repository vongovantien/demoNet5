import { Component, Output, EventEmitter, Input } from "@angular/core";
import { PopupBase } from "src/app/popup.base";

@Component({
    selector: 'input-denied-comment-popup',
    templateUrl: './input-denied-comment.popup.html'
})
export class UnlockRequestInputDeniedCommentPopupComponent extends PopupBase {
    @Output() onComment: EventEmitter<string> = new EventEmitter<string>();
    comment: string = '';
    constructor(
    ) {
        super();
    }

    ngOnInit() { }

    ok() {
        this.onComment.emit(this.comment);
        this.hide();
    }

    closePopup() {
        this.hide();
    }
}