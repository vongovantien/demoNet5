import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { formatDate } from '@angular/common';
import { catchError, finalize } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromShareBussiness from './../../../share-business/store';
import { ShareBusinessFormSearchImportJobComponent } from './components/form-search-import/form-search-import-job-detail.component';

@Component({
    selector: 'import-job-detail-popup',
    templateUrl: './import-job-detail.popup.html'
})

export class ShareBusinessImportJobDetailPopupComponent extends PopupBase {

    @ViewChild(ShareBusinessFormSearchImportJobComponent) formSearchImportJobComponent: ShareBusinessFormSearchImportJobComponent;
    @Output() onImport: EventEmitter<any> = new EventEmitter<any>();

    headers: CommonInterface.IHeaderTable[];
    dataSearch: any = {};
    shippments: any = [];
    containers: any = [];

    jobId: string = '';
    selected = -1;
    selectedShipment: any = {};

    pageChecked: number = 0;
    transactionType: number;

    isCheckShipment: boolean = false;

    service: string = 'sea';

    constructor(
        private _documentRepo: DocumentationRepo,
        private _sortService: SortService,
        protected _store: Store<fromShareBussiness.ITransactionState>,

    ) {
        super();
        this.requestList = this.getShippments;
        this.requestSort = this.sortLocal;
    }

    sortLocal(sort: string): void {
        this.shippments = this._sortService.sort(this.shippments, sort, this.order);
    }

    ngOnInit(): void {
        if (this.service === 'air') {
            this.headers = [
                { title: 'Job ID', field: 'jobNo', sortable: true },
                { title: 'MBL No', field: 'mawb', sortable: true },
                { title: 'Airlines(Co-Loader)', field: 'supplierName', sortable: true },
                { title: 'Shipment Date', field: 'etd', sortable: true }
            ];
        } else {
            this.headers = [
                { title: 'Job ID', field: 'jobNo', sortable: true },
                { title: 'MBL No', field: 'mawb', sortable: true },
                { title: 'Supplier(Shipping Line)', field: 'supplierName', sortable: true },
                { title: 'Shipment Date', field: 'etd', sortable: true }
            ];
        }

    }

    onCancel() {
        this.hide();
    }

    onSelected(index: number, shiment: any) {
        this.selected = index;
        this.pageChecked = this.page;
        this.selectedShipment = shiment;

    }

    getShippments(data: any = {}) {
        this.isLoading = true;
        const date = new Date();

        if (data.all === undefined && Object.keys(this.dataSearch).length === 0) {
            data.fromDate = formatDate(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd', 'en');
            data.toDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
        } else {
            data = this.dataSearch;
        }
        data.transactionType = this.transactionType;
        this._documentRepo.getListShipmentDocumentation(this.page, this.pageSize, data).pipe(
            catchError(this.catchError),
            finalize(() => { this.isLoading = false; }),
        ).subscribe(
            (res: any) => {
                if (!!res.data) {
                    this.shippments = res.data;
                    this.totalItems = res.totalItems || 0;
                } else {
                    this.totalItems = 0;
                    this.shippments = [];
                }
            },
        );
    }

    onImportShippment() {
        if (this.selected === -1) {
            this.isCheckShipment = false;
            return;
        } else {
            if (this.pageChecked !== this.page) {
                return;
            }
            this._documentRepo.getDetailTransaction(this.selectedShipment.id).pipe()
                .subscribe((resdetail: any) => {
                    const objShipment = resdetail;
                    objShipment.etd = null;
                    objShipment.mawb = null;
                    objShipment.eta = null;
                    objShipment.personIncharge = objShipment.personIncharge;

                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailSuccessAction(objShipment));
                    this.isCheckShipment = true;
                    this._documentRepo.getListContainersOfJob({ mblid: this.selectedShipment.id }).pipe(
                    ).subscribe(
                        (res: any) => {
                            if (!!res) {
                                this.containers = res;
                                // updae seal, cont.
                                if (this.containers.length > 0) {
                                    this.containers.forEach(item => {
                                        item.sealNo = null;
                                        item.containerNo = null;
                                        item.markNo = null;
                                    });
                                    this.selectedShipment.containers = this.containers;

                                    this._store.dispatch(new fromShareBussiness.GetContainerSuccessAction(this.containers));
                                }
                            }
                        }
                    );
                    this.onImport.emit(this.selectedShipment);
                    this.hide();
                });
        }
    }

    onSearchShippment(dataSearch: any) {
        this.dataSearch = dataSearch;
        this.getShippments(this.dataSearch);
    }
}
