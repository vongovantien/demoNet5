import { Component, ViewChild } from "@angular/core";
import { PopupBase } from "@app";
import { SortService } from "@services";
import { AdvancePayment } from "@models";
import { AccountingRepo } from "@repositories";
import { catchError, finalize, map } from "rxjs/operators";
import { NgProgress } from "@ngx-progressbar/core";
import { InfoPopupComponent, ReportPreviewComponent } from "@common";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'advance-payments-popup',
    templateUrl: './advance-payments.popup.html'
})

export class AdvancePaymentsPopupComponent extends PopupBase {
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;

    dataSearchList: any = null;
    page: number = 1;
    pageSize: number = 15;

    advancePayments: AdvancePayment[] = [];
    advancePaymentsInit: AdvancePayment[] = [];
    headers: CommonInterface.IHeaderTable[];

    checkAll = false;
    dataReport: any = null;
    constructor(
        private _sortService: SortService,
        private _accoutingRepo: AccountingRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestSort = this.sortAdvancePayment;
        this.requestList = this.getListAdvancePayment;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Advance No', field: 'advanceNo', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'advanceCurrency', sortable: true },
            { title: 'Requester', field: 'requester', sortable: true },
            { title: 'Request Date', field: 'requestDate', sortable: true },
            { title: 'Status Approval', field: 'statusApprovalName', sortable: true },
        ];
    }

    closePopup() {
        this.keyword = '';
        this.checkAll = false;
        this.advancePayments.forEach(x => {
            x.isChecked = false;
        });
        this.hide();
    }

    checkAllChange() {
        if (this.checkAll) {
            this.advancePayments.forEach(x => {
                x.isChecked = true;
            });
        } else {
            this.advancePayments.forEach(x => {
                x.isChecked = false;
            });
        }
    }

    removeAllChecked() {
        this.checkAll = false;
    }

    sortAdvancePayment(sort: string): void {
        if (!!sort) {
            this.advancePayments = this._sortService.sort(this.advancePayments, sort, this.order);
        }
    }

    getListAdvancePayment() {
        this.isLoading = true;
        this._progressRef.start();
        this._accoutingRepo.getListAdvancePayment(this.page, this.pageSize, this.dataSearchList)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
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
                    this.advancePaymentsInit = res.data || [];
                },
            );
    }

    printMultiple() {
        const objChecked = this.advancePayments.find(x => x.isChecked);
        const advanceIds = [];
        if (!objChecked) {
            this.infoPopup.title = 'Cannot Print Multiple Advance!';
            this.infoPopup.body = 'Opps, Please check advance to print';
            this.infoPopup.show();
            return;
        } else {
            this.advancePayments.forEach(item => {
                if (item.isChecked) {
                    advanceIds.push(item.id);
                }
            });
            this.previewMultiple(advanceIds);
        }
    }

    previewMultiple(advancePaymentIds: string[]) {
        this._progressRef.start();
        this._accoutingRepo.previewAdvancePaymentMultiple(advancePaymentIds)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
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

    onChangeKeyword(keyword: string) {
        this.checkAll = false;
        this.advancePayments = this.advancePaymentsInit;
        // TODO improve search.
        if (!!keyword) {
            if (keyword.indexOf('\\') !== -1) { return this.advancePayments = []; }
            keyword = keyword.toLowerCase();
            const data = this.advancePayments.filter((item: any) =>
                item.advanceNo.toLowerCase().toString().search(keyword) !== -1
                || item.requesterName.toLowerCase().toString().search(keyword) !== -1
                || item.statusApprovalName.toLowerCase().toString().search(keyword) !== -1);

            return this.advancePayments = data;
        } else {
            this.advancePayments = this.advancePaymentsInit;
        }
    }

    clearFilter() {
        this.keyword = '';
        this.checkAll = false;
        this.advancePayments.forEach(x => {
            x.isChecked = false;
        });
        this.onChangeKeyword(this.keyword);
    }
}