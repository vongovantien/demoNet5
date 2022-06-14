import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';

import { AccountingRepo } from '@repositories';
import { InfoPopupComponent } from '@common';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { PagingService } from '@services';

import { catchError, finalize } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-accounting-import-vat-invoice',
    templateUrl: './accounting-import-vat-invoice.component.html',
})
export class AccountingManagementImportVatInvoiceComponent extends AppList implements OnInit {
    @ViewChild(InfoPopupComponent) invaliDataAlert: InfoPopupComponent;

    totalRows: number = 0;
    totalValidRows: number = 0;

    data: IImportVatInvoice[] = [];
    tempData: IImportVatInvoice[] = [];

    isShowInvalid: boolean = true;

    constructor(
        private _accountingRepo: AccountingRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _pagingService: PagingService
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.onPaging;
    }

    ngOnInit(): void {
        this.headers = [
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Real Invoice', field: 'realInvoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Serie', field: 'serieNo', sortable: true },
            { title: 'Payment Status', field: 'paymentStatus', sortable: true },

        ];
    }

    downloadSample() {
        this._accountingRepo.downLoadVatInvoiceImportTemplate()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, "VatInvoiceImportTemplate.xlsx");
                },
            );
    }

    chooseFile(e: Event) {
        if (e.target['files'] == null) { return; }
        this._progressRef.start();
        this.isLoading = true;
        this._accountingRepo.uploadVatInvoiceImportFile(e.target['files'])
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                    this.isLoading = false;
                })
            )
            .subscribe((response: CommonInterface.IResponseImport) => {
                this.data = response.data;
                this.tempData = cloneDeep(this.data);

                this.page = 1;
                this.totalItems = this.data.length;

                this.totalValidRows = response.totalValidRows;
                this.totalRows = this.data.length;

                this.pagingData(this.data.length, this.page);
            });
    }

    pagingData(totalItem: number, currentPage: number) {
        const dataPaging: {
            startIndex: number,
            endIndex: number,
            pageSize: number,
            totalItems: number
        } = this._pagingService.getPager(totalItem, currentPage, this.pageSize);
        this.tempData = this.data.slice(dataPaging.startIndex, dataPaging.endIndex + 1);
        this.totalItems = dataPaging.totalItems;
    }

    onPaging() {
        this.pagingData(this.data.length, this.page);
    }

    hideInvalid() {
        if (!this.data.length) { return; }
        this.isShowInvalid = !this.isShowInvalid;

        if (this.isShowInvalid) {
            this.tempData = cloneDeep(this.data);
            this.totalItems = this.tempData.length;

        } else {
            const invalidData = this.data.filter(x => !x.isValid);
            this.tempData.length = 0;
            this.tempData = invalidData;
            this.totalItems = invalidData.length;
        }
    }

    importVatInvoice() {
        if (!this.data.length) {
            this.invaliDataAlert.show();
            return;
        }
        if (this.totalRows - this.totalValidRows > 0) {
            this.invaliDataAlert.show();
            return;
        }
        if (this.data.some(x => !x.isValid)) {
            this.invaliDataAlert.show();
            return;
        }
        this._progressRef.start();
        this._accountingRepo.importVatInvoice(this.data.filter(x => x.isValid))
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                    this.isLoading = false;
                })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}

interface IImportVatInvoice {
    voucherId: string;
    realInvoiceNo: string;
    invoiceDate: string;
    serieNo: string;
    isValid: string;
    paymentStatus: string;
}
