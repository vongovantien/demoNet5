import { InitProfitHBLAction, GetDetailHBLAction } from './../../store/actions/hbl.action';
import { AppList } from "src/app/app.list";
import { SortService } from "@services";
import { HouseBill, CsTransactionDetail, CsTransaction } from "@models";
import { getHBLSState, IShareBussinessState, GetContainersHBLAction, GetProfitHBLAction, GetBuyingSurchargeAction, GetSellingSurchargeAction, GetOBHSurchargeAction, GetListHBLAction, TransactionGetDetailAction, getTransactionLocked, getHBLLoadingState, getSurchargeLoadingState, getTransactionDetailCsTransactionState, GetContainerAction, LoadListPartnerForKeyInSurcharge } from "../../store";
import { Store } from "@ngrx/store";
import { Params, ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { NgProgress } from "@ngx-progressbar/core";
import { ViewChild, Directive } from "@angular/core";
import { ConfirmPopupComponent, Permission403PopupComponent, InfoPopupComponent, ReportPreviewComponent } from "@common";
import { ToastrService } from "ngx-toastr";
import { DocumentationRepo } from "@repositories";
import { ICrystalReport } from "@interfaces";

import { takeUntil, catchError, finalize, map } from "rxjs/operators";
import isUUID from 'validator/lib/isUUID';
import { delayTime } from "@decorators";
import { combineLatest } from 'rxjs';


@Directive()
export abstract class AppShareHBLBase extends AppList implements ICrystalReport {
    @ViewChild(ConfirmPopupComponent) confirmDeleteHBLPopup: ConfirmPopupComponent;
    @ViewChild('confirmDeleteJob') confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(InfoPopupComponent) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;

    houseBills: HouseBill[] = [];

    totalCBM: number;
    totalGW: number;
    totalCW: number;
    totalQty: number;

    selectedHbl: CsTransactionDetail;
    selectedTabSurcharge: string = 'BUY';
    selectedIndexHBL: number = -1;
    selectedHblId: string = null;

    shipmentDetail: CsTransaction;

    jobId: string = '';
    spinnerSurcharge: string = 'spinnerSurcharge';

    serviceType: CommonType.SERVICE_TYPE = 'sea';

    constructor(
        protected _sortService: SortService,
        protected _store: Store<IShareBussinessState>,
        protected _spinner: NgxSpinnerService,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        protected _documentRepo: DocumentationRepo,
        protected _activedRoute: ActivatedRoute


    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortLocal;
    }


    ngOnInit() {
        this.subscription = combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            (param: any) => {
                if (param.jobId && isUUID(param.jobId)) {
                    this.jobId = param.jobId;
                    if (param.selected) {
                        this.selectedHblId = param.selected;
                    }

                    this._store.dispatch(new GetListHBLAction({ jobId: this.jobId }));
                    this._store.dispatch(new TransactionGetDetailAction(this.jobId));
                    this.getDetailShipment();
                    this.getHouseBills(this.jobId);
                } else {
                    this.gotoList();
                }
            });

        this.configHBL();

        this.isLocked = this._store.select(getTransactionLocked);
        this.isLoading = this._store.select(getHBLLoadingState);

        // this._store.select(getSurchargeLoadingState).subscribe(
        //     (loading: boolean) => {
        //         if (loading) {
        //             this._spinner.show(this.spinnerSurcharge);
        //         } else {
        //             this._spinner.hide(this.spinnerSurcharge);
        //         }
        //     }
        // );

        this.listenShortcutMovingTab();
    }


    @delayTime(1000)
    showReport(): void {
        this.previewPopup.frm.nativeElement.submit();
        this.previewPopup.show();
    }

    configHBL() {
        // this.headers = [
        //     { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
        //     { title: 'Customer', field: 'customerName', sortable: true },
        //     { title: 'Salesman', field: 'saleManName', sortable: true },
        //     { title: 'Departure', field: 'finalDestinationPlace', sortable: true },
        //     { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
        //     { title: 'Package', field: 'packages', sortable: true },
        //     { title: 'C.W', field: 'cw', sortable: true },
        //     { title: 'G.W', field: 'gw', sortable: true },
        //     { title: 'CBM', field: 'cbm', sortable: true }
        // ];
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Salesman', field: 'saleManName', sortable: true },
            { title: 'Departure', field: 'finalDestinationPlace', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Package', field: 'packages', sortable: true },
            { title: 'C.W', field: 'cw', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Group', field: 'group', sortable: true },
            { title: 'Department', field: 'department', sortable: true }
        ];
    }

    sortLocal(sort: string): void {
        this.houseBills = this._sortService.sort(this.houseBills, sort, this.order);
    }

    getHouseBills(id: string) {
        this._store.select(getHBLSState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbls: any[]) => {
                    this.houseBills = hbls || [];
                    if (!!this.houseBills.length) {
                        this.totalGW = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.gw, 0);
                        this.totalCBM = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.cbm, 0);
                        this.totalCW = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.cw, 0);
                        this.totalQty = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.packageQty, 0);

                        if (this.selectedHblId) {
                            if (!this.houseBills.some((house: HouseBill) => house.id === this.selectedHblId)) {
                                this._toastService.error('This House Bill does not exist!');
                            }
                            const currenthbl = this.houseBills.find((house: HouseBill) => house.id === this.selectedHblId);
                            if (currenthbl) {
                                this.selectHBL(currenthbl);
                            }
                        } else {
                            this.selectHBL(this.houseBills[0]);
                        }
                    } else {
                        this.selectedHbl = null;

                        this._store.dispatch(new InitProfitHBLAction())
                    }
                }
            );
    }

    getDetailShipment() {
        this._store.select<any>(getTransactionDetailCsTransactionState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipmentDetail = res;
                    }
                },
            );
    }

    selectHBL(hbl: HouseBill) {
        if (!this.selectedHbl || !!this.selectedHbl && this.selectedHbl.id !== hbl.id) {
            this.selectedHbl = new CsTransactionDetail(hbl);

            // * Get container, Job detail, Surcharge with hbl id, JobId.
            //this._store.dispatch(new GetDetailHBLSuccessAction(hbl));
            this._store.dispatch(new GetDetailHBLAction(hbl.id));
            this._store.dispatch(new GetContainersHBLAction({ hblid: hbl.id }));
            if (this.serviceType === 'sea') {
                this._store.dispatch(new GetContainerAction({ mblid: this.jobId }));
            }
            this._store.dispatch(new GetProfitHBLAction(this.selectedHbl.id));
            switch (this.selectedTabSurcharge) {
                case 'BUY':
                    this._store.dispatch(new GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                    break;
                case 'SELL':
                    this._store.dispatch(LoadListPartnerForKeyInSurcharge(
                        { office: (this.selectedHbl as any)?.officeId, salemanId: (this.selectedHbl as any).saleManId, service: this.selectedHbl.transactionType })
                    );
                    this._store.dispatch(new GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                    break;
                case 'OBH':
                    this._store.dispatch(LoadListPartnerForKeyInSurcharge(
                        { office: (this.selectedHbl as any)?.officeId, salemanId: (this.selectedHbl as any).saleManId, service: this.selectedHbl.transactionType })
                    );
                    this._store.dispatch(new GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                    break;
                default:
                    break;
            }
        }
    }

    showDeletePopup(hbl: CsTransactionDetail, event: Event, index: number) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        this.confirmDeleteHBLPopup.show();
        this.selectedIndexHBL = index;
        this.selectedHbl = hbl;

    }

    onDeleteHbl() {
        this.confirmDeleteHBLPopup.hide();
        this.deleteHbl(this.selectedHbl.id);
    }

    deleteHbl(id: string) {
        this._progressRef.start();
        this._documentRepo.deleteHbl(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        if (this.selectedIndexHBL > -1) {
                            this.houseBills = [...this.houseBills.slice(0, this.selectedIndexHBL), ...this.houseBills.slice(this.selectedIndexHBL + 1)];
                            if (!!this.houseBills.length) {
                                this.selectHBL(this.houseBills[0]);
                            } else {
                                this.selectedHbl = null;
                                this._store.dispatch(new InitProfitHBLAction())
                            }
                        }
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    prepareDeleteJob() {
        this._documentRepo.checkPermissionAllowDeleteShipment(this.jobId)
            .subscribe((value: boolean) => {
                if (value) {
                    this.deleteJob();
                } else {
                    this.info403Popup.show();
                }
            });
    }

    deleteJob() {
        this._progressRef.start();
        this._documentRepo.checkMasterBillAllowToDelete(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.confirmDeleteJobPopup.show();
                    } else {
                        this.canNotDeleteJobPopup.show();
                    }
                },
            );
    }

    onDeleteJob() {
        this._progressRef.start();
        this._documentRepo.deleteMasterBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeleteJobPopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {

                        this._toastService.success(respone.message, 'Delete Success !');

                        this.gotoList();
                    }
                },
            );
    }

    onSelectTabSurcharge(tabName: string) {
        this.selectedTabSurcharge = tabName;

        if (!!this.selectedHbl) {
            switch (this.selectedTabSurcharge) {
                case 'BUY':
                    this._store.dispatch(new GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                    break;
                case 'SELL':
                    this._store.dispatch(new GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                    break;
                case 'OBH':
                    this._store.dispatch(new GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                    break;
                default:
                    break;
            }
        }
    }

    previewPLsheet(currency: string) {
        let hblid = "00000000-0000-0000-0000-000000000000";
        if (!!this.selectedHbl) {
            hblid = this.selectedHbl.id;
        }
        this._documentRepo.previewSIFPLsheet(this.jobId, hblid, currency)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        this.showReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    abstract gotoList(): void;
    abstract gotoCreate(): void;
    abstract gotoDetail(id: string): void;
    abstract onSelectTab(tabName: string): void;
    abstract duplicateConfirm(): void;

    public listenShortcutMovingTab(): void { }



}

