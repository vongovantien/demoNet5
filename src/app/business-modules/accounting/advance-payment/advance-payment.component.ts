import { Component, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { Store } from '@ngrx/store';
import { RoutingConstants } from '@constants';
import { NgProgress } from '@ngx-progressbar/core';

import { AppList } from '@app';
import { AccountingRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { AdvancePayment, AdvancePaymentRequest, User } from '@models';
import { AccountingConstants, SystemConstants } from '@constants';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';
import { ConfirmPopupComponent, Permission403PopupComponent, InfoPopupComponent, ReportPreviewComponent } from '@common';
import { InjectViewContainerRefDirective, ContextMenuDirective } from '@directives';


import { UpdatePaymentVoucherPopupComponent } from './components/popup/update-payment-voucher/update-payment-voucher.popup';
import { AdvancePaymentFormsearchComponent } from './components/form-search-advance-payment/form-search-advance-payment.component';
import { AdvancePaymentsPopupComponent } from './components/popup/advance-payments/advance-payments.popup';

import { catchError, finalize, map, takeUntil, withLatestFrom, concatMap } from 'rxjs/operators';
import {
    LoadListAdvancePayment,
    getAdvancePaymentListState,
    getAdvancePaymentSearchParamsState,
    getAdvancePaymentListLoadingState,
    getAdvancePaymentListPagingState
} from './store';
import { AccountingSelectAttachFilePopupComponent } from '../components/select-attach-file/select-attach-file.popup';
import { of, forkJoin } from 'rxjs';
import { delayTime } from '@decorators';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-advance-payment',
    templateUrl: './advance-payment.component.html',
})
export class AdvancePaymentComponent extends AppList {

    @ViewChild(AdvancePaymentFormsearchComponent) formSearch: AdvancePaymentFormsearchComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;
    @ViewChild(UpdatePaymentVoucherPopupComponent) popupUpdateVoucher: UpdatePaymentVoucherPopupComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    // @ViewChild('confirmRemoveSelectedVoucher') confirmRemoveSelectedVoucher: ConfirmPopupComponent;
    @ViewChild(AdvancePaymentsPopupComponent) advancePaymentsPopup: AdvancePaymentsPopupComponent;
    @ViewChild(AccountingSelectAttachFilePopupComponent) selectAttachPopup: AccountingSelectAttachFilePopupComponent;

    @ViewChild(InjectViewContainerRefDirective) public confirmPopupContainerRef: InjectViewContainerRefDirective;
    @ViewChildren(ContextMenuDirective) queryListMenuContext: QueryList<ContextMenuDirective>;

    headers: CommonInterface.IHeaderTable[];
    headerGroupRequest: CommonInterface.IHeaderTable[];

    advancePayments: AdvancePayment[] = [];
    selectedAdv: AdvancePayment;

    groupRequest: AdvancePaymentRequest[] = [];
    userLogged: User;

    advancePaymentIds: string[] = [];

    messageVoucherExisted: string = '';

