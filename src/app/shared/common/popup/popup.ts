import { Directive, ViewChild } from "@angular/core";
import { ModalDirective, ModalOptions } from "ngx-bootstrap/modal";

@Directive()
export abstract class eFMSPopup {
    @ViewChild("popup") popup: ModalDirective;

    options: ModalOptions = {
        animated: true,
        keyboard: true,
        backdrop: 'static'
    };

    // * fn set options
    setOptions(options?: ModalOptions) {
        const self = this;
        if (typeof options === 'object') {
            for (const key in options) {
                if (self.hasOwnProperty(key)) {
                    self[key] = options[key];
                }
            }
        }
    }

    // * show poup
    show(options?: ModalOptions): void {
        this.setOptions(Object.assign(this.options, options));
        if (!this.popup.isShown) {
            this.popup.config = this.options;
            this.popup.show();
        }
    }

    hide() {
        this.popup.hide();
    }

    // event fire when hide popup
    onHide($event: any) {
    }

    // event fire when show popup
    onShow($event: any) {
    }

}