import { Partner, SysImage } from '@models';
import { Component, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { ReportPreviewComponent, ConfirmPopupComponent } from '@common';
import { AccountingRepo, CatalogueRepo, ExportRepo } from '@repositories';
import { InjectViewContainerRefDirective } from '@directives';
import { AppPage } from 'src/app/app.base';
import { delayTime } from '@decorators';
import { RoutingConstants } from '@constants';

import { SettlementListChargeComponent } from '../../settlement-payment/components/list-charge-settlement/list-charge-settlement.component';
import { ISettlementPaymentData } from '../../settlement-payment/detail/detail-settlement-payment.component';
import { SettlementFormCreateComponent } from '../../settlement-payment/components/form-create-settlement/form-create-settlement.component';
import { HistoryDeniedPopupComponent } from '../components/popup/history-denied/history-denied.popup';

import { finalize, catchError, takeUntil, switchMap, tap, pluck } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { ISettlementPaymentState, LoadDetailSettlePayment, LoadDetailSettlePaymentSuccess } from '../../settlement-payment/components/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getCurrentUserState } from '@store';

@Component({
    selector: 'app-approve-settlement',
    templateUrl: './approve.settlement.component.html',
})

export class ApporveSettlementPaymentComponent extends AppPage {

    @ViewChild(SettlementListChargeComponent) requestSurchargeListComponent: SettlementListChargeComponent;
    @ViewChild(SettlementFormCreateComponent) formCreateSurcharge: SettlementFormCreateComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(InjectViewContainerRefDirective) public containerRef: InjectViewContainerRefDirective;
    @ViewChild(HistoryDeniedPopupComponent) historyDeniedPopup: HistoryDeniedPopupComponent;
    @ViewChild('modal_deny') templateModalDeny: TemplateRef<any>;

    settlementId: string = '';
    settlementCode: string = '';
    settlementPayment: ISettlementPaymentData;

    dataReport: any = null;
    approveInfo: any = null;

    modalRef: BsModalRef;
    comment: string = '';

    attachFiles: SysImage[] = [];
    folderModuleName: string = 'Settlement';
    userLogged$: Observable<Partial<SystemInterface.IClaimUser>>;

    constructor(
        private _activedRouter: ActivatedRoute,
        private _accoutingRepo: AccountingRepo,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _modalService: BsModalService,
        private _exportRepo: ExportRepo,
        private _store: Store<ISettlementPaymentState>
    ) {
        super();

    }

    ngOnInit() {
        this._activedRouter.params
            .pipe(pluck('id'))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((id: string) => {
                if (!!id && isUUID(id)) {
                    this.settlementId = id;
                    this.getDetailSettlement(this.settlementId);
                }
            });
        this.userLogged$ = this._store.select(getCurrentUserState);
    }

    onChangeCurrency(currency: string) {
        this.requestSurchargeListComponent.changeCurrency(currency);
    }

    getDetailSettlement(settlementId: string) {
        this._store.dispatch(LoadDetailSettlePayment({ id: settlementId }))
        this._accoutingRepo.getDetailSettlementPayment(settlementId, 'LIST')
            .pipe(
                catchError(this.catchError),
                tap((res: any) => {
                    if (!res.settlement) {
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}`]);
                        this._toastService.warning("Settlement not found");
                        return;
                    }
                    this.settlementPayment = res;

                    // * Update Store
                    this._store.dispatch(LoadDetailSettlePaymentSuccess(this.settlementPayment));

                    this.formCreateSurcharge.form.disable();
                    this.formCreateSurcharge.isDisabled = true;

                    // * wait to currecy list api
                    this.formCreateSurcharge.form.patchValue({
                        settlementNo: this.settlementPayment.settlement.settlementNo,
                        requester: this.settlementPayment.settlement.userNameCreated,
                        requestDate: { startDate: new Date(this.settlementPayment.settlement.requestDate), endDate: new Date(this.settlementPayment.settlement.requestDate) },
                        paymentMethod: this.formCreateSurcharge.methods.filter(method => method.value === this.settlementPayment.settlement.paymentMethod)[0],
                        note: this.settlementPayment.settlement.note,
                        statusApproval: this.settlementPayment.settlement.statusApproval,
                        amount: this.settlementPayment.settlement.amount,
                        currency: this.settlementPayment.settlement.settlementCurrency,
                        payee: this.settlementPayment.settlement.payee,
                        advanceAmount: this.settlementPayment.settlement.advanceAmount,
                        balanceAmount: this.settlementPayment.settlement.balanceAmount,
                        bankName: this.settlementPayment.settlement.bankName,
                        bankNameDescription: this.settlementPayment.settlement.bankName,
                        beneficiaryName: this.settlementPayment.settlement.bankAccountName,
                        bankAccountNo: this.settlementPayment.settlement.bankAccountNo,
                        bankCode: this.settlementPayment.settlement.bankCode,
                        dueDate: !!this.settlementPayment.settlement.dueDate ? { startDate: new Date(this.settlementPayment.settlement.dueDate), endDate: new Date(this.settlementPayment.settlement.dueDate) } : null
                    });

                    this.requestSurchargeListComponent.surcharges = this.settlementPayment.chargeNoGrpSettlement;
                    this.requestSurchargeListComponent.groupShipments = this.settlementPayment.chargeGrpSettlement;
                    this.requestSurchargeListComponent.settlementCode = this.settlementPayment.settlement.settlementNo;
                    this.requestSurchargeListComponent.requester = this.settlementPayment.settlement.requester;

                    // *SWITCH UI TO GROUP LIST SHIPMENT
                    this.requestSurchargeListComponent.TYPE = 'LIST'; // ? <> LIST
                    this.requestSurchargeListComponent.STATE = 'READ'; // ? <> WRITE


                    if (this.requestSurchargeListComponent.groupShipments.length) {
                        this.requestSurchargeListComponent.openAllCharge.next(true);
                    }
                }),
                switchMap(data => this._accoutingRepo.getInfoApproveSettlement(data.settlement.settlementNo)),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    this.approveInfo = res;
                },
            );
    }

    showModalApprove() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.containerRef.viewContainerRef, {
            body: 'Do you want to approve this settlement payment ?',
            labelConfirm: 'Yes',
        }, () => this.onConfirmApprove())
    }

    showDenyPopup() {
        this._accoutingRepo.checkAllowDenySettlement([this.settlementPayment.settlement.id])
            .subscribe(
                (res: any) => {
                    if (!res) {
                        this._toastService.error(`Settlement was delete, Please re-load page.`);
                        this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}`]);
                        return;
                    }
                    else {
                        if (!!res.data) {
                            this._toastService.warning(res.message);
                        } else {
                            this.showPopupDynamicRender(ConfirmPopupComponent, this.containerRef.viewContainerRef, {
                                body: 'Do you want to deny this settlement payment ?',
                                labelConfirm: 'Yes',
                            }, () => this.openModalDeny(this.templateModalDeny))
                        }
                    }
                },
            );
    }

    openModalDeny(template: TemplateRef<any>) {
        this.modalRef = this._modalService.show(template, { backdrop: 'static' });
    }

    onConfirmApprove() {
        this._accoutingRepo.approveSettlementPayment(this.settlementPayment.settlement.id)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message, ' Approve Is Successfull');
                        this.getDetailSettlement(this.settlementPayment.settlement.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    onConfirmDenied() {
        this._accoutingRepo.deniedApproveSettlement(this.settlementPayment.settlement.id, this.comment)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.modalRef.hide(); }),
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message, ' Deny Is Successfull');
                        this.getDetailSettlement(this.settlementPayment.settlement.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    previewSettlementPayment() {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
        //     return;
        // }

        this._accoutingRepo.previewSettlementPayment(this.settlementPayment.settlement.settlementNo)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;

                    this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.containerRef.viewContainerRef);
                    (this.componentRef.instance as ReportPreviewComponent).data = res;

                    this.showPreview();

                    this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
                        (v: any) => {
                            this.subscription.unsubscribe();
                            this.containerRef.viewContainerRef.clear();
                        });
                },
            );
    }
    @delayTime(1000)
    showPreview() {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    exportSettlementPayment(language: string, typeExp: string) {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
        //     return;
        // }

        this._exportRepo.exportSettlementPaymentDetail(this.settlementPayment.settlement.id, language)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe((response: any) => {
                if (response && response.data) {
                    if (typeExp === 'preview') {
                        this._exportRepo.previewExport(response.data);
                    } else {
                        this._exportRepo.downloadExport(response.data);
                    }
                }
            });
    }

    exportGeneralPreview(typeExp: string) {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `);
        //     return;
        // }

        this._exportRepo.exportGeneralSettlementPayment(this.settlementPayment.settlement.id)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe((response: any) => {
                if (response && response.data) {
                    if (typeExp === 'preview') {
                        this._exportRepo.previewExport(response.data);
                    } else {
                        this._exportRepo.downloadExport(response.data);
                    }
                }
            });
    }

    exportSettlementPaymentTemplate(language: string, typeExp: string) {
        // if (!this.requestSurchargeListComponent.surcharges.length) {
        //     this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
        //     return;
        // }

        this._exportRepo.exportSettlementPaymentDetailTemplate(this.settlementPayment.settlement.id, language)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe((response: any) => {
                if (response && response.data) {
                    if (typeExp === 'preview') {
                        this._exportRepo.previewExport(response.data);
                    } else {
                        this._exportRepo.downloadExport(response.data);
                    }
                }
            });
    }

    recall() {
        this._accoutingRepo.RecallRequestSettlement(this.settlementPayment.settlement.id)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, 'Recall Is Successfull');
                        // this.getInfoApproveSettlement(this.settlementPayment.settlement.settlementNo);
                        this.getDetailSettlement(this.settlementPayment.settlement.id);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    showInfoDenied() {
        this.historyDeniedPopup.getDeniedComment('Settlement', this.settlementPayment.settlement.settlementNo);
        this.historyDeniedPopup.show();
    }

    back() {
        if (!this.approveInfo.requesterAprDate) {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.SETTLEMENT_PAYMENT}/${this.settlementId}`]);
        } else {
            window.history.back();
        }
    }
}

