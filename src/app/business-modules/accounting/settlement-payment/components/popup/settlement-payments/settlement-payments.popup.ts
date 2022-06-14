import { InfoPopupComponent, ReportPreviewComponent } from "@common";
import { Component, ViewChild } from "@angular/core";
import { SortService } from "@services";
import { AccountingRepo } from "@repositories";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { PopupBase } from "@app";
import { SettlementPayment } from "@models";
import { catchError, finalize, map } from "rxjs/operators";
import { delayTime } from "@decorators";
import { InjectViewContainerRefDirective } from "@directives";

@Component({
    selector: 'settlement-payments-popup',
    templateUrl: './settlement-payments.popup.html'
})

export class SettlementPaymentsPopupComponent extends PopupBase {
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(InjectViewContainerRefDirective) confirmPopupContainerRef: InjectViewContainerRefDirective;
    
    dataSearchList: any = null;
    page: number = 1;
    pageSize: number = 15;

    headers: CommonInterface.IHeaderTable[];
    settlements: SettlementPayment[] = [];
    settlementsInit: SettlementPayment[] = [];

    checkAll = false;
    dataReport: any = null;
    constructor(
        private _sortService: SortService,
        private _accoutingRepo: AccountingRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestSort = this.sortSettlementPayment;
        this.requestList = this.getListSettlePayment;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Settlement No', field: 'settlementNo', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'chargeCurrency', sortable: true },
            { title: 'Requester', field: 'requester', sortable: true },
            { title: 'Request Date', field: 'requestDate', sortable: true },
            { title: 'Status Approval', field: 'statusApproval', sortable: true },
        ];
    }

    closePopup() {
        this.keyword = '';
        this.checkAll = false;
        this.settlements.forEach(x => {
            x.isSelected = false;
        });
        this.hide();
    }

    checkAllSettlement() {
        if (this.checkAll) {
            this.settlements.forEach(x => {
                x.isSelected = true;
            });
        } else {
            this.settlements.forEach(x => {
                x.isSelected = false;
            });
        }
    }

    removeAllChecked() {
        this.checkAll = false;
    }

    getListSettlePayment() {
        this.isLoading = true;
        this._progressRef.start();
        this._accoutingRepo.getListSettlementPayment(this.page, this.pageSize, this.dataSearchList)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new SettlementPayment(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.settlements = res.data || [];
                    this.settlementsInit = res.data || 0;
                },
            );
    }

    sortSettlementPayment(sort: string): void {
        if (!!sort) {
            this.settlements = this._sortService.sort(this.settlements, sort, this.order);
        }
    }

    printMultiple() {
        const objChecked = this.settlements.find(x => x.isSelected);
        const settlementNos = [];
        if (!objChecked) {
            this.infoPopup.title = 'Cannot Print Multiple Settlement!';
            this.infoPopup.body = 'Opps, Please check settlement to print';
            this.infoPopup.show();
            return;
        } else {
            this.settlements.forEach(item => {
                if (item.isSelected) {
                    settlementNos.push(item.settlementNo);
                }
            });
            this.previewMultiple(settlementNos);
        }
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
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

    previewMultiple(settlementNos: string[]) {
        this._progressRef.start();
        this._accoutingRepo.previewSettlementPaymentMultiple(settlementNos)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
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

    onChangeKeyword(keyword: string) {
        this.checkAll = false;
        this.settlements = this.settlementsInit;
        // TODO improve search.
        if (!!keyword) {
            if (keyword.indexOf('\\') !== -1) { return this.settlements = []; }
            keyword = keyword.toLowerCase();
            const data = this.settlements.filter((item: any) =>
                item.settlementNo.toLowerCase().toString().search(keyword) !== -1
                || item.requesterName.toLowerCase().toString().search(keyword) !== -1
                || item.statusApprovalName.toLowerCase().toString().search(keyword) !== -1);

            return this.settlements = data;
        } else {
            this.settlements = this.settlementsInit;
        }
    }

    clearFilter() {
        this.keyword = '';
        this.checkAll = false;
        this.settlements.forEach(x => {
            x.isSelected = false;
        });
        this.onChangeKeyword(this.keyword);
    }
}