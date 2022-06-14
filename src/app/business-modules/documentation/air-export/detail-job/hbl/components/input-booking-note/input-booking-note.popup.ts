import { PopupBase } from "src/app/popup.base";
import { Component, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, AbstractControl, FormBuilder } from "@angular/forms";
import { DocumentationRepo } from "@repositories";
import { catchError, finalize, switchMap, concatMap } from "rxjs/operators";
import { CsTransactionDetail } from "@models";
import { ToastrService } from "ngx-toastr";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from "ngx-bootstrap/modal";
import { environment } from "src/environments/environment";
import { of } from "rxjs";

@Component({
    selector: 'input-booking-note-popup',
    templateUrl: './input-booking-note.popup.html'
})

export class InputBookingNotePopupComponent extends PopupBase {
    @ViewChild('formPreviewBookingNote') formPreviewBookingNote: ElementRef;
    @ViewChild("popupReport") popupReport: ModalDirective;

    formInputBN: FormGroup;

    flexId: AbstractControl;
    flightNo2: AbstractControl;
    contactPerson: AbstractControl;
    closingTime: AbstractControl;

    reportType: string = '';
    hblId: string = '';
    hblDetail: CsTransactionDetail;

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _fb: FormBuilder,
        private sanitizer: DomSanitizer, ) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formInputBN = this._fb.group({
            flexId: [],
            flightNo2: [],
            contactPerson: [],
            closingTime: []
        });

        this.flexId = this.formInputBN.controls['flexId'];
        this.flightNo2 = this.formInputBN.controls['flightNo2'];
        this.contactPerson = this.formInputBN.controls['contactPerson'];
        this.closingTime = this.formInputBN.controls['closingTime'];
    }

    previewBookingNote() {
        const body: IBookingNoteCriteria = {
            reportType: this.reportType,
            hblId: this.hblId,
            flexId: this.flexId.value,
            flightNo2: this.flightNo2.value,
            contactPerson: this.contactPerson.value,
            closingTime: this.closingTime.value
        };
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblId, 'DOC')
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewBookingNote(body);
                    } else {
                        this._toastService.warning(res.message);
                        return of(false);
                    }
                }),
                concatMap((data: any) => {
                    if (!!data) {
                        if (data !== null && data.dataSource.length > 0) {
                            this.dataReport = JSON.stringify(data);
                            setTimeout(() => {
                                if (!this.popupReport.isShown) {
                                    this.popupReport.config = this.options;
                                    this.popupReport.show();
                                }
                                this.submitFormPreview();
                            }, 1000);

                            return this._documentationRepo.updateInputBookingNoteAirExport(body);
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }
                })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.hblDetail.flexId = body.flexId;
                        this.hblDetail.flightNoRowTwo = body.flightNo2;
                        this.hblDetail.contactPerson = body.contactPerson;
                        this.hblDetail.closingTime = body.closingTime;
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    updateInputBookingNote(body: IBookingNoteCriteria) {
        this._documentationRepo.updateInputBookingNoteAirExport(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.hblDetail.flexId = body.flexId;
                        this.hblDetail.flightNoRowTwo = body.flightNo2;
                        this.hblDetail.contactPerson = body.contactPerson;
                        this.hblDetail.closingTime = body.closingTime;
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    bindingFormBN(housebill: CsTransactionDetail) {
        this.hblDetail = housebill;
        this.formInputBN.setValue({
            flexId: this.hblDetail.flexId,
            flightNo2: this.hblDetail.flightNoRowTwo,
            contactPerson: this.hblDetail.contactPerson,
            closingTime: this.hblDetail.closingTime
        });
    }

    closePopup() {
        // this.formInputBN.reset();
        this.hide();
    }

    get scr() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.HOST.REPORT}`);
    }

    ngAfterViewInit() {
        if (!!this.dataReport) {
            this.formPreviewBookingNote.nativeElement.submit();
        }
    }

    submitFormPreview() {
        this.formPreviewBookingNote.nativeElement.submit();
    }

    onSubmitForm() {
        return true;
    }

    hidePreview() {
        this.popupReport.hide();
    }
}

interface IBookingNoteCriteria {
    reportType: string;
    hblId: string;
    flexId: string;
    flightNo2: string;
    contactPerson: string;
    closingTime: string;
}