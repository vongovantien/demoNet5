import { takeUntil } from 'rxjs/operators';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingRepo, ExportRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SOA, SysImage } from 'src/app/shared/models';
import { AppList } from 'src/app/app.list';
import { SortService } from 'src/app/shared/services';
import { NgProgress } from '@ngx-progressbar/core';
import { RoutingConstants, SystemConstants } from '@constants';
import { ReportPreviewComponent, ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { AccountingConstants } from '@constants';
import { StatementOfAccountPaymentMethodComponent } from '../components/poup/payment-method/soa-payment-method.popup';
import { Store } from '@ngrx/store';
import { getMenuUserSpecialPermissionState, IAppState, getCurrentUserState } from '@store';
import { ShareModulesReasonRejectPopupComponent } from 'src/app/business-modules/share-modules/components';
import { HttpResponse } from '@angular/common/http';
import { InjectViewContainerRefDirective } from '@directives';
import { ICrystalReport } from '@interfaces';
import { delayTime } from '@decorators';
import { ShareBussinessAdjustDebitValuePopupComponent } from 'src/app/business-modules/share-modules/components/adjust-debit-value/adjust-debit-value.popup';

@Component({
    selector: 'app-statement-of-account-detail',
    templateUrl: './detail-soa.component.html',
})
export class StatementOfAccountDetailComponent extends AppList implements ICrystalReport {
    @ViewChild(StatementOfAccountPaymentMethodComponent) paymentMethodPopupComponent: StatementOfAccountPaymentMethodComponent;
    @ViewChild(ShareModulesReasonRejectPopupComponent) reasonRejectPopupComponent: ShareModulesReasonRejectPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;
    @ViewChild(ShareBussinessAdjustDebitValuePopupComponent) adjustDebitValuePopup: ShareBussinessAdjustDebitValuePopupComponent;

    soaNO: string = '';

    soa: SOA = new SOA();

    isClickSubMenu: boolean = false;

    dataExportSOA: ISOAExport;
    initGroup: any[] = [];
    TYPE: string = 'LIST';
    paymentMethodSelected: string = '';
    confirmType: string = 'SYNC';
    reasonReject: string = '';
    attachFiles: SysImage[] = [];
    backToInv: boolean = false;

    userLogged: Partial<SystemInterface.IClaimUser>;

    constructor(
        private _activedRoute: ActivatedRoute,
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _router: Router,
        private _progressService: NgProgress,
        private _exportRepo: ExportRepo,
        private _store: Store<IAppState>
    ) {
        super();
        this.requestSort = this.sortChargeList;
        this._progressRef = this._progressService.ref();
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.headers = [
            { title: 'No.', field: 'i', sortable: false },
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', width: 400, sortable: true },
            { title: 'JobID', field: 'jobId', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'Debit', field: 'debit', sortable: true },
            { title: 'Credit', field: 'credit', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Total VND', field: 'totalVND', sortable: true },
            { title: 'Total USD', field: 'totalUSD', sortable: true },
            { title: 'C/D Note', field: 'cdNote', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Quantity', field: 'quantity', sortable: true },
            { title: 'VAT', field: 'vatRate', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Services Date', field: 'serviceDate', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
            { title: 'Synced From', field: 'syncedFromBy', sortable: true },
            { title: 'ExcRate to Local', field: 'exchangeRate', sortable: true },
        ];
        this._activedRoute.queryParams.subscribe((params: any) => {
            if (!!params.no && params.currency) {
                this.soaNO = params.no;
                const currencyLocal = params.currency || 'VND';
                this.getDetailSOA(this.soaNO, currencyLocal)
            }
            if (!!params.action && params.action === 'inv') {
                this.backToInv = true;
            }
        });
        this._store.select(getCurrentUserState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((u) => {
                if (!!u) {
                    this.userLogged = u;
                }
            })
    }

    getDetailSOA(soaNO: string, currency: string) {
        this._progressRef.start();
        this.isLoading = true;
        this._accoutingRepo.getDetaiLSOA(soaNO, currency)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); this.isLoading = false; })
            )
            .subscribe(
                (res: any) => {
                    this.soa = new SOA(res);
                    this.totalItems = this.soa.chargeShipments.length;
                    this.initGroup = this.soa.groupShipments;
                },
            );
    }

    sortChargeList(sortField?: string) {
        if (this.TYPE === 'GROUP') {
            this.soa.groupShipments.forEach(element => {
                element.chargeShipments = this._sortService.sort(element.chargeShipments, sortField, this.order);
            });
        } else {
            this.soa.chargeShipments = this._sortService.sort(this.soa.chargeShipments, sortField, this.order);
        }
    }

    exportExcelSOA() {
        this.isClickSubMenu = false;
        this._progressRef.start();
        this._exportRepo.exportDetailSOA(this.soaNO, 'VND')
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response != null && response.headers.get(SystemConstants.EFMS_FILE_NAME) != null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );

    }

    exportSOAAF() {
        this._progressRef.start();
        this._exportRepo.exportSOAAirFreight(this.soaNO, this.userLogged.officeId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response != null && response.headers.get(SystemConstants.EFMS_FILE_NAME) != null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );
    }

    exportSOAAFWithHBL() {
        this._progressRef.start();
        this._exportRepo.exportSOAAirFreightWithHBL(this.soaNO, this.userLogged.officeId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response != null && response.headers.get(SystemConstants.EFMS_FILE_NAME) != null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );
    }

    exportSOASupplierAF() {
        this._progressRef.start();
        this._exportRepo.exportSOASupplierAirFreight(this.soaNO, this.userLogged.officeId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response != null && response.headers.get(SystemConstants.EFMS_FILE_NAME) != null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );
    }

    async getDetailSOAExport(soaNO: string) {
        this._progressRef.start();
        try {
            const res: any = await (this._accoutingRepo.getDetailSOAToExport(soaNO, 'VND').toPromise());
            if (!!res) {
                return res;
            }
        } catch (errors) {
            this.handleError(errors, (data: any) => {
                this._toastService.error(data.message, data.title);
            });
        }
        finally {
            this._progressRef.complete();
        }
    }

    back() {
        if (!this.backToInv) {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}`]);
        } else {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNTING_MANAGEMENT}/cd-invoice`]);
        }
    }

    export() {
        this._progressRef.start();
        this._exportRepo.exportBravoSOA(this.soaNO)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }

    exportSOAOPS() {
        this._progressRef.start();
        this._exportRepo.exportSOAOPS(this.soaNO)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response != null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );
    }

    previewAccountStatementFull(soaNo: string) {
        this._accoutingRepo.previewAccountStatementFull(soaNo)
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        this.renderAndShowReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    // Charge keyword search
    onChangeKeyWord(keyword: string) {
        if (this.TYPE === 'GROUP') {
            this.soa.groupShipments = this.initGroup;
            // TODO improve search.
            if (!!keyword) {
                if (keyword.indexOf('\\') !== -1) { return this.soa.groupShipments = []; }
                keyword = keyword.toLowerCase();
                // Search group
                let dataGrp = this.soa.groupShipments.filter((item: any) => item.jobId.toLowerCase().toString().search(keyword) !== -1
                    || item.hbl.toLowerCase().toString().search(keyword) !== -1
                    || item.mbl.toLowerCase().toString().search(keyword) !== -1);
                // Không tìm thấy group thì search tiếp list con của group
                if (dataGrp.length === 0) {
                    const arrayCharge = [];
                    for (const group of this.soa.groupShipments) {
                        const data = group.chargeShipments.filter((item: any) => item.chargeCode.toLowerCase().toString().search(keyword) !== -1
                            || item.currency.toLowerCase().toString().search(keyword) !== -1
                            || item.jobId.toLowerCase().toString().search(keyword) !== -1
                            || item.hbl.toLowerCase().toString().search(keyword) !== -1
                            || item.mbl.toLowerCase().toString().search(keyword) !== -1
                            || item.chargeName.toLowerCase().toString().search(keyword) !== -1);
                        if (data.length > 0) {
                            arrayCharge.push({ jobId: group.jobId, hbl: group.hbl, mbl: group.mbl, totalDebit: group.totalDebit, totalCredit: group.totalCredit, chargeShipments: data });
                        }
                    }
                    dataGrp = arrayCharge;
                }
                return this.soa.groupShipments = dataGrp;
            } else {
                this.soa.groupShipments = this.initGroup;
            }
        }
    }

    switchToGroup() {
        if (this.TYPE === 'GROUP') {
            this.TYPE = 'LIST';
        } else {
            this.TYPE = 'GROUP';
        }
    }

    confirmSendToAcc() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: `Are you sure you want to send <strong>${this.soa.soano}</strong> to accountant system?`,
            labelConfirm: 'Ok'
        }, () => { this.onConfirmSoa(); });
    }

    showConfirmed() {
        this._accoutingRepo.checkSoaSynced(this.soa.id)
            .subscribe(
                (res: any) => {
                    if (res) {
                        let messageValidate;
                        if (this.soa.type !== 'Credit') {
                            messageValidate = "Existing charge has been synchronized to the accounting system or the charge has issue VAT invoices on eFMS! Please you check again!";
                        } else {
                            messageValidate = "Existing charge has been synchronized to the accounting system! Please you check again!";
                        }
                        this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                            title: 'Alert',
                            body: messageValidate
                        });
                    } else {
                        this.confirmType = "SYNC";
                        if (this.soa.type === "All") {
                            this._toastService.warning("Not allow send soa with type All");
                            return;
                        }
                        if (this.soa.type === 'Credit' && this.soa.creditPayment === 'Direct') {
                            this.paymentMethodPopupComponent.show();
                        } else {
                            this.paymentMethodSelected = 'Other'; // CR 14979: 03-12-2020
                            this.confirmSendToAcc();
                        }
                    }
                },
            );
    }

    onApplyPaymentMethod($event) {
        this.paymentMethodSelected = $event;
        this.confirmSendToAcc();
    }

    sendSoaToAccountant() {
        const soaSyncIds: AccountingInterface.IRequestStringType[] = [];
        const soaId: AccountingInterface.IRequestStringType = {
            id: this.soa.id,
            type: this.soa.type,
            action: this.soa.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
            paymentMethod: this.paymentMethodSelected
        };
        soaSyncIds.push(soaId);

        this._accoutingRepo.syncSoaToAccountant(soaSyncIds)
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success("Send Data to Accountant System Successful");
                        this.getDetailSOA(this.soa.soano, this.soa.currency);
                    } else {
                        this._toastService.error("Send Data Fail");
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    onConfirmSoa() {
        if (this.confirmType === "SYNC") {
            this.sendSoaToAccountant();
        }
        if (this.confirmType === "REJECT") {
            this.rejectSoa();
        }
    }

    showPopupReason() {
        this.confirmType = "REJECT";
        this.reasonRejectPopupComponent.show();
    }


    onApplyReasonReject($event) {
        this.reasonReject = $event;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: `Are you sure you want to reject soa <strong>${this.soa.soano}</strong>?`,
            labelConfirm: 'Ok'
        }, () => { this.onConfirmSoa(); });
    }

    rejectSoa() {
        this._accoutingRepo.rejectSoaCredit({ id: this.soa.id, reason: this.reasonReject })
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (((res as CommonInterface.IResult).status)) {
                        this._toastService.success(res.message);
                        this.getDetailSOA(this.soa.soano, this.soa.currency);
                    } else {
                        this._toastService.error(res.message);
                    }
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.viewContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.viewContainerRef.viewContainerRef.clear();
            });
    }

    adjustDebitValue() {
        this.adjustDebitValuePopup.soano = this.soaNO;
        this.adjustDebitValuePopup.action = "SOA";
        this.adjustDebitValuePopup.active();
    }
    onSaveAdjustDebit() {
        this.getDetailSOA(this.soaNO, 'VND');
    }
}

interface ISOAExport {
    soaNo: string;
    taxCode: string;
    totalBalanceExchange: number;
    totalCreditExchange: number;
    totalDebitExchange: number;
    currencySOA: string;
    customerAddress: string;
    customerName: string;
    listCharges: any[];
}


