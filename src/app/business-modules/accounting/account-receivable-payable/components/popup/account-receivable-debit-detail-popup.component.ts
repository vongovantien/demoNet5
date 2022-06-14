import { Component, Input, OnInit, Output } from '@angular/core';
import { SystemConstants } from '@constants';
import { ExportRepo } from '@repositories';
import { SortService } from '@services';
import { PopupBase } from 'src/app/popup.base';
import { AccReceivableDebitDetailModel } from 'src/app/shared/models/accouting/accounting-receivable.model';

@Component({
    selector: 'account-receivable-debit-detail-popup',
    templateUrl: './account-receivable-debit-detail-popup.component.html'
})
export class AccReceivableDebitDetailPopUpComponent extends PopupBase implements OnInit {
    @Output() dataDebitList: AccReceivableDebitDetailModel[] = []
    @Input() dataSearch: {};
    headers = [
        { title: 'No', field: '', sortable: true },
        { title: 'Biiling no', field: 'billingNo', sortable: true },
        { title: 'Type', field: 'type', sortable: true },
        { title: 'Invoice No', field: 'invoiceNo', sortable: true },
        { title: 'Total VND', field: 'totalAmountVND', sortable: true },
        { title: 'Total USD', field: 'totalAmountUSD', sortable: true },
        { title: 'Paid VND', field: 'paidAmountVND', sortable: true },
        { title: 'Paid USD', field: 'paidAmountUSD', sortable: true },
        { title: 'Unpaid VND', field: 'unpaidAmountVND', sortable: true },
        { title: "Unpaid USD", field: 'unpaidAmountUSD', sortable: true },
        { title: "Services", field: 'service', sortable: true },
        { title: "Salesman", field: 'salesman', sortable: true },
        { title: "Overdue Days", field: 'overdueDays', sortable: true },
        { title: "Due Days", field: 'paymentDueDate', sortable: true },
        { title: 'Office', field: 'code', sortable: true },
    ];

    sumTotalObj = {
        totalVND: 0,
        totalUSD: 0,
        totalpaidVND: 0,
        totalpaidUSD: 0,
        totalunpaidVND: 0,
        totalunpaidUSD: 0,
    };

    constructor(
        private _sortService: SortService,
        private _exportRepo: ExportRepo,
    ) {
        super();
        this.requestSort = this.sortTrialOfficalList;
    }

    ngOnInit() {

    }

    closePopup() {
        this.resetForm();
        this.hide();
    }

    resetForm() {
        this.dataDebitList = [];

        this.sumTotalObj.totalVND = 0;
        this.sumTotalObj.totalUSD = 0;
        this.sumTotalObj.totalpaidVND = 0;
        this.sumTotalObj.totalpaidUSD = 0;
        this.sumTotalObj.totalunpaidVND = 0;
        this.sumTotalObj.totalunpaidUSD = 0;
    }
    sortTrialOfficalList(sortField: string, order: boolean) {
        this.dataDebitList = this._sortService.sort(this.dataDebitList, sortField, order);
    }

    calculateTotal() {
        for (let index = 0; index < this.dataDebitList.length; index++) {
            const item: AccReceivableDebitDetailModel = this.dataDebitList[index];
            this.sumTotalObj.totalVND += (+item.totalAmountVND ?? 0);
            this.sumTotalObj.totalUSD += (+item.totalAmountUSD ?? 0);
            this.sumTotalObj.totalpaidVND += (+item.paidAmountVND ?? 0);
            this.sumTotalObj.totalpaidUSD += (+item.paidAmountUSD ?? 0);
            this.sumTotalObj.totalunpaidVND += (+item.unpaidAmountVND ?? 0);
            this.sumTotalObj.totalunpaidUSD += (+item.unpaidAmountUSD ?? 0)
        }
    }

    exportExcel() {
        this._exportRepo.exportAccountingReceivableDebitDetail(this.dataSearch)
            .subscribe(
                (res: Blob) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'DebitDetail.xlsx');
                }
            );
    }

}
