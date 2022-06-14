import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SeaLCLExportBookingNoteCreateComponent } from '../create/create-booking-note-lcl-export.component';
import { Router, ActivatedRoute } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { DocumentationRepo } from '@repositories';
import { csBookingNote } from '@models';
import { NgProgress } from '@ngx-progressbar/core';
import { SubHeaderComponent, ReportPreviewComponent, ConfirmPopupComponent } from '@common';
import { RoutingConstants, SystemConstants } from '@constants';

import { map, tap, switchMap, catchError, finalize, concatMap } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import isUUID from 'validator/lib/isUUID';
import _merge from 'lodash/merge';

@Component({
    selector: 'app-sea-lcl-export-booking-note-detail',
    templateUrl: './detail-booking-note-lcl-export.component.html'
})

export class SeaLCLExportBookingNoteDetailComponent extends SeaLCLExportBookingNoteCreateComponent implements OnInit {
    @ViewChild(SubHeaderComponent) headerComponent: SubHeaderComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;

    bookingNoteId: string;
    ACTION: CommonType.ACTION_FORM = 'UPDATE';

    csBookingNote: csBookingNote = new csBookingNote();

    constructor(
        protected _router: Router,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _ngProgressService: NgProgress,
        private _cd: ChangeDetectorRef
    ) {
        super(_toastService, _documentRepo, _router);
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() { }

    ngAfterViewInit() {
        this.subscription = combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            tap((param: any) => {
                this.bookingNoteId = !!param.bookingNoteId ? param.bookingNoteId : '';
                if (param.action) {
                    this.ACTION = param.action.toUpperCase();

                } else {
                    this.ACTION = null;
                }
                this._cd.detectChanges();
            }),
            switchMap(() => of(this.bookingNoteId)),
        ).subscribe(
            (bookingNoteId: string) => {
                if (isUUID(bookingNoteId)) {
                    this.getDetailBookingNote(bookingNoteId);
                } else {
                    this.gotoList();
                }
            }
        );
    }

    getDetailBookingNote(bookingNoteId: string) {
        this._documentRepo.getDetailCsBookingNote(bookingNoteId)
            .subscribe(
                (res: csBookingNote) => {
                    this.csBookingNote = new csBookingNote(res);
                    this.updateFormCsBookingNote(res);
                }
            );
    }

    onSaveBookingNote() {
        this.formBookingNoteComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd: csBookingNote = this.onSubmitData();


        if (this.ACTION === 'COPY') {
            modelAdd.id = SystemConstants.EMPTY_GUID;
            this.createBookingNote(modelAdd);
        } else {
            //  * Update field
            modelAdd.id = this.bookingNoteId;
            modelAdd.userCreated = this.csBookingNote.createdDate;
            modelAdd.createdDate = this.csBookingNote.createdDate;
            this.saveBookingNote(modelAdd);
        }
    }

    createBookingNote(body: csBookingNote) {
        this._documentRepo.createCsBookingNote(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: { model: csBookingNote, result: any }) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");
                        this.headerComponent.resetBreadcrumb("View/Edit Booking Note");

                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/booking-note/`, res.model.id]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    saveBookingNote(body: csBookingNote) {
        this._progressRef.start();
        this._documentRepo.updateCsBookingNote(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
                concatMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        return this._documentRepo.getDetailCsBookingNote(this.bookingNoteId);
                    }
                    of(res);
                })
            )
            .subscribe(
                (res: CommonInterface.IResult | csBookingNote | any) => {
                    if (!!res && res.status === false) {
                        this._toastService.error(res.message);
                    } else {
                        this.updateFormCsBookingNote(res);
                    }
                }
            );
    }

    updateFormCsBookingNote(res: csBookingNote) {
        if (!!this.ACTION && this.ACTION.toLowerCase() === 'copy') {
            this.headerComponent.resetBreadcrumb("Add New");

            // * Reset few value.
            const formData: csBookingNote | any = {
                bookingNo: null,
                dateOfStuffing: null,
                etd: null,
                eta: null,

                paymentTerm: res.paymentTerm

            };
            this.formBookingNoteComponent.formGroup.patchValue(Object.assign(_merge(res, formData)));
        } else {
            const formData: csBookingNote | any = {
                etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null,
                eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null,
                closingTime: !!res.closingTime ? { startDate: new Date(res.closingTime), endDate: new Date(res.closingTime) } : null,
                dateOfStuffing: !!res.dateOfStuffing ? { startDate: new Date(res.dateOfStuffing), endDate: new Date(res.dateOfStuffing) } : null,
                bookingDate: !!res.bookingDate ? { startDate: new Date(res.bookingDate), endDate: new Date(res.bookingDate) } : null,


                pol: res.pol,
                pod: res.pod,
                shipperId: res.shipperId,
                consigneeId: res.consigneeId,
            };
            this.formBookingNoteComponent.formGroup.patchValue(Object.assign(_merge(res, formData)));
        }
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/booking-note`]);
    }

    gotoDuplicate() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/booking-note`, this.bookingNoteId], { queryParams: { action: 'COPY' } });
    }

    previewBookingNote() {
        this._progressRef.start();
        this._documentRepo.previewHLSeaBookingNoteById(this.bookingNoteId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        setTimeout(() => {
                            this.previewPopup.frm.nativeElement.submit();
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    showDuplicateConfirm(f: ConfirmPopupComponent) {
        this.formBookingNoteComponent.isSubmitted = false;
        f.show();
    }
}

