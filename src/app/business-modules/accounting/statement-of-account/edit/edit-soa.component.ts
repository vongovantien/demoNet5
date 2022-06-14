import { Component, ViewChild } from '@angular/core';
import { StatementOfAccountAddChargeComponent } from '../components/poup/add-charge/add-charge.popup';
import { AccountingRepo, CatalogueRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { SOA, SOASearchCharge, Charge, SoaCharge } from '@models';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AppList } from 'src/app/app.list';
import { SortService, DataService } from '@services';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { NgProgress } from '@ngx-progressbar/core';
import { RoutingConstants } from '@constants';
@Component({
    selector: 'app-statement-of-account-edit',
    templateUrl: './edit-soa.component.html',
})
export class StatementOfAccountEditComponent extends AppList {
    @ViewChild(StatementOfAccountAddChargeComponent) addChargePopup: StatementOfAccountAddChargeComponent;

    currencyList: any[];
    selectedCurrency: any = null;
    excRateUsdToLocal: any = null;

    selectedRange: any;

    soa: SOA = new SOA();
    soaNO: string = '';
    currencyLocal: string = '';

    headers: CommonInterface.IHeaderTable[] = [];
    isCheckAllCharge: boolean = false;

    dataSearch: SOASearchCharge;

    charges: Charge[] = [];
    configCharge: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _sysRepo: CatalogueRepo,
        private _sortService: SortService,
        private _router: Router,
        private _dataService: DataService,
        private _progressService: NgProgress,


    ) {
        super();
        this.requestSort = this.sortChargeList;
        this._progressRef = this._progressService.ref();
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
            { title: 'C/D Note', field: 'cdNote', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Services Date', field: 'serviceDate', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];
        this._activedRoute.queryParams.subscribe((params: any) => {
            if (!!params.no && !!params.currency) {
                this.soaNO = params.no;
                this.currencyLocal = params.currency;
                this.getCurrency();
                this.getListCharge();
                this.getDetailSOA(this.soaNO, this.currencyLocal);
            }
        });
    }

    addCharge() {
        this.addChargePopup.show();
    }

    getDetailSOA(soaNO: string, currency: string) {
        this._progressRef.start();
        this.isLoading = true;
        this._accoutingRepo.getDetaiLSOAUpdateExUsd(soaNO, currency)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); this.isLoading = false; })
            ).subscribe(
                (dataSoa: any) => {
                    this.soa = new SOA(dataSoa);

                    // * make all chargeshipment was selected
                    for (const item of this.soa.chargeShipments) {
                        item.isSelected = this.isCheckAllCharge;
                    }

                    // * update currency
                    this.selectedCurrency = !!this.soa.currency ? this.currencyList.filter((currencyItem: any) => currencyItem.id === this.soa.currency.trim())[0] : this.currencyList[0];

                    // * update range Date
                    this.selectedRange = { startDate: new Date(this.soa.soaformDate), endDate: new Date(this.soa.soatoDate) };

                    this.excRateUsdToLocal = !!this.soa.excRateUsdToLocal?this.formatNumberDecimal(this.soa.excRateUsdToLocal):0;

                    // * Update dataSearch for Add More Charge.
                    const datSearchMoreCharge: SOASearchCharge = {
                        currency: this.soa.currency,
                        currencyLocal: 'VND', // TODO get currency local from user,
                        customerID: this.soa.customer,
                        dateType: this.soa.dateType,
                        toDate: this.soa.soatoDate,
                        fromDate: this.soa.soaformDate,
                        type: this.soa.type,
                        isOBH: this.soa.obh,
                        inSoa: false,
                        strCharges: this.soa.surchargeIds,
                        strCreators: this.soa.creatorShipment,
                        serviceTypeId: this.soa.serviceTypeId,
                        chargeShipments: this.soa.chargeShipments,
                        note: this.soa.note,
                        commodityGroupId: this.soa.commodityGroupId,
                        strServices: this.soa.serviceTypeId.replace(new RegExp(";", 'g'), ","),
                        jobIds: [],
                        hbls: [],
                        mbls: [],
                        staffType: this.soa.staffType,
                        customerShipmentId: '',
                        salemanId: ''
                    };
                    this.dataSearch = new SOASearchCharge(datSearchMoreCharge);
                },
            );
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.currencyList = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY);
        } else {
            this._sysRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCurrency: any) => {
                        this.currencyList = dataCurrency;
                    },
                );
        }
    }

    getListCharge() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE)) {

            this.getDataCharge(this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE));
        } else {
            this._sysRepo.getListCharge()
                .pipe(catchError(this.catchError))
                .subscribe((dataCharge: any) => {
                    this.getDataCharge(dataCharge);
                },
                );
        }
    }

    getDataCharge(data: any) {
        this.charges = data;
        this.charges.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));

        this.configCharge.dataSource = data || [];
        this.configCharge.displayFields = [
            { field: 'code', label: 'Charge Code' },
            { field: 'chargeNameEn', label: 'Charge Name EN ' },
        ];
        this.configCharge.selectedDisplayFields = ['code'];
    }

    sortChargeList(sortField?: string, order?: boolean) {
        this.soa.chargeShipments = this._sortService.sort(this.soa.chargeShipments, sortField, order);
    }

    onChangeCheckBoxCharge($event: Event) {
        this.isCheckAllCharge = this.soa.chargeShipments.every((item: any) => item.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.soa.chargeShipments) {
            charge.isSelected = this.isCheckAllCharge;
        }
    }

    removeCharge() {
        this.soa.chargeShipments = this.soa.chargeShipments.filter((item: any) => !item.isSelected);
        this.dataSearch.chargeShipments = this.soa.chargeShipments;
    }

    back() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}`]);
    }

    onUpdateMoreSOA(data: any) {
        console.log(data)
        this.soa.chargeShipments = [...this.soa.chargeShipments, ...data.chargeShipments]
        console.log(this.soa.chargeShipments);
        this.dataSearch.chargeShipments = this.soa.chargeShipments;
        this.isCheckAllCharge = false;
    }

    updateSOA() {
        /*
        * endDate must >= soaToDate
                    * and
        * startDate must <= soaFromDate
        */
        if (!this.excRateUsdToLocal) {
            if (this.excRateUsdToLocal <=0) {
                this._toastService.warning(`Required to enter Excel USD greater than 0`);
                return;
            } else {
                this._toastService.warning(`Required to enter Excel USD`);
                return;
            }
        }
        if ((new Date(this.selectedRange.startDate).getDate() > new Date(this.soa.soaformDate).getDate()) || new Date(this.selectedRange.endDate).getDate() < new Date(this.soa.soatoDate).getDate()) {
            this._toastService.warning(`Range date invalid `);
            return;
        }
        if (!this.soa.chargeShipments.length) {
            this._toastService.warning(`SOA Don't have any charges in this period, Please check it again! `);
            return;
        } else {
            const body = {
                surcharges: this.soa.chargeShipments.map((item: any) => ({
                    surchargeId: item.id,
                    type: item.type
                })),
                id: this.soa.id,
                soano: this.soaNO,
                soaformDate: !!this.selectedRange.startDate ? formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en') : null,
                soatoDate: !!this.selectedRange.endDate ? formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en') : null,
                currency: this.selectedCurrency.id,
                status: this.soa.status,
                note: this.soa.note,
                userCreated: this.soa.userCreated,
                userModified: this.soa.userModified,
                datetimeCreated: this.soa.datetimeCreated,
                datetimeModified: this.soa.datetimeModified,
                serviceTypeId: this.soa.serviceTypeId,
                dateType: this.soa.dateType,
                type: this.soa.type,
                obh: this.soa.obh,
                creatorShipment: this.soa.creatorShipment,
                customer: this.soa.customer,
                commodityGroupId: this.soa.commodityGroupId,
                staffType: this.soa.staffType,
                excRateUsdToLocal:this.excRateUsdToLocal
            };
            this._progressRef.start();
            this._accoutingRepo.updateSOA(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`SOA ${res.data.soano} is successfull`, 'Update Success');
                            // * get detail again
                            // this.getDetailSOA(this.soaNO, this.currencyLocal);

                            // * init checkbox all
                            this.isCheckAllCharge = false;
                            this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}/detail/`], {
                                queryParams: { no: this.soaNO, currency: this.currencyLocal }
                            });
                        }
                    },
                );
        }
    }

    addMoreCharge() {
        const body = {
            currency: this.soa.currency,
            customerID: this.soa.customer,
            dateType: this.soa.dateType,
            fromDate: formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en'), //Lấy theo field Date của form Edit
            toDate: formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en'), //Lấy theo field Date của form Edit
            type: this.soa.type,
            isOBH: this.soa.obh,
            strServices: this.soa.serviceTypeId.replace(';', ','),
            strCreators: this.soa.creatorShipment.replace(';', ','),
            staffType: this.soa.staffType,
            salemanId: this.soa.salemanId
        };
        this.dataSearch = new SOASearchCharge(body);
        this.addChargePopup.searchInfo = this.dataSearch;
        this.addChargePopup.getListShipmentAndCDNote(this.dataSearch);

        this.addChargePopup.charges = this.charges;
        this.addChargePopup.configCharge = this.configCharge;

        this.addChargePopup.show();
    }

    selectJobId(charge: SoaCharge) {
        charge.isSelected = !charge.isSelected;
        this.soa.chargeShipments.forEach((c: SoaCharge) => {
            if (c.jobId === charge.jobId) {
                c.isSelected = charge.isSelected;
            }
        })
        this.isCheckAllCharge = this.soa.chargeShipments.every((item: any) => item.isSelected);
    }

    formatNumberDecimal(input: number) {
        return input.toLocaleString(
            'en-US', // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
            { minimumFractionDigits: 0 }
        );
    }
}
