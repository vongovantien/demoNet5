import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'partner-reject-popup',
    templateUrl: 'partner-reject.popup.html'
})

export class PartnerRejectPopupComponent extends PopupBase implements OnInit {
    @Output() onSave: EventEmitter<string> = new EventEmitter<string>();
    comment: string = '';

    constructor(private _toastService: ToastrService) {
        super();
    }

    ngOnInit() { }

    closePopup() {
        this.hide();
    }

    saveComment() {
        if (this.comment === '') {
            this._toastService.warning('Please input your comment!');
            return;
        }
        this.onSave.emit(this.comment);
        this.hide();
    }
}
