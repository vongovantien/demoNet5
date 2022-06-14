import { PopupBase } from "@app";
import { Component, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'reason-reject-popup',
    templateUrl: './reason-reject.popup.html'
})
export class ShareModulesReasonRejectPopupComponent extends PopupBase {
    @Output() onApply: EventEmitter<string> = new EventEmitter<string>();
    reasonReject: string = '';
    constructor() {
        super();
    }

    ngOnInit() {

    }

    apply() {
        this.hide();
        this.onApply.emit(this.reasonReject);
    }

    closePopup() {
        this.hide();
    }
}