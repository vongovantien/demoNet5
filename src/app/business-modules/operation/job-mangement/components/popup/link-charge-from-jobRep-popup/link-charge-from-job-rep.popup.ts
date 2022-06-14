import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SortService } from 'src/app/shared/services';
import { DocumentationRepo, ExportRepo, AccountingRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { catchError, switchMap, filter, takeUntil, finalize } from 'rxjs/operators';
import { LoadingPopupComponent, ReportPreviewComponent } from 'src/app/shared/common';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { AccountingConstants, SystemConstants } from '@constants';
import { ShareBussinessPaymentMethodPopupComponent } from 'src/app/business-modules/share-business/components/payment-method/payment-method.popup';
import { delayTime } from '@decorators';
import { InjectViewContainerRefDirective } from '@directives';
import { Store } from '@ngrx/store';
import { IAppState, getCurrentUserState } from '@store';
import { ShareBussinessAdjustDebitValuePopupComponent } from 'src/app/business-modules/share-modules/components/adjust-debit-value/adjust-debit-value.popup';
import { of } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
    selector: 'link-charge-from-job-rep',
    templateUrl: './link-charge-from-job-rep.popup.html'
})
export class LinkChargeJobRepPopupComponent extends PopupBase {
    @ViewChild(LoadingPopupComponent) loadingPopupComponent: LoadingPopupComponent;

    arrayJobNoRep: AbstractControl;
    formInput: FormGroup;

    constructor(
        private _fb: FormBuilder,
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _accountantRepo: AccountingRepo,
        private _store: Store<IAppState>,
        private _spinner: NgxSpinnerService
    ) {
        super();
    }

    ngOnInit() {
        this.formInput = this._fb.group({
            arrayJobNoRep: [null],
        });
        this.arrayJobNoRep = this.formInput.controls["arrayJobNoRep"];
    }

    closePopup() {
        this.hide();
        this.resetForm();
    }

    linkChargeJob(){
        const dataForm: { [key: string]: any } = this.formInput.getRawValue();
        let arrJobNoRep = dataForm.arrayJobNoRep;

        if(!arrJobNoRep){
            this._toastService.warning('No Data Link Charge');
        }
        arrJobNoRep =  arrJobNoRep.trim()
        .replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',')
        this._spinner.hide();
        this.loadingPopupComponent.body = "<a>The Link Charge Proccess is running ....!</a> <br><b>Please you wait a moment...</b>";
        this.loadingPopupComponent.show();
        this._documentationRepo.chargeFromReplicate(arrJobNoRep)
        .pipe(
            catchError(() => of(
                this.loadingPopupComponent.body = "<a>The Link Charge Proccess is Fail</b>",
                this.loadingPopupComponent.proccessFail()
            )),
            finalize(() => { this._progressRef.complete(); })
        ).subscribe(
            (respone: CommonInterface.IResult) => {
                if (respone.status) {
                    this.loadingPopupComponent.body = "<a>"+respone.message+"</b>";
                    this.loadingPopupComponent.proccessCompleted();
                    this.closePopup();
                }
            },
        );
    }

    resetForm(){
        this.arrayJobNoRep.setValue(null);
    }
}
