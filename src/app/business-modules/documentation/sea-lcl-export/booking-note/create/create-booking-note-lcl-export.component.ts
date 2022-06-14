import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from '@app';
import { SeaLCLExportFormBookingNoteComponent } from '../components/form-booking-note-lcl-export.component';
import { InfoPopupComponent } from '@common';
import { csBookingNote } from '@models';

import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DocumentationRepo } from '@repositories';
import { Router } from '@angular/router';
import { RoutingConstants } from '@constants';

import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';

@Component({
    selector: 'app-sea-lcl-export-booking-note-create',
    templateUrl: './create-booking-note-lcl-export.component.html'
})

export class SeaLCLExportBookingNoteCreateComponent extends AppForm implements OnInit {
    @ViewChild(SeaLCLExportFormBookingNoteComponent) formBookingNoteComponent: SeaLCLExportFormBookingNoteComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;

    constructor(
        protected _toastService: ToastrService,
        protected _documentRepo: DocumentationRepo,
        protected _router: Router,
    ) {
        super();
    }

    ngOnInit() { }

    onSaveBookingNote() {
        this.formBookingNoteComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd: csBookingNote = this.onSubmitData();
        this.saveBookingNote(modelAdd);
    }

    checkValidateForm(): boolean {
        let valid: boolean = true;
        if (!this.formBookingNoteComponent.formGroup.valid
            || (!!this.formBookingNoteComponent.etd.value && !this.formBookingNoteComponent.etd.value.startDate)
            || (!!this.formBookingNoteComponent.dateOfStuffing.value && !this.formBookingNoteComponent.dateOfStuffing.value.startDate)) {
            valid = false;
        }
        return valid;
    }

    onSubmitData(): csBookingNote {
        const form: any = this.formBookingNoteComponent.formGroup.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            closingTime: !!form.closingTime && !!form.closingTime.startDate ? formatDate(form.closingTime.startDate, 'yyyy-MM-ddTHH:mm', 'en') : null,
            dateOfStuffing: !!form.dateOfStuffing && !!form.dateOfStuffing.startDate ? formatDate(form.dateOfStuffing.startDate, 'yyyy-MM-dd', 'en') : null,
            bookingDate: !!form.bookingDate && !!form.bookingDate.startDate ? formatDate(form.bookingDate.startDate, 'yyyy-MM-dd', 'en') : null,

            pol: form.pol,
            pod: form.pod,
            shipperId: form.shipperId,
            consigneeId: form.consigneeId,

        };
        const bookingNote: csBookingNote = new csBookingNote(Object.assign(_merge(form, formData)));
        return bookingNote;

    }

    saveBookingNote(model: csBookingNote) {
        this._documentRepo.createCsBookingNote(model)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/booking-note/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/booking-note`]);
    }

}