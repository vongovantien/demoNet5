import { Component, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AccountingRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { Surcharge } from 'src/app/shared/models';
import { catchError, map, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { SortService } from 'src/app/shared/services';

@Component({
    selector: 'copy-settlement-popup',
    templateUrl: './copy-settlement.popup.html',
})
export class SettlementFormCopyPopupComponent extends PopupBase {

    @Output() onCopy: EventEmitter<any> = new EventEmitter<any>();

    headersCharge: CommonInterface.IHeaderTable[];
    headerShipment: CommonInterface.IHeaderTable[];

    searchOptions: CommonInterface.ICommonTitleValue[];
    charges: Surcharge[] = [];

    shipments: IShipmentBySearch[] = [];

    settlementNo: string = '';
    keywordSearchShipment: string = '';
    selectedOption: CommonInterface.ICommonTitleValue;

    isCheckAllShipment: boolean = false;

    constructor(
        private _accountingRepo: AccountingRepo,
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress,
        private _sortService: SortService

    ) {
        super();

        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
        this.headersCharge = [
            { title: 'Charge Name', field: 'chargeName', sortable: true, width: 200 },
            { title: 'Shipment', field: 'jobId', sortable: true, width: 200 },
            { title: 'Qty', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unitName', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Amount', field: 'total', sortable: true },
            { title: 'Partner', field: 'payer', sortable: true, width: 200 },
            { title: 'OBH Partner', field: 'obhPartnerName', sortable: true, width: 200 },
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'Charge Code', field: 'chargeCode', sortable: true, width: 200 },
        ];

        this.headerShipment = [
            { title: 'No', field: 'chargeName', sortable: true, width: 50 },
            { title: 'Shipment ID', field: 'jobId', sortable: true, width: 200 },
            { title: 'Customer', field: 'customer', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
        ];

        this.searchOptions = [
            { title: 'Job No', value: 'JobNo' },
            { title: 'HBL/HAWB', value: 'Hwbno' },
            { title: 'MBL/MAWB', value: 'Mawb' },
            { title: 'Custom No', value: 'ClearanceNo' },
        ];
        this.selectedOption = this.searchOptions[0];
    }

    submitCopyCharge() {
        const body = {
            charges: this.charges.filter(charge => charge.isSelected),
            shipments: this.shipments.filter(shipment => shipment.isSelected)
        };

        if (!body.charges.length) {
            this._toastService.warning('Bạn chưa chọn phí, bạn vui lòng chọn phí !', `You don't select charge, Please select at least one charges !`);
            return;
        }
        if (!body.shipments.length) {
            this._toastService.warning('Bạn chưa chọn lô hàng, bạn vui lòng chọn chọn lô hàng để copy !', `You don't select Shipment, Please select shipment to copy !`);
            return;
        }
        this._progressRef.start();
        this._accountingRepo.copyChargeToShipment(body)
            .pipe(catchError(err => this.catchError(err)), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    if (!!res.length) {
                        this.onCopy.emit(res);
                        this.closePopup();
                    }
                },
                (errors: any) => {
                },
            );
    }

    searchCharge() {
        if (!!this.settlementNo) {
            this._accountingRepo.getListChargeSettlementBySettlementNo(this.settlementNo.trim())
                .pipe(
                    catchError(this.catchError),
                    map(response => (response || []).map((charge: Surcharge) => new Surcharge(charge)))
                )
                .subscribe(
                    (res: any) => {
                        this.charges = res;
                        this.onChangeCheckBoxCharge();
                    }
                );
        }
    }

    searchShipment() {
        const keywords: string[] = this.keywordSearchShipment.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()).filter(i => Boolean(i));

        this._documentRepo.getShipmentBySearchOption(this.selectedOption.value, keywords)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipments = res.data || [];
                        this.onChangeCheckBoxShipment();
                        if (!res.status) {
                            this._toastService.warning(res.message);
                        }
                    }
                },
                (errors: any) => { }
            );
    }

    onChangeCheckBoxCharge() {
        this.isCheckAll = this.charges.every((surcharge: Surcharge) => surcharge.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.charges) {
            charge.isSelected = this.isCheckAll;
        }
    }

    checkUncheckAllShipment() {
        for (const charge of this.shipments) {
            charge.isSelected = this.isCheckAllShipment;
        }
    }

    onChangeCheckBoxShipment() {
        this.isCheckAllShipment = this.shipments.every((shipment: IShipmentBySearch) => shipment.isSelected);
    }

    resetFormSearch() {
        this.keywordSearchShipment = '';
        this.settlementNo = '';
        this.keyword = '';

        this.charges = [];
        this.shipments = [];

        this.selectedOption = this.searchOptions[0];
        this.isCheckAll = this.isCheckAllShipment = false;
    }

    closePopup() {
        this.hide();
        this.resetFormSearch();
    }

    sortShipment(sortData: CommonInterface.ISortData) {
        this.shipments = this._sortService.sort(this.shipments, sortData.sortField, sortData.order);
    }

    sortSurcharge(sortData: CommonInterface.ISortData) {
        this.charges = this._sortService.sort(this.charges, sortData.sortField, sortData.order);
    }
}

interface IShipmentBySearch {
    customNo: string;
    customer: string;
    hbl: string;
    jobId: string;
    mbl: string;
    no: number;
    isSelected: boolean;
    service: string;
}
