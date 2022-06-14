import {
    Component,
    ViewChild,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { formatDate } from "@angular/common";
import { ToastrService } from "ngx-toastr";

import { AppPage } from "@app";
import { AccountingRepo, ExportRepo } from "@repositories";
import { AdvancePayment, AdvancePaymentRequest, SysImage } from "@models";
import { ReportPreviewComponent } from "@common";
import { RoutingConstants } from "@constants";
import { delayTime } from "@decorators";
import { ICrystalReport } from "@interfaces";

import { AdvancePaymentFormCreateComponent } from "../components/form-create-advance-payment/form-create-advance-payment.component";
import { AdvancePaymentListRequestComponent } from "../components/list-advance-payment-request/list-advance-payment-request.component";

import { catchError, map, takeUntil } from "rxjs/operators";
import isUUID from "validator/lib/isUUID";
import { InjectViewContainerRefDirective } from "@directives";
import { combineLatest } from "rxjs";
import { ListAdvancePaymentCarrierComponent } from "../components/list-advance-payment-carrier/list-advance-payment-carrier.component";
import { getCurrentUserState, IAppState } from "@store";
import { Store } from "@ngrx/store";

@Component({
    selector: "app-advance-payment-detail",
    templateUrl: "./detail-advance-payment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancePaymentDetailComponent
    extends AppPage
    implements ICrystalReport {
    @ViewChild(AdvancePaymentFormCreateComponent, { static: true }) formCreateComponent: AdvancePaymentFormCreateComponent;
    @ViewChild(AdvancePaymentListRequestComponent) listRequestAdvancePaymentComponent: AdvancePaymentListRequestComponent;
    @ViewChild(ListAdvancePaymentCarrierComponent) listAdvancePaymentCarrierComponent: ListAdvancePaymentCarrierComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(InjectViewContainerRefDirective)
    reportContainerRef: InjectViewContainerRefDirective;
    progress: any[] = [];
    advancePayment: AdvancePayment = null;

    advId: string = "";
    actionList: string = "update";
    approveInfo: any = null;

    attachFiles: SysImage[] = [];
    folderModuleName: string = "Advance";
    statusApproval: string = "";
    isAdvCarrier: boolean = false;

    constructor(
        private _activedRouter: ActivatedRoute,
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _exportRepo: ExportRepo,
        private _cd: ChangeDetectorRef,
        private readonly _store: Store<IAppState>,
    ) {
        super();
    }

    ngOnInit() {
        this.subscription = combineLatest([
            this._activedRouter.params,
            this._activedRouter.queryParams
        ]).pipe(
            map(([p, d]) => ({ ...p, ...d })),
        ).subscribe(
            (res: any) => {
                if (!!res.action && res.action === 'carrier') {
                    this.isAdvCarrier = true;
                    this.formCreateComponent.isAdvCarrier = this.isAdvCarrier;
                }
                if (isUUID(res.id)) {
                    this.advId = res.id;
                    this.getDetail(res.id);
                } else {
                    this.back();
                }
            }
        );
    }

    @delayTime(1000)
    showReport(): void {
        this._cd.detectChanges();
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    onChangeCurrency(currency: string) {
        if (!this.isAdvCarrier) {
            this.listRequestAdvancePaymentComponent.changeCurrency(currency);
            for (const item of this.listRequestAdvancePaymentComponent
                .listRequestAdvancePayment) {
                item.requestCurrency = currency;
            }
            this.listRequestAdvancePaymentComponent.currency = currency;
        } else {
            for (const item of this.listAdvancePaymentCarrierComponent.listAdvanceCarrier) {
                item.requestCurrency = currency;
                item.currencyId = currency;
            }
            this.listAdvancePaymentCarrierComponent.currency = currency;
        }
    }

    getDetail(advanceId: string) {
        this._accoutingRepo
            .getDetailAdvancePayment(advanceId)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!res) {
                        this._toastService.warning("Advance Payment not found");
                        this.back();
                        return;
                    }
                    this.advancePayment = new AdvancePayment(res);
                    switch (this.advancePayment.statusApproval) {
                        case "New":
                        case "Denied":
                            break;
                        default:
                            this.formCreateComponent.formCreate.disable();
                            this.formCreateComponent.isDisabled = true;

                            this.actionList = "read";
                            break;
                    }
                    // * wait to currecy list api
                    this.formCreateComponent.formCreate.patchValue({
                        advanceNo: this.advancePayment.advanceNo,
                        requester: this.advancePayment.requester,
                        requestDate: {
                            startDate: new Date(
                                this.advancePayment.requestDate
                            ),
                            endDate: new Date(this.advancePayment.requestDate),
                        },
                        paymentMethod: this.advancePayment.paymentMethod,
                        statusApproval: this.advancePayment.statusApproval,
                        deadLine: {
                            startDate: new Date(
                                this.advancePayment.deadlinePayment
                            ),
                            endDate: new Date(
                                this.advancePayment.deadlinePayment
                            ),
                        },
                        note: this.advancePayment.advanceNote,
                        currency: this.advancePayment.advanceCurrency,
                        paymentTerm: this.advancePayment.paymentTerm || 9,
                        bankAccountNo: this.advancePayment.bankAccountNo,
                        bankAccountName: this.advancePayment.bankAccountName,
                        bankName: this.advancePayment.bankName,
                        payee: this.advancePayment.payee,
                        bankCode: this.advancePayment.bankCode,
                        advanceFor: this.advancePayment.advanceFor
                    });
                    this.statusApproval = this.advancePayment.statusApproval;
                    if (!this.isAdvCarrier) {
                        this.listRequestAdvancePaymentComponent.listRequestAdvancePayment =
                            this.advancePayment.advanceRequests;
                        this.listRequestAdvancePaymentComponent.totalAmount =
                            this.listRequestAdvancePaymentComponent.updateTotalAmount(
                                this.advancePayment.advanceRequests
                            );
                        this.listRequestAdvancePaymentComponent.advanceNo =
                            this.advancePayment.advanceNo;
                        this.getInfoApprove(this.advancePayment.advanceNo);
                    } else {
                        this.listAdvancePaymentCarrierComponent.advForType = this.advancePayment.advanceFor;
                        this.listAdvancePaymentCarrierComponent.setListAdvRequest(this.advancePayment.advanceRequests);
                        let advanceRequestList = [];
                        this.advancePayment.advanceRequests.forEach((x: AdvancePaymentRequest) => advanceRequestList.push({
                            jobId: x.jobId,
                            mbl: x.mbl,
                            hbl: x.hbl,
                            hblid: x.hblid,
                            customNo: x.customNo
                        }));
                        advanceRequestList =
                            [...advanceRequestList, ...advanceRequestList.filter((item: any) => this.listAdvancePaymentCarrierComponent.configShipment.dataSource.some(x => x.hblid !== item.hblid && x.jobId !== item.jobId))];
                        this.listAdvancePaymentCarrierComponent.configShipment.dataSource = [...this.listAdvancePaymentCarrierComponent.configShipment.dataSource, ...advanceRequestList];

                        this.listAdvancePaymentCarrierComponent.advanceNo =
                            this.advancePayment.advanceNo;
                    }
                },
                (error: any) => {
                    console.log(error);
                },
                () => { }
            );
    }

    getAndModifiedBodyAdvance() {
        if (!this.isAdvCarrier) {
            return {
                advanceRequests:
                    this.listRequestAdvancePaymentComponent
                        .listRequestAdvancePayment,

                requester: this.formCreateComponent.requester.value,
                paymentMethod: this.formCreateComponent.paymentMethod.value,
                advanceCurrency: this.formCreateComponent.currency.value || "VND",
                requestDate: !!this.formCreateComponent.requestDate.value.startDate
                    ? formatDate(
                        this.formCreateComponent.requestDate.value.startDate,
                        "yyyy-MM-dd",
                        "en"
                    )
                    : null,
                deadlinePayment: !!this.formCreateComponent.deadlinePayment.value
                    .startDate
                    ? formatDate(
                        this.formCreateComponent.deadlinePayment.value.startDate,
                        "yyyy-MM-dd",
                        "en"
                    )
                    : null,
                advanceNote: this.formCreateComponent.note.value,
                statusApproval: this.advancePayment.statusApproval,
                advanceNo: this.advancePayment.advanceNo,
                id: this.advancePayment.id,
                UserCreated: this.advancePayment.userCreated,
                DatetimeCreated: this.advancePayment.datetimeCreated,
                paymentTerm: this.formCreateComponent.paymentTerm.value || 9,
                bankAccountNo: this.formCreateComponent.bankAccountNo.value,
                bankAccountName: this.formCreateComponent.bankAccountName.value,
                bankName: this.formCreateComponent.bankName.value,
                payee: this.formCreateComponent.payee.value,
                bankCode: this.formCreateComponent.bankCode.value,
            };
        }
        else {
            return {
                advanceRequests: this.listAdvancePaymentCarrierComponent.getListAdvRequest(),
                requester: this.formCreateComponent.requester.value,
                paymentMethod: this.formCreateComponent.paymentMethod.value,
                advanceCurrency: this.formCreateComponent.currency.value || "VND",
                requestDate: !!this.formCreateComponent.requestDate.value.startDate
                    ? formatDate(
                        this.formCreateComponent.requestDate.value.startDate,
                        "yyyy-MM-dd",
                        "en"
                    )
                    : null,
                deadlinePayment: !!this.formCreateComponent.deadlinePayment.value
                    .startDate
                    ? formatDate(
                        this.formCreateComponent.deadlinePayment.value.startDate,
                        "yyyy-MM-dd",
                        "en"
                    )
                    : null,
                advanceNote: this.formCreateComponent.note.value,
                statusApproval: this.advancePayment.statusApproval,
                advanceNo: this.advancePayment.advanceNo,
                id: this.advancePayment.id,
                UserCreated: this.advancePayment.userCreated,
                DatetimeCreated: this.advancePayment.datetimeCreated,
                paymentTerm: this.formCreateComponent.paymentTerm.value || 9,
                bankAccountNo: this.formCreateComponent.bankAccountNo.value,
                bankAccountName: this.formCreateComponent.bankAccountName.value,
                bankName: this.formCreateComponent.bankName.value,
                payee: this.formCreateComponent.payee.value,
                bankCode: this.formCreateComponent.bankCode.value,
                advanceFor: this.formCreateComponent.advanceFor.value
            };
        }
    }

    updateAdvPayment() {
        if (this.checkValidListAdvanceRequest()) {
            return;
        } else {
            const body = this.getAndModifiedBodyAdvance();
            this._accoutingRepo
                .updateAdvPayment(body)
                .subscribe((res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(
                            `${res.data.advanceNo + " is update successfully"}`,
                            "Update Success !"
                        );
                        this.getDetail(this.advId);
                    } else {
                        this.handleError((data: any) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                });
        }
    }

    back() {
        this._router.navigate([
            `${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}`,
        ]);
    }

    previewAdvPayment() {
        this._accoutingRepo
            .previewAdvancePayment(this.advId)
            .pipe(catchError(this.catchError))
            .subscribe((res: any) => {
                this.componentRef = this.renderDynamicComponent(
                    ReportPreviewComponent,
                    this.reportContainerRef.viewContainerRef
                );
                (this.componentRef.instance as ReportPreviewComponent).data =
                    res;

                this.showReport();

                this.subscription = (
                    this.componentRef.instance as ReportPreviewComponent
                ).$invisible.subscribe((v: any) => {
                    this.subscription.unsubscribe();
                    this.reportContainerRef.viewContainerRef.clear();
                });
            });
    }

    checkValidListAdvanceRequest() {
        if (!this.isAdvCarrier) {
            if (!this.listRequestAdvancePaymentComponent.listRequestAdvancePayment.length) {
                this._toastService.warning(
                    `Advance Payment don't have any request in this period, Please check it again! `,
                    ""
                );
                return true;
            }
            if (this.listRequestAdvancePaymentComponent.totalAmount > 100000000 && this.formCreateComponent.paymentMethod.value === "Cash") {
                this._toastService.warning(
                    `Total Advance Amount by cash is not exceed 100.000.000 VND `,
                    ""
                );
                return true;
            }

        } else {
            this.listAdvancePaymentCarrierComponent.isSubmitted = true;
            this.formCreateComponent.isSubmitted = true;
            if (!this.listAdvancePaymentCarrierComponent.listAdvanceCarrier.length) {
                this._toastService.warning(`Advance Payment don't have any request in this period, Please check it again! `, "");
                return true;
            }
            if (!this.formCreateComponent.payee.value) {
                return true;
            }
            if (!this.listAdvancePaymentCarrierComponent.checkValidate()) {
                return true;
            }
            if (this.listAdvancePaymentCarrierComponent.totalAmount > 100000000 &&
                this.formCreateComponent.paymentMethod.value === "Cash") {
                this._toastService.warning(`Total Advance Amount by cash is not exceed 100.000.000 VND `, "");
                return true;
            }
            this.formCreateComponent.isSubmitted = false;
            this.listAdvancePaymentCarrierComponent.isSubmitted = false;
        }
        return false;
    }

    sendRequest() {
        if (this.checkValidListAdvanceRequest()) {
            return;
        }
        const body = this.getAndModifiedBodyAdvance();
        this._accoutingRepo
            .sendRequestAdvPayment(body)
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(
                        `${res.data.advanceNo + " Send request successfully"}`,
                        "Update Success !"
                    );
                    if (!this.isAdvCarrier) {
                        this._router.navigate([
                            `${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${res.data.id}/approve`,
                        ]);
                    } else {
                        this._router.navigate([
                            `${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${res.data.id}/approve`,
                        ], {
                            queryParams: Object.assign({}, { action: "carrier" })
                        });
                    }
                } else {
                    this.handleError((data: any) => {
                        this._toastService.error(data.message, data.title);
                    });
                }
            });
    }

    exportAdvPayment(lang: string, typeExp: string) {
        this._exportRepo
            .exportAdvancePaymentDetail(this.advId, lang)
            .pipe(
                catchError(this.catchError)
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

    getInfoApprove(advanceNo: string) {
        this._accoutingRepo.getInfoApprove(advanceNo).subscribe((res: any) => {
            this.approveInfo = res;
        });
    }

    recall() {
        this._accoutingRepo
            .recallRequest(this.advId)
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(
                        res.message,
                        "Recall Is Successfull"
                    );
                    this.getDetail(this.advId);
                } else {
                    this._toastService.error(res.message, "");
                }
            });
    }

    changeAdvanceFor(data: string) {
        if (this.isAdvCarrier) {
            this.listAdvancePaymentCarrierComponent.configDisplayShipment(data);
        }
    }
}