    advanceSyncIds: any[] = [];
    action = { action: "carrier" };

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _exportRepo: ExportRepo,
        private _router: Router,
        private _store: Store<IAppState>,
    ) {
        super();
        this.requestList = this.requestLoadListAdvancePayment;
        this.requestSort = this.sortAdvancePayment;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.headers = [
            { title: 'Advance No', field: 'advanceNo', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'advanceCurrency', sortable: true },
            { title: 'Requester', field: 'requester', sortable: true },
            { title: 'Department', field: 'departmentName', sortable: true },
            { title: 'Payee', field: 'payeeName', sortable: true },
            { title: 'Request Date', field: 'requestDate', sortable: true },
            { title: 'Deadline Date', field: 'deadlinePayment', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
            { title: 'Status Approval', field: 'statusApprovalName', sortable: true },
            { title: 'Status Payment', field: 'statusApproval', sortable: true },
            { title: 'Payment Method', field: 'paymentMethod', sortable: true },
            { title: 'Description', field: 'advanceNote', sortable: true },
            { title: 'Voucher No', field: 'voucherNo', sortable: true },
            { title: 'Voucher Date', field: 'voucherDate', sortable: true },
            { title: 'Sync Date', field: 'lastSyncDate', sortable: true },
            { title: 'Sync Status', field: 'syncStatus', sortable: true },
            { title: 'User Modified', field: 'user', sortable: true },

        ];

        this.headerGroupRequest = [
            { title: 'JobId', field: 'jobId', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'requestCurrency', sortable: true },
            { title: 'Status Payment', field: 'statusPayment', sortable: true },
        ];

        this.getUserLogged();


        this.getListAdvancePayment();

        this._store.select(getAdvancePaymentSearchParamsState)
            .pipe(
                withLatestFrom(this._store.select(getAdvancePaymentListPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data) => {
                    if (!!data.dataSearch) {
                        this.dataSearch = data.dataSearch;
                    }

                    this.page = data.page;
                    this.pageSize = data.pageSize;

                    this.requestLoadListAdvancePayment();
                }
            );

        this.isLoading = this._store.select(getAdvancePaymentListLoadingState);
    }

    requestLoadListAdvancePayment() {
        this._store.dispatch(LoadListAdvancePayment({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    getListAdvancePayment() {
        this._store.select(getAdvancePaymentListState)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new AdvancePayment(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.advancePayments = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
    }

    sortAdvancePayment(sort: string): void {
        if (!!sort) {
            this.advancePayments = this._sortService.sort(this.advancePayments, this.sort, this.order);
        }
    }

    sortByCollapse(sort: CommonInterface.ISortData): void {
        if (!!sort.sortField) {
            this.groupRequest = this._sortService.sort(this.groupRequest, sort.sortField, sort.order);
        }
    }

    onDeleteAdvPayment() {
        this._progressRef.start();
        this._accoutingRepo.deleteAdvPayment(this.selectedAdv.advanceNo)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, 'Delete Success');
                        this.requestLoadListAdvancePayment();
                    }
                },
            );
    }

    prepareDeleteAdvance(selectedAdv: AdvancePayment) {
        this._accoutingRepo.checkAllowDeleteAdvance(selectedAdv.id)
            .subscribe((value: any) => {
                if (value.status) {
                    this.selectedAdv = new AdvancePayment(selectedAdv);

                    this.showPopupDynamicRender<ConfirmPopupComponent>(
                        ConfirmPopupComponent,
                        this.confirmPopupContainerRef.viewContainerRef, {
                        body: 'Do you want to delete ?',
                        labelConfirm: 'Yes',
                        labelCancel: 'No'
                    }, () => {
                        this.onDeleteAdvPayment();
                    })
                } else {
                    if (!!value.message) {
                        this._toastService.error(value.message, value.title);
                    } else {
                        this.permissionPopup.show();
                    }
                }
            });
    }

    getRequestAdvancePaymentGroup(advanceNo: string, index: number) {
        if (!!this.advancePayments[index].advanceRequests.length) {
            this.groupRequest = this.advancePayments[index].advanceRequests;
        } else {
            this._progressRef.start();
            this._accoutingRepo.getGroupRequestAdvPayment(advanceNo)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                )
                .subscribe(
                    (res: any) => {
                        this.groupRequest = res;
                        this.advancePayments[index].advanceRequests = res;
                    },
                );
        }
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.dataSearch = { requester: this.userLogged.id };
    }

    viewDetail(adv: AdvancePayment) {
        this._accoutingRepo.checkAllowGetDetailAdvance(adv.id)
            .subscribe((value: boolean) => {
                if (value) {
                    switch (adv.statusApproval) {
                        case 'New':
                        case 'Denied':
                            if (!adv.advanceFor || !adv.advanceFor.length) {
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${adv.id}`]);
                            } else {
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${adv.id}`], {
                                    queryParams: Object.assign({}, this.action)
                                });
                            }
                            break;
                        default:

                            if (!adv.advanceFor || !adv.advanceFor.length) {
                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${adv.id}/approve`]);
                            } else {

                                this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/${adv.id}/approve`], {
                                    queryParams: Object.assign({}, this.action)
                                });
                            }
                            break;
                    }
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    export() {
        this._exportRepo.exportAdvancePaymentShipment(this.dataSearch)
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                }
            );
    }

    checkAllChange() {
        if (this.isCheckAll) {
            this.advancePayments.forEach(x => {
                if (x.statusApproval === 'Done' && x.syncStatus !== AccountingConstants.SYNC_STATUS.SYNCED && !x.voucherNo) {
                    x.isChecked = true;
                }
            });
        } else {
            this.advancePayments.forEach(x => {
                x.isChecked = false;
            });
        }
    }

    removeAllChecked() {
        this.isCheckAll = false;
    }

    showPopupUpdateVoucher() {
        this.infoPopup.title = 'Cannot Update Voucher';
        this.infoPopup.body = 'Opps, Please check advance to update voucher !!';
        this.messageVoucherExisted = '';
        this.popupUpdateVoucher.voucherNo.setValue(null);
        this.popupUpdateVoucher.voucherDate.setValue(null);
        this.popupUpdateVoucher.isSubmitted = false;
        const objChecked = this.advancePayments.find(x => x.isChecked);
        if (!objChecked) {
            this.infoPopup.show();
            return;
        } else {
            const lstadvancePaymentsToCheck = this.advancePayments.filter(x => x.isChecked);
            this._accoutingRepo.checkExistedVoucherInAdvance(lstadvancePaymentsToCheck)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        if (!!res && res.lstVoucherData.length > 0) {
                            res.lstVoucherData.forEach(item => {
                                this.messageVoucherExisted += item.advanceNo + " has existed in " + item.voucherNo + "<br>";
                            });
                            this.messageVoucherExisted += "<br>" + " Would you like to keep updating?";

                            this.showPopupDynamicRender<ConfirmPopupComponent>(
                                ConfirmPopupComponent,
                                this.confirmPopupContainerRef.viewContainerRef, {
                                title: 'Voucher Existed',
                                body: this.messageVoucherExisted,
                                labelConfirm: 'Yes',
                                labelCancel: 'No'
                            }, () => {
                                this.popupUpdateVoucher.show();
                            })
                        } else {
                            this.popupUpdateVoucher.show();
                        }
                    }
                );
        }
    }

    onSubmitUpdateVoucher() {
        this.popupUpdateVoucher.show();
    }

    removeSelectedVoucher() {
        const objChecked = this.advancePayments.find(x => x.isChecked);
        if (!objChecked) {
            this.infoPopup.title = 'Cannot Remove Voucher!';
            this.infoPopup.body = 'Opps, Please check advance to remove voucher';
            this.infoPopup.show();
            return;
        } else if (objChecked.voucherNo != null) {

            // this.confirmRemoveSelectedVoucher.show();
            this.showPopupDynamicRender<ConfirmPopupComponent>(
                ConfirmPopupComponent,
                this.confirmPopupContainerRef.viewContainerRef,    // ? View ContainerRef chứa UI popup khi render 
                {
                    title: 'Confirm remove selected voucher',
                    body: 'Are you sure you want to remove selected payment vouchers?',   // ? Config confirm popup
                    iconConfirm: 'la la-cloud-upload',
                    labelConfirm: 'Yes',
                    center: true
                },
                (v: boolean) => {                                   // ? Hàm Callback khi sumit
                    this.onRemoveSelectedVoucher();
                });
        } else {
            this.infoPopup.title = 'Not Have Voucher!';
            this.infoPopup.body = 'Opps, Advance do not have voucher';
            this.infoPopup.show();
        }
    }

    onRemoveSelectedVoucher() {
        // this.confirmRemoveSelectedVoucher.hide();
        this.advancePaymentIds = [];
        this.advancePayments.forEach(item => {
            if (item.isChecked) {
                this.advancePaymentIds.push(item.id);
            }
        });
        const body: any = {
            advancePaymentIds: this.advancePaymentIds,
            voucherNo: null,
            voucherDate: null
        };
        this.updateVoucherAdvancePayment(body);
    }

    applyVoucher($event: any) {
        const objVoucher = $event;
        this.advancePaymentIds = [];
        this.advancePayments.forEach(item => {
            if (item.isChecked) {
                this.advancePaymentIds.push(item.id);
            }
        });

        const body: any = {
            advancePaymentIds: this.advancePaymentIds,
            voucherNo: objVoucher.voucherNo,
            voucherDate: !!objVoucher.voucherDate && !!objVoucher.voucherDate.startDate ? formatDate(objVoucher.voucherDate.startDate, 'yyyy-MM-dd', 'en') : null
        };
        this.updateVoucherAdvancePayment(body);
    }

    updateVoucherAdvancePayment(body: any) {
        this._accoutingRepo.updateVoucherAdvancePayment(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.isCheckAll = false;
                        this.requestLoadListAdvancePayment();
                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    showPopupListAdvance() {
        this.advancePaymentsPopup.dataSearchList = this.dataSearch;
        this.advancePaymentsPopup.page = this.page;
        this.advancePaymentsPopup.pageSize = this.pageSize;
        this.advancePaymentsPopup.getListAdvancePayment();
        this.advancePaymentsPopup.show();
    }

    syncBravo() {
        const advanceSyncList = this.advancePayments.filter(x => x.isChecked && x.statusApproval === 'Done');
        if (!advanceSyncList.length) {
            this._toastService.warning("Please select advance to sync");
            return;
        }

        if (advanceSyncList.length === this.pageSize) {
            this._toastService.warning("Exceed " + this.pageSize + " items");
            return;
        }

        const hasSynced: boolean = advanceSyncList.some(x => x.syncStatus === AccountingConstants.SYNC_STATUS.SYNCED);
        if (hasSynced) {
            const advanceHasSynced: string = advanceSyncList.filter(x => x.syncStatus === AccountingConstants.SYNC_STATUS.SYNCED).map(a => a.advanceNo).toString();
            this._toastService.warning(`${advanceHasSynced} had synced, Please recheck!`);
            return;
        }

        this.showPopupDynamicRender<ConfirmPopupComponent>(
            ConfirmPopupComponent,
            this.confirmPopupContainerRef.viewContainerRef,    // ? View ContainerRef chứa UI popup khi render 
            {
                body: `Are you sure you want to sync <span class="font-weight-bold">${advanceSyncList.map(x => x.advanceNo).join()}</span> to accountant system ?`,   // ? Config confirm popup
                iconConfirm: 'la la-cloud-upload',
                labelConfirm: 'Yes',
                center: true
            },
            (v: boolean) => {                                   // ? Hàm Callback khi sumit
                this.selectAttachPopup.show();
            });


        let sub = this.selectAttachPopup.onSelect
            .pipe(
                takeUntil(this.ngUnsubscribe),
                concatMap((value: any) => {
                    if (!!value) {
                        const advSyncIds: string[] = advanceSyncList.map(x => x.id);
                        const mapV: { lang: string, id: string }[] = Array(advanceSyncList.length).fill(value).map((value, i) => {
                            return { lang: value === 1 ? 'VN' : 'ENG', id: advSyncIds[i] }
                        })
                        const source = mapV.map(x => this._exportRepo.exportAdvancePaymentDetail(x.id, x.lang))
                        return forkJoin(source);
                    }
                    return of(false);
                }),
                concatMap((data: CommonInterface.IResult[]) => {
                    if (!!data.length) {
                        const advSyncModel = advanceSyncList.map((x: AdvancePayment) => {
                            return <AccountingInterface.IRequestFileType>{
                                Id: x.id,
                                action: x.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
                                fileName: this.getFileName(data, x.id)
                            };
                        });
                        console.log(advSyncModel);
                        return this._accoutingRepo.syncAdvanceToAccountant(advSyncModel);
                    }
                }),
                catchError(this.catchError)
            )
            .subscribe(
                (res) => {
                    if (((res as CommonInterface.IResult)?.status)) {
                        this._toastService.success("Sync Data to Accountant System Successful");

                        this.requestLoadListAdvancePayment();
                    } else {
                        this._toastService.error("Sync Data Fail");
                    }
                    sub.unsubscribe();

                },
                (error) => {
                    console.log(error);
                }, () => {
                    sub.unsubscribe();
                }
            )
    }

    getFileName(data: CommonInterface.IResult[], id: string) {
        let url: string = '';
        data.forEach(x => {
            const advId: string[] = x.data.match(SystemConstants.CPATTERN.GUID)
            if (advId[0] === id) {
                url = x.data;
            }
        })

        return url;
    }

    denyAdvance() {
        const advancesDenyList = this.advancePayments.filter(x => x.isChecked && x.statusApproval !== AccountingConstants.STATUS_APPROVAL.NEW
            && x.syncStatus !== AccountingConstants.SYNC_STATUS.SYNCED);
        if (!advancesDenyList.length) {
            this._toastService.warning("Please select correct advance payment to deny");
            return;
        }

        const hasDenied: boolean = advancesDenyList.some(x => x.statusApproval === 'Denied');
        if (hasDenied) {
            const advanceHasDenied: string = advancesDenyList.filter(x => x.statusApproval === 'Denied').map(a => a.advanceNo).toString();
            this._toastService.warning(`${advanceHasDenied} had denied, Please recheck!`);
            return;
        }

        const advIds: string[] = advancesDenyList.map((x: AdvancePayment) => x.id);
        if (!advIds.length) {
            return;
        }

        this.showPopupDynamicRender<ConfirmPopupComponent>(
            ConfirmPopupComponent,
            this.confirmPopupContainerRef.viewContainerRef,
            { body: `Are you sure you want to deny <span class="font-weight-bold">${advancesDenyList.map(x => x.advanceNo).join()}</span> advance payments ?` },
            (v: boolean) => {
                this.onDenyAdvance(advIds);
            });
    }

    onDenyAdvance(advIds: string[]) {
        this._accoutingRepo.denyAdvancePayments(advIds)
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.requestLoadListAdvancePayment();
                    }
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    onCreateAdvCarrier() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.ADVANCE_PAYMENT}/new`], {
            queryParams: Object.assign({}, this.action)
        });
    }

    onSelectAdv(adv: AdvancePayment) {
        this.selectedAdv = adv;

        this.clearMenuContext(this.queryListMenuContext);

    }

    syncAdvItem() {
        if (!this.selectedAdv) {
            return;
        }
        const currentAdv: AdvancePayment = Object.assign({}, this.selectedAdv);

        this.showPopupDynamicRender<ConfirmPopupComponent>(
            ConfirmPopupComponent,
            this.confirmPopupContainerRef.viewContainerRef,
            {
                body: `Are you sure you want to sync <span class="font-weight-bold">${currentAdv.advanceNo}</span> to accountant system ?`,
                iconConfirm: 'la la-cloud-upload',
                labelConfirm: 'Yes',
                center: true
            },
            (v: boolean) => {
                this.selectAttachPopup.show();
            });

        // * listen event select file.
        this.listenSelectFileAttachAndSyncAdv(currentAdv);
    }

    listenSelectFileAttachAndSyncAdv(adv: AdvancePayment) {
        let sub = this.selectAttachPopup.onSelect
            .pipe(
                takeUntil(this.ngUnsubscribe),
                concatMap((value: any) => {
                    if (!!value) {
                        const lang: string = value === 1 ? 'VN' : 'ENG';
                        return this._exportRepo.exportAdvancePaymentDetail(adv.id, lang);
                    }
                    return of(false);
                }),
                map((exportData) => {
                    if (!exportData) throw new Error("error: ");
                    return exportData?.data // url preview
                }),
                concatMap((url: any) => {
                    const syncModel = [adv].map((x: AdvancePayment) => {
                        return <AccountingInterface.IRequestFileType>{
                            Id: x.id,
                            action: x.syncStatus === AccountingConstants.SYNC_STATUS.REJECTED ? 'UPDATE' : 'ADD',
                            fileName: url
                        };
                    });
                    return this._accoutingRepo.syncAdvanceToAccountant(syncModel)
                }),
                catchError(this.catchError)
            )
            .subscribe(
                (res) => {
                    sub.unsubscribe();
                    if (((res as CommonInterface.IResult)?.status)) {
                        this._toastService.success("Sync Data to Accountant System Successful");

                        this.requestLoadListAdvancePayment();
                    } else {
                        this._toastService.error("Sync Data Fail");
                    }
                },
                (error) => {
                    sub.unsubscribe();
                    console.log(error);
                },
                () => {
                    sub.unsubscribe();

                }
            )
    }

    denyAdvItem() {
        if (!this.selectedAdv) {
            return;
        }
        const currentAdv: AdvancePayment = Object.assign({}, this.selectedAdv);

        if (currentAdv.statusApproval === 'Denied') {
            this._toastService.warning(`${currentAdv.advanceNo} had denied, Please recheck!`);

            return;
        }
        this.showPopupDynamicRender<ConfirmPopupComponent>(
            ConfirmPopupComponent,
            this.confirmPopupContainerRef.viewContainerRef,
            { body: `Are you sure you want to deny <span class="font-weight-bold">${currentAdv.advanceNo}</span> payments ?`, center: true },
            (v: boolean) => {
                this.onDenyAdvance([currentAdv.id]);
            });
    }

    previewAdvPayment(adv: AdvancePayment) {
        this._accoutingRepo
            .previewAdvancePayment(adv.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (res.dataSource.length > 0) {
                        this.renderAndShowReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }


    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.confirmPopupContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.confirmPopupContainerRef.viewContainerRef.clear();
            });
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
    }

    exportAdvPayment(adv: AdvancePayment, lang: string) {
        this._exportRepo
            .exportAdvancePaymentDetail(adv.id, lang)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe((response: any) => {
                if (response?.data) {
                    this._exportRepo.previewExport(response.data);
                }
            });
    }
}


