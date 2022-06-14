import { Component } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { ExportRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { formatDate } from "@angular/common";
import { catchError, finalize } from "rxjs/operators";
import { NgProgress } from "@ngx-progressbar/core";
import { SystemConstants } from "@constants";

@Component({
    selector: 'input-daily-export-popup',
    templateUrl: './input-daily-export.popup.html'
})
export class ShareBussinessInputDailyExportPopupComponent extends PopupBase {
    form: FormGroup;
    issuedDate: AbstractControl;
    constructor(
        private _exportRepo: ExportRepo,
        private _toastService: ToastrService,
        private _fb: FormBuilder,
        private _progressService: NgProgress,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.form = this._fb.group({
            issuedDate: [{
                startDate: new Date(),
                endDate: new Date(),
            }]
        });

        this.issuedDate = this.form.controls['issuedDate'];
    }

    apply() {
        if (this.issuedDate.value.startDate === null) {
            this._toastService.warning("Please select issued date");
            return;
        }
        const _issuedDate = formatDate(this.issuedDate.value.startDate, 'yyyy-MM-dd', 'en');
        this._progressRef.start();
        this._exportRepo.exportHousebillDaily(_issuedDate)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    if (response.byteLength > 0) {
                        const fileName = "DAILY LIST " + formatDate(this.issuedDate.value.startDate, 'dd MMM yyyy', 'en').toUpperCase() + ".xlsx";
                        this.downLoadFile(response, SystemConstants.FILE_EXCEL, fileName);
                    } else {
                        this._toastService.warning('Not found data to print', '');
                    }
                },
            );
    }

    closePopup() {
        this.issuedDate.setValue({
            startDate: new Date(),
            endDate: new Date(),
        });
        this.hide();
    }
}