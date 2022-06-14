import { Component, OnInit, ViewChild } from '@angular/core';
import { PagingService, SortService } from '@services';
import { AccountingRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { InfoPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { AppList } from 'src/app/app.list';

import cloneDeep from 'lodash/cloneDeep';
import { finalize, catchError } from 'rxjs/operators';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-history-payment-import',
    templateUrl: './history-import-payment.component.html'
})
export class ARHistoryPaymentImportComponent extends AppList implements OnInit {

    @ViewChild(InfoPopupComponent) invaliDataAlert: InfoPopupComponent;

    data: IInvoicePaymentImport[];
    pagedItems: IInvoicePaymentImport[] = [];

    totalRows: number = 0;
    totalValidRows: number = 0;

    startIndex: number = 0;

    isShowInvalid: boolean = true;

    constructor(private pagingService: PagingService,
        private sortService: SortService,
        private accoutingRepo: AccountingRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortList;
        this.requestList = this.onPaging;

    }

    ngOnInit() {
        this.headers = [
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Serie No', field: 'serieNo', sortable: true },
            { title: 'Partner ID', field: 'partnerAccount', sortable: true },
            { title: 'Partner Name', field: 'partnerName', sortable: true },
            { title: 'Payment Amount', field: 'paymentAmount', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
            { title: 'Payment Method', field: 'paymentMethod', sortable: true },
            { title: 'Paid Date', field: 'paidDate', sortable: true },
            { title: 'Payment Type', field: 'paymentType', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];
    }

    pagingData(totalItem: number, currentPage: number) {
        const dataPaging: {
            startIndex: number,
            endIndex: number,
            pageSize: number,
            totalItems: number
        } = this.pagingService.getPager(totalItem, currentPage, this.pageSize);

        this.pagedItems = this.data.slice(dataPaging.startIndex, dataPaging.endIndex + 1);
        this.totalItems = dataPaging.totalItems;
        this.startIndex = dataPaging.startIndex;
    }

    onPaging(property: string) {
        this.pagingData(this.data.length, this.page);
    }

    sortList() {
        this.pagedItems = this.sortService.sort(this.pagedItems, this.sort, this.order);
    }

    hideInvalid() {
        if (!this.data.length) { return; }
        this.isShowInvalid = !this.isShowInvalid;

        if (this.isShowInvalid) {
            this.pagedItems = cloneDeep(this.data);
            this.totalItems = this.pagedItems.length;

        } else {
            const invalidData = this.data.filter(x => !x.isValid);
            this.pagedItems.length = 0;
            this.pagedItems = invalidData;
            this.totalItems = invalidData.length;
        }
    }

    chooseFile(file: Event) {
        if (file.target['files'] == null) { return; }
        this._progressRef.start();
        this.accoutingRepo.upLoadInvoicePaymentFile(file.target['files'])
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe((response: any) => {
                this.data = response.data;
                this.pagedItems = cloneDeep(this.data);

                this.page = 1;
                this.totalItems = this.data.length;

                this.totalValidRows = response.totalValidRows;
                this.totalRows = this.data.length;

                this.pagingData(this.data.length, this.page);
            }, () => {
            });
    }
    downloadSample() {
        this.accoutingRepo.downloadInvoicePaymentFile()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, "InvoicePaymentImportFile.xlsx");
                },
            );
    }

    import() {
        if (this.data == null) {
            this.invaliDataAlert.show();
            this._progressRef.complete();
            return;
        }
        if (this.data.length === 0) {
            this.invaliDataAlert.show();
            this._progressRef.complete();
            return;
        }
        if (this.totalRows - this.totalValidRows > 0) {
            this.invaliDataAlert.show();
            this._progressRef.complete();
        } else {
            const data = this.data.filter(x => x.isValid);
            this._progressRef.start();
            this.accoutingRepo.importInvoicePayment(data)
                .pipe(
                    finalize(() => {
                        this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }
}

interface IInvoicePaymentImport {
    paymentAmount: number;
    exchangeRate: number;
    isValid: boolean;

    currencyId: string;
    currencyIdError: string;
    exchangeRateError: string;
    invoiceNo: string;
    invoiceNoError: string;
    note: string;
    paidDate: string;
    paidDateError: string;
    partnerAccount: string;
    partnerAccountError: string;
    partnerId: string;
    partnerName: string;
    paymentAmountError: string;
    paymentMethod: string;
    paymentMethodError: string;
    paymentType: string;
    paymentTypeError: string;
    refId: string;
    serieNo: string;
    serieNoError: string;
    soaNo: string;
}
