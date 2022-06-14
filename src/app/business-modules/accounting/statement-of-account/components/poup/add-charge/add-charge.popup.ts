import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AccountingRepo } from 'src/app/shared/repositories';
import { SOASearchCharge, Charge } from 'src/app/shared/models';

import _includes from 'lodash/includes';
import _uniq from 'lodash/uniq';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'src/app/shared/services';


@Component({
    selector: 'soa-add-charge-popup',
    templateUrl: './add-charge.popup.html',
    styleUrls: ['./add-charge.popup.scss']
})
export class StatementOfAccountAddChargeComponent extends PopupBase {

    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() searchInfo: SOASearchCharge = null;

    selectedShipment: Partial<CommonInterface.IComboGridData> = {};
    selectedShipmentData: OperationInteface.IShipment;

    configShipment: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    charges: Charge[] = [];
    configCharge: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    selectedCharge: any = {};
    selectedCharges: any[] = []; // for multiple select

    cdNotes: ICDNote[];
    initCDNotes: ICDNote[];
    selectedCDNote: ICDNote = null;

    obhs: any[] = [];
    selectedOBH: any = null;

    types: any[] = [];
    selectedType: any = null;

    inSOAs: any[] = [];
    selectedInSOA: any = null;

    headers: CommonInterface.IHeaderTable[];
    sort: string = null;
    order: any = false;

    isCheckAllCharge: boolean = false;
    listCharges: any[] = [];

    commodity: any = null;
    commodityGroup: any[] = [];

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'No.', field: '', sortable: false },
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'JobID', field: 'jobId', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'Debit', field: 'debit', sortable: true },
            { title: 'Credit', field: 'credit', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'C/D Note', field: 'cdNote', sortable: true },
            { title: 'Services Date', field: 'serviceDate', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
            { title: 'SOA no', field: 'soaNo', sortable: true },

        ];
        this.initBasicData();
    }

    ngOnChanges() {
    }

    initBasicData() {
        this.types = [
            { text: 'Debit', id: 1 },
            { text: 'Credit', id: 2 },
        ];
        this.selectedType = this.types[0];

        this.obhs = [
            { text: 'Yes', id: true },
            { text: 'No', id: false }
        ];
        this.selectedOBH = this.obhs[1];

        this.inSOAs = [
            { text: 'Yes', id: true },
            { text: 'No', id: false }
        ];
        this.selectedInSOA = this.inSOAs[1];

    }

    setSortBy(sort?: string, order?: boolean): void {
        this.sort = sort ? sort : 'code';
        this.order = order;
    }

    sortClass(sort: string): string {
        if (!!sort) {
            let classes = 'sortable ';
            if (this.sort === sort) {
                classes += ('sort-' + (this.order ? 'asc' : 'desc') + ' ');
            }

            return classes;
        }
        return '';
    }

    sortBy(sort: string): void {
        if (!!sort) {
            this.setSortBy(sort, this.sort !== sort ? true : !this.order);
            if (!!this.listCharges.length) {
                this.listCharges = this._sortService.sort(this.listCharges, sort, this.order);
            }
        }
    }

    onChangeCheckBoxCharge($event: Event) {
        this.isCheckAllCharge = this.listCharges.every((item: any) => item.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.listCharges) {
            charge.isSelected = this.isCheckAllCharge;
        }
    }

    async getListShipmentAndCDNote(data: SOASearchCharge) {
        try {
            const res: IResultShipmentCDNote = await this._accoutingRepo.getListShipmentAndCDNote(data).toPromise();
            this.configShipment.dataSource = res.listShipment;
            this.cdNotes = this.initCDNotes = res.listCdNote;

            // * update config combogrid.
            this.configShipment.displayFields = [
                { field: 'jobId', label: 'Job No' },
                { field: 'mbl', label: 'MBL' },
                { field: 'hbl', label: 'HBL' },
            ];
            this.configShipment.selectedDisplayFields = ['jobId', `mbl`, 'hbl'];

            // * Update default value for form from dataSearch.
            this.updateDefaultValue(data);
        } catch (error) { }
    }


    updateDefaultValue(dataSearch: SOASearchCharge) {
        this.selectedType = this.types.filter((i: any) => i.text === dataSearch.type)[0];
        this.selectedOBH = this.obhs.filter((i: any) => i.id === dataSearch.isOBH)[0];

        if (dataSearch.serviceTypeId === '') {
            this.configCharge.dataSource = this.charges;
        } else {
            // * filter charge with service Id.
            this.configCharge.dataSource = this.filterChargeWithService(this.configCharge.dataSource, dataSearch.serviceTypeId);
            this.configCharge.dataSource.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));
        }
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'shipment':
                this.selectedShipment = { field: data.jobId, value: data.hbl };
                this.selectedShipmentData = data;

                this.cdNotes = [];
                this.selectedCDNote = null;
                this.cdNotes = this.filterCDNoteByShipment(this.selectedShipmentData);
                break;
            case 'charge':
                if (data.id === 'All') {
                    this.selectedCharges = [];
                    this.selectedCharges.push({ id: 'All', code: 'All', chargeNameEn: 'All' });
                } else {
                    this.selectedCharges.push(data);
                    this.selectedCharges = [...new Set(this.selectedCharges)];

                    this.detectChargeWithAllOption(data);
                }
                break;

            default:
                break;
        }
    }

    detectChargeWithAllOption(data?: any) {
        if (!this.selectedCharges.every((value: any) => value.id !== 'All')) {
            this.selectedCharges.splice(this.selectedCharges.findIndex((item: any) => item.id === 'All'), 1);

            this.selectedCharges = [];
            this.selectedCharges.push(data);
        }
    }

    filterChargeWithService(charges: any[], keys: any) {
        const result: any[] = [];
        for (const charge of charges) {
            if (charge.hasOwnProperty('serviceTypeId')) {
                if (typeof (charge.serviceTypeId) !== 'object') {
                    charge.serviceTypeId = charge.serviceTypeId.split(";").filter((i: string) => Boolean(i));
                }
            }
            for (const key of charge.serviceTypeId) {
                if (_includes(keys, key)) {
                    result.push(charge);
                }
            }
        }
        return _uniq(result);
    }

    filterCDNoteByShipment(shipment: OperationInteface.IShipment): ICDNote[] {
        return this.initCDNotes.filter((item: ICDNote) => {
            return (item.hbl === shipment.hbl && item.mbl === shipment.mbl && item.jobId === shipment.jobId);
        });
    }

    onRemoveCharge(index: number = 0) {
        this.selectedCharges.splice(index, 1);
    }

    onApplySearchCharge() {
        const body: ISearchMoreCharge = {
            chargeShipments: this.searchInfo.chargeShipments,
            inSoa: this.selectedInSOA.id,
            jobId: !!this.selectedShipmentData ? this.selectedShipmentData.jobId : '',
            hbl: !!this.selectedShipmentData ? this.selectedShipmentData.hbl : '',
            mbl: !!this.selectedShipmentData ? this.selectedShipmentData.mbl : '',
            cdNote: !!this.selectedCDNote ? this.selectedCDNote.creditDebitNo : '',
            currencyLocal: "VND",
            customerID: this.searchInfo.customerID,
            dateType: this.searchInfo.dateType,
            fromDate: this.searchInfo.fromDate,
            toDate: this.searchInfo.toDate,
            type: this.selectedType.text,
            isOBH: this.selectedOBH.id,
            strCreators: this.searchInfo.strCreators,
            strCharges: this.selectedCharges.map((item: any) => item.id).toString(),
            commondityGroupId: !!this.commodity ? this.commodity.id : null,
            strServices: this.searchInfo.strServices,
            serviceTypeId: this.searchInfo.serviceTypeId,
            staffType: this.searchInfo.staffType
        };
        this._accoutingRepo.getListMoreCharge(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.listCharges = res;
                    }
                },
            );
    }

    addMoreCharge() {
        const body = {
            chargeShipmentsCurrent: this.searchInfo.chargeShipments,
            chargeShipmentsAddMore: this.listCharges.filter((i: any) => !i.soaNo && i.isSelected)
        };
        if (!body.chargeShipmentsAddMore.length) {
            this._toastService.warning(`SOA Don't have any charges in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
            return;
        } else {
            this._accoutingRepo.addMoreCharge(body)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        this.onChange.emit(res);
                        this.hide();
                    },
                );
        }
    }

    onResetData() {
        this.listCharges = [];
        this.selectedShipment = {};
        this.selectedCDNote = null;
        this.selectedCharges = [];
        this.selectedType = this.types[0];
        this.selectedOBH = this.obhs[1];
        this.selectedInSOA = this.inSOAs[1];

        this.isCheckAllCharge = false;

        this.selectedShipmentData = null;
    }

    hide() {
        this.popup.hide();
        this.onResetData();
    }
}



interface IResultShipmentCDNote {
    listCdNote: ICDNote[];
    listShipment: OperationInteface.IShipment[];
}

interface ICDNote {
    creditDebitNo: string;
    hbl: string;
    jobId: string;
    mbl: string;
}
interface ISearchMoreCharge {
    chargeShipments: any[];
    inSoa: boolean;
    jobId: string;
    hbl: string;
    mbl: string;
    cdNote: string;
    currencyLocal: string;
    dateType: string;
    fromDate: string;
    toDate: string;
    customerID: string;
    type: string;
    isOBH: boolean;
    strCreators: string;
    strCharges: string;
    commondityGroupId: any;
    strServices: string;
    serviceTypeId: string;
    staffType: string;
}
