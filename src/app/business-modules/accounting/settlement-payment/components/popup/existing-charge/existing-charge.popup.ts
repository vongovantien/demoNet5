import { Component, Output, EventEmitter, ChangeDetectorRef, ViewContainerRef, QueryList, ViewChildren } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { catchError, concatMap, finalize, skip, switchMap, takeUntil } from 'rxjs/operators';
import { SortService } from '@services';
import { AccountingRepo, DocumentationRepo, CatalogueRepo, SystemRepo } from '@repositories';
import { Partner, Surcharge } from '@models';
import { ToastrService } from 'ngx-toastr';
import cloneDeep from 'lodash/cloneDeep';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { formatCurrency, formatDate } from '@angular/common';
import { getMenuUserPermissionState, IAppState } from '@store';
import { Store } from '@ngrx/store';
import { CommonEnum } from '@enums';
import { AppComboGridComponent } from '@common';

@Component({
    selector: 'existing-charge-popup',
    templateUrl: './existing-charge.popup.html',
    styleUrls: ['./existing-charge.popup.scss']
})

export class SettlementExistingChargePopupComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    @ViewChildren('container', { read: ViewContainerRef }) public widgetTargets: QueryList<ViewContainerRef>;
    
    headers: CommonInterface.IHeaderTable[];
    headerPartner: CommonInterface.IHeaderTable[] = [];
    formSearch: FormGroup;
    referenceNo: AbstractControl;
    referenceInput: AbstractControl;
    serviceDate: AbstractControl;
    personInCharge: AbstractControl;
    exchangeRateInput: number = 0;
    totalAmountVnd: string = '';
    invoiceNoAll: string = null;
    invoiceDateAll: AbstractControl;
    confirmInvoice = false;

    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    selectedPartner: Partial<CommonInterface.IComboGridData> = {};
    selectedPartnerData: any;

    selectedVatPartner: Partial<CommonInterface.IComboGridData> = {};
    selectedVatPartnerData: any;
    listVatPartner: Partner[] =[];

    configShipment: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    referenceNos: CommonInterface.ICommonTitleValue[];

    services: any[] = [];
    initService: any[] = [];
    selectedServices: any[] = [];
    advanceNoSelect: any = null;

    charges: Surcharge[] = [];
    selectedCharge: Surcharge[] = [];
    shipments: ShipmentChargeSettlement[] = [];
    total: any = {};
    orgChargeShipment: IGetExistsCharge;

    shipmentInput: OperationInteface.IInputShipment;
    isLoadingShipmentGrid: boolean = false;
    isLoadingPartnerGrid: boolean = false;
    isSOACDNote: boolean = false;

    numberOfShipment: string = '0/0';
    state: string = 'new';
    allowUpdate: boolean = false;
    searchCondition: any[] = ['SOA', 'Credit Note', 'JOB No', 'HBL/HAWB', 'MBL/MAWB', 'Custom No'];
    personInCharges: any[] = [];
    selectedSurcharge: Surcharge;
    selectedIndexCharge: number = -1;
    requester: string = '';
    settlementCode: string = '';

    constructor(
        private _catalogue: CatalogueRepo,
        private _accoutingRepo: AccountingRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _sysRepo: SystemRepo,
        private _cd: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit() {

        this.headers = [
            { title: 'No', field: 'no', sortable: true, width: 50 },
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'Org Net Amount', field: 'unitName', sortable: true },
            { title: 'VAT', field: 'unitPrice', sortable: true },
            { title: 'Org Amount', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'Exc Rate', field: 'total', sortable: true },
            { title: 'VND Net Amount', field: 'amountVnd', sortable: true },
            { title: 'VAT VND Amount', field: 'vatAmountVnd', sortable: true },
            { title: 'VND Amount', field: '', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'VAT Partner', field: '', sortable: true, width: 250 },
            { title: 'Serial No', field: 'seriesNo', sortable: true },
            { title: 'AdvanceNo', field: 'advanceNo', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
        ];

        this.headerPartner = [
            { title: 'TaxCode', field: 'taxCode' },
            { title: 'Partner Name', field: 'partnerNameEn' },
        ];

        this.referenceNos = this.getRefCombobox();
        this.initFormSearch();
        this.getPartner();
        this.getProductService();

        this._store.select(getMenuUserPermissionState)
            .pipe(
                switchMap((res: any) => this._sysRepo.getListUserWithPermission(res.menuId, 'Detail')),
                takeUntil(this.ngUnsubscribe)
            ).subscribe((res: any) => {
                this.personInCharges = res;
            });
    }

    getRefCombobox(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'SOA', value: 'Soa' },
            { title: 'Credit Note', value: 'CreditNote' },
            { title: 'JOB No', value: 'JOBNo' },
            { title: 'HBL/HAWB', value: 'HBL' },
            { title: 'MBL/MAWB', value: 'MBL' },
            { title: 'Custom No', value: 'CustomNo' },
        ];
    }

    getPartner() {
        const customersFromService = this._catalogue.getCurrentCustomerSource();
        if (!!customersFromService.data.length) {
            this.getPartnerData(customersFromService.data);
            this.listVatPartner = customersFromService.data;
            return;
        }
        this._catalogue.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL).subscribe(
            (data) => {
                this._catalogue.customersSource$.next({ data }); // * Update service.
                this.getPartnerData(data);
                this.listVatPartner = data;
            }
        );
    }

    getVatpartnerDataSource(){
        const customersFromService = this._catalogue.getCurrentCustomerSource();
        if (!!customersFromService.data.length) {
            this.listVatPartner = customersFromService.data;
            return;
        }
        this._catalogue.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL).subscribe(
            (data) => {
                this._catalogue.customersSource$.next({ data }); // * Update service.
                this.listVatPartner = data;
            }
        );
    }

    loadDynamicComoGrid(charge: Surcharge, index: number) {
        this.selectedSurcharge = charge;
        this.selectedIndexCharge = index;
        const containerRef: ViewContainerRef = this.widgetTargets.toArray()[index];
        this.componentRef = this.renderDynamicComponent(AppComboGridComponent, containerRef);
        if (!!this.componentRef) {
            this.componentRef.instance.headers = this.headerPartner;
            this.componentRef.instance.data = this.listVatPartner;
            this.componentRef.instance.fields = ['shortName', 'taxCode', 'partnerNameEn'];
            this.componentRef.instance.active = charge.paymentObjectId;

            this.subscription = ((this.componentRef.instance) as AppComboGridComponent<Partner>).onClick.subscribe(
                (v: Partner) => {
                    this.onSelectPartner(v, this.selectedSurcharge);
                    this.subscription.unsubscribe();

                    containerRef.clear();
                });
            ((this.componentRef.instance) as AppComboGridComponent<Partner>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        containerRef.clear();
                    }
                );
        }
    }

    onSelectPartner(partnerData: any, chargeItem: Surcharge) {
        if (!!partnerData) {
            chargeItem.vatPartnerId = partnerData.id;
            chargeItem.vatPartnerShortName = partnerData.shortName;
        }
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
        this.configPartner.displayFields = [
            { field: 'taxCode', label: 'Tax Code' },
            { field: 'shortName', label: 'Partner Name' },
        ];
        this.configPartner.selectedDisplayFields = ['shortName'];
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            referenceInput: [null, Validators.required],
            referenceNo: [this.referenceNos[0].value, Validators.required],
            serviceDate: [],
            personInCharge: [],
            invoiceDateAll: []
        });

        this.referenceInput = this.formSearch.controls['referenceInput'];
        this.referenceNo = this.formSearch.controls['referenceNo'];
        this.serviceDate = this.formSearch.controls['serviceDate'];
        this.personInCharge = this.formSearch.controls['personInCharge'];
        this.invoiceDateAll = this.formSearch.controls['invoiceDateAll'];
        this.selectedPartnerData = null;
    }

    getProductService() {
        this._sysRepo.getListServiceByPermision()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: CommonInterface.IValueDisplay[]) => {
                    this.initService = data;
                    this.services = (data || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));
                    // sort A -> Z theo text services 
                    this.sortIncreaseServices('text', true);
                    this.selectedServices = this.services;
                }
            );
    }

    sortIncreaseServices(sortField: string, order: boolean) {
        this.services = this._sortService.sort(this.services, sortField, order);
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.selectedPartner = { field: 'id', value: data.id };
                this.selectedPartnerData = data;
                break;
            case 'service':
                this.selectedServices = [];
                this.selectedServices.push(...data);
                break;
            default:
                break;
        }
    }

    onRemoveDataFormInfo(type: string) {
        switch (type) {
            case 'partner':
                this.selectedPartner = {};
                this.selectedPartnerData = null;
                break;
            default:
                break;
        }
    }

    mapDataSearch() {
        let _data = [];
        if (!!this.referenceInput.value) {
            if (this.referenceInput.value.length > 0) {
                const _keyword = this.referenceInput.value.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim());
                _data = _keyword;
            }
        }
        return _data;
    }


    checkUncheckAllCharge(hblId: string) {
        this.shipments.filter((shipment: any) => shipment.hblId === hblId)
            .map((shipment: any) => {
                for (const charge of shipment.chargeSettlements) {
                    charge.isSelected = shipment.isSelected;
                }
            }
            );
    }

    onChangeCheckBoxCharge(hblId: string) {
        this.shipments.filter((shipment: ShipmentChargeSettlement) => shipment.hblId === hblId).map((shipment: ShipmentChargeSettlement) => {
            shipment.isSelected = shipment.chargeSettlements.every((item: Surcharge) => item.isSelected)
        });
    }

    isSoaCDNoteSelected() {
        if (this.referenceNo.value === this.referenceNos[0].value || this.referenceNo.value === this.referenceNos[1].value) {
            this.isSOACDNote = true;
        } else {
            this.isSOACDNote = false;
        }
    }

    sortSurcharge(dataSort: any) {
        this.shipments = this._sortService.sort(this.shipments, dataSort.sortField, dataSort.order);
    }

    closePopup() {
        this.resetFormShipmentInput();
        this.resetData();
        this.resetPartner();
        this.state = 'new';
        this.isSubmitted = false;
        this.serviceDate.setValue(null);
        this.personInCharge.setValue(null);
        this.hide();
    }

    getDetailShipmentOfSettle(surcharges: Surcharge[]) {
        if (!!surcharges) {
            const surcharge = [...surcharges].shift();
            let shipment = new ShipmentChargeSettlement();
            shipment.jobId = surcharge.jobId;
            shipment.mbl = surcharge.mbl;
            shipment.hbl = surcharge.hbl;
            shipment.hblId = surcharge.hblid;
            shipment.advanceNo = surcharge.advanceNo;
            shipment.originAdvanceNo = surcharge.advanceNo;
            shipment.customNo = surcharge.clearanceNo;
            shipment.chargeSettlements = surcharges.map((surcharge: Surcharge) => new Surcharge(surcharge));
            shipment.totalNetAmount = surcharges.filter((charge: Surcharge) => charge.currencyId === 'USD').reduce((net: number, charge: Surcharge) => net += charge.netAmount, 0);
            shipment.totalNetAmountVND = surcharges.filter((charge: Surcharge) => charge.currencyId === 'VND').reduce((net: number, charge: Surcharge) => net += charge.netAmount, 0);
            shipment.totalAmount = surcharges.filter((charge: Surcharge) => charge.currencyId === 'USD').reduce((net: number, charge: Surcharge) => net += charge.total, 0);
            shipment.totalAmountVND = surcharges.filter((charge: Surcharge) => charge.currencyId === 'VND').reduce((total: number, charge: Surcharge) => total += (charge.amountVnd + charge.vatAmountVnd), 0);
            shipment.totalNetVND = surcharges.reduce((net: number, charge: Surcharge) => net += charge.amountVnd, 0);
            shipment.totalVATVND = surcharges.reduce((net: number, charge: Surcharge) => net += charge.vatAmountVnd, 0);
            shipment.totalNetUSD = surcharges.reduce((net: number, charge: Surcharge) => net += charge.amountUSD, 0);
            shipment.totalVATUSD = surcharges.reduce((net: number, charge: Surcharge) => net += charge.vatAmountUSD, 0);
            shipment.totalVND = shipment.totalNetVND + shipment.totalVATVND;
            this.shipments = [...this.shipments, shipment];
            this.shipments.map(item => item.advanceNoList = item.chargeSettlements.filter(x=>x.advanceNo !=null).map(x=> x.advanceNo).filter((value, index, self) => self.indexOf(value) === index));
            this.total.totalUSDStr = formatCurrency(this.shipments[0].totalNetUSD + this.shipments[0].totalVATUSD, 'en', '') + ' = ' + formatCurrency(this.shipments[0].totalNetUSD, 'en', '') + ' + ' + formatCurrency(this.shipments[0].totalVATUSD, 'en', '');
            this.totalAmountVnd = this.formatNumberCurrency(this.shipments[0].totalVND) + ' = ' + this.formatNumberCurrency(this.shipments[0].totalNetVND) + ' + ' + this.formatNumberCurrency(this.shipments[0].totalVATVND);
            this.total.totalShipment = 1;
            this.total.totalCharges = surcharges.length;

            this.orgChargeShipment = { shipmentSettlement: cloneDeep(this.shipments), total: cloneDeep(this.total) };
            const payeeId = surcharge.type === 'OBH' ? surcharge.payerId : surcharge.paymentObjectId;
            this.getAdvanceList(surcharge.hblid, payeeId);
            this.checkedAllCharges();
        }
    }

    formatNumberCurrency(input: number) {
        return input.toLocaleString(
            'en-US', // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
            { minimumFractionDigits: 0 }
        );
    }

    getAdvanceList(hblId: string, payeeId: string) {
        this._accoutingRepo.getListAdvanceNoForShipment(hblId, payeeId, this.requester)
            .pipe(catchError(this.catchError), finalize(() => {
            }))
            .subscribe(
                (res: any[]) => {
                    this.shipments.map(x => x.advanceNoList = x.advanceNoList.concat(res).filter((value, index, self) => self.indexOf(value) === index))
                },
            );
    }

    updateExchangeRateForCharges() {
        this.shipments.forEach((shipment: any) =>
            shipment.chargeSettlements.filter((charge: Surcharge) => charge.isSelected)
                .map((surcharge: Surcharge) => this.selectedCharge.push(new Surcharge(surcharge)))
        );
        // var someResult = this.selectedCharge.some(x => {
        //     if (x.type === 'OBH' && x.jobId.includes('LOG')) {
        //         return (!this.utility.isWhiteSpace(x.invoiceNo) && this.utility.isWhiteSpace(x.seriesNo)) || (this.utility.isWhiteSpace(x.invoiceNo) && !this.utility.isWhiteSpace(x.seriesNo))
        //     }
        // })
        // if(someResult){
        //     this._toastService.warning("Series No and Invoice No Must be fill in");
        //     return;
        // }

        if (this.selectedCharge.length === 0) {
            this._toastService.warning(`None of charges are selected, Please recheck again! `);
            return;
        } else {
            
            this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
                shipment.chargeSettlements.filter((charge: Surcharge) => charge.isSelected)
                    .map((charge: Surcharge) => {
                        let exchangeRate = !this.exchangeRateInput ? 1 : this.exchangeRateInput;
                        if (charge.currencyId === 'USD') {
                            if(!!charge.kickBack && charge.kickBack === true){
                                exchangeRate = charge.finalExchangeRate;
                            }
                            charge.amountVnd = Math.round(charge.netAmount * exchangeRate);
                            charge.vatAmountVnd = charge.vatrate < 0 ? Math.round(charge.vatrate * exchangeRate) : Math.round(charge.amountVnd * (charge.vatrate / 100));
                            charge.finalExchangeRate = Number(exchangeRate);
                        }
                    });
                shipment.totalNetVND = shipment.chargeSettlements.reduce((net: number, charge: Surcharge) => net += charge.amountVnd, 0);
                shipment.totalVATVND = shipment.chargeSettlements.reduce((vat: number, charge: Surcharge) => vat += charge.vatAmountVnd, 0);
                shipment.totalVND = shipment.totalNetVND + shipment.totalVATVND;
            }
            );
            this.getTotalAmountVND();
        }
    }

    resetUpdateExchangeRateForCharges() {
        this.resetData();
        this.shipments = cloneDeep(this.orgChargeShipment.shipmentSettlement);
        this.total = { ...this.orgChargeShipment.total };
        this.getTotalAmountVND();
        this.checkedAllCharges();
    }

    getTotalAmountVND() {
        let netAmountVND = 0, vatAmountVND = 0, totalAmountVnd = 0;
        this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
            netAmountVND += shipment.chargeSettlements.reduce((net: number, charge: Surcharge) => net += charge.amountVnd, 0);
            vatAmountVND += shipment.chargeSettlements.reduce((vat: number, charge: Surcharge) => vat += charge.vatAmountVnd, 0);
        });
        totalAmountVnd = vatAmountVND + netAmountVND;
        this.totalAmountVnd = (this.formatNumberCurrency(totalAmountVnd) + ' = ' + this.formatNumberCurrency(netAmountVND) + ' + ' + this.formatNumberCurrency(vatAmountVND));
    }

    onBlurAnyCharge(e: any, hblId: string) {
        this.updateForChargerByFieldName(e.target.name, e.target.value, hblId);
    }

    updateForChargerByFieldName(field: string, value: string, hblId: string) {
        this.shipments.filter((shipment: any) => shipment.hblId === hblId).map((shipment: any) => {
            shipment.chargeSettlements.forEach(ele => {
                if (ele[field] === null || ele[field] === "") {
                    ele[field] = value;
                    if(field === 'invoiceNo'){
                        this.onChangeInvoiceNo(ele, value);
                    }
                }
            });
        });
    }

    onChangeInvoiceNo(chargeItem: Surcharge, invNo: string) {
        if (!!invNo) {
            const payeeId = chargeItem.type === 'OBH' ? chargeItem.payerId : chargeItem.paymentObjectId;
            const partner = this.getPartnerById(payeeId);
            chargeItem.vatPartnerId = partner.id;
            chargeItem.vatPartnerShortName = partner.shortName;
        }else{
            chargeItem.vatPartnerId = null;
            chargeItem.vatPartnerShortName = null;
        }
    }

    onChangeAllInvoice() {
        this.confirmInvoice = true;
        let validInvNo = false, validInvDate = false;
        if (!!this.invoiceNoAll) {
            validInvNo = true;
        }
        if (!!this.invoiceDateAll.value && !!this.invoiceDateAll.value.startDate) {
            validInvDate = true;
        }
        if (validInvNo && validInvDate) {
            this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
                shipment.chargeSettlements.forEach((charge: Surcharge) => {
                    if (charge.isSelected) {
                        charge.invoiceNo = !validInvNo ? charge.invoiceNo : this.invoiceNoAll;
                        charge.invoiceDate = validInvDate ? formatDate(new Date(this.invoiceDateAll.value.startDate), 'dd/MM/yyyy', 'en') : charge.invoiceDate;
                        if (validInvNo) {
                            this.onChangeInvoiceNo(charge, charge.invoiceNo);
                        }
                    }
                })
            });
            this.confirmInvoice = false;
        }
    }

    getInvoiceAndVatPartner(){
        this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
            shipment.chargeSettlements.forEach((charge: Surcharge)=>
            {
                if(!!charge.invoiceNo && !charge.vatPartnerId){
                    this.onChangeInvoiceNo(charge, charge.invoiceNo);
                }
            })
        });
    }

    onBlurAmountCharge(event: any, hblId: string) {
        if (event.target.name === 'amount') {
            this.shipments.filter((shipment: any) => shipment.hblId === hblId).map((shipment: any) => {
                shipment.totalNetVND = shipment.chargeSettlements.reduce((net: number, charge: Surcharge) => net += charge.amountVnd, 0);
                shipment.totalVND = shipment.totalNetVND + shipment.totalVATVND;
            });
            this.getTotalAmountVND();
        }
        if (event.target.name === 'vat') {
            this.shipments.filter((shipment: any) => shipment.hblId === hblId).map((shipment: any) => {
                shipment.totalVATVND = shipment.chargeSettlements.reduce((net: number, charge: Surcharge) => net += charge.vatAmountVnd, 0);
                shipment.totalVND = shipment.totalNetVND + shipment.totalVATVND;
            });
            this.getTotalAmountVND();
        }
    }

    setAdvanceToSurcharge(shipment: any, advanceNoOld: any, advanceNoNew: string) {
        // Set charge with chosen advance with new advance when change new advance
        shipment.chargeSettlements.forEach(element => {
            if (element.isSelected && element.advanceNo == advanceNoOld && advanceNoOld !== advanceNoNew) {
                element.advanceNo = element.originAdvanceNo = advanceNoNew;
            }
        });
        shipment.advanceNo = shipment.originAdvanceNo = advanceNoNew;
    }

    clearAdvance(shipment: any){
        // Set advance no = null when clear advance
        shipment.advanceNo = shipment.originAdvanceNo = null;
        shipment.chargeSettlements.forEach(element => {
            if (element.isSelected) {
                element.advanceNo = element.originAdvanceNo = null;
            }
        });
    }

    checkInputReference() {
        if (!!this.referenceInput.value) {
            this.referenceInput.setValue(this.referenceInput.value.trim());
            if (this.referenceInput.value.length === 0) {
                this.referenceInput.setValue(null);
            }
        }
    }
    // Get List Charges
    searchCharge() {
        this.isSubmitted = true;
        this.checkInputReference();
        let soaNo = [], cdNote = [], jobNo = [], hblNo = [], mblNo = [], customNo = [];
        if (!!this.referenceNo) {
            switch (this.referenceNo.value) {
                case this.referenceNos[0].value:
                    soaNo = this.mapDataSearch();
                    break;
                case this.referenceNos[1].value:
                    cdNote = this.mapDataSearch();
                    break;
                case this.referenceNos[2].value:
                    jobNo = this.mapDataSearch();
                    break;
                case this.referenceNos[3].value:
                    hblNo = this.mapDataSearch();
                    break;
                case this.referenceNos[4].value:
                    mblNo = this.mapDataSearch();
                    break;
                case this.referenceNos[5].value:
                    customNo = this.mapDataSearch();
                    break;
            }
        }
        let body: ISearchExistsChargeSettlePayment = {
            partnerId: !this.selectedPartnerData ? null : this.selectedPartnerData.id,
            soaNo: soaNo || [],
            creditNo: cdNote || [],
            jobIds: jobNo || [],
            hbls: hblNo || [],
            mbls: mblNo || [],
            customNos: customNo || [],
            servicesType: !this.selectedServices ? null : this.selectedServices.map((item: any) => item.id).toString(),
            serviceDateFrom: !!this.serviceDate.value ? (!this.serviceDate.value.startDate ? null : formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en')) : null,
            serviceDateTo: !!this.serviceDate.value ? (!this.serviceDate.value.endDate ? null : formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en')) : null,
            personInCharge: !this.personInCharge.value ? this.personInCharges.map((item: any) => item.id).join(';') : this.personInCharge.value.join(';'),
            requester: this.requester
        };
        this.isSoaCDNoteSelected();
        if (!this.referenceInput.value) {
            return;
        }
        if (this.isSOACDNote) {
            this.searchWithSOAOrCDNote(body);
        } else {
            if (!this.selectedPartnerData) {
                return;
            }
            this._accoutingRepo.getExistingCharge(body, this.settlementCode)
                .pipe(catchError(this.catchError), finalize(() => this.isLoading = false))
                .subscribe(
                    (res: any = {}) => {
                        if (!!res && res.status === false) {
                            this._toastService.error(res.message);
                            this.isSubmitted = false;
                            return of(false);
                        }
                        if (!!res) {
                            this.shipments = res.shipmentSettlement;
                            this.total = res.total;
                            this.totalAmountVnd = this.total.totalVNDStr;
                            this.checkedAllCharges();
                            this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
                                this.setAdvanceToSurcharge(shipment, null, shipment.originAdvanceNo);
                            });
                            this.getVatpartnerDataSource();
                            this.getInvoiceAndVatPartner();
                            this.orgChargeShipment = cloneDeep(res);
                            this.isSubmitted = false;
                        }
                    }
                );
        }
    }

    searchWithSOAOrCDNote(body: any) {
        this._accoutingRepo.getPartnerForSettlement(body)
            .pipe(
                catchError(this.catchError), finalize(() => this.isLoading = false),
                concatMap((res) => {
                    if (!res) {
                        this.isSubmitted = false;
                        return of(false);
                    }
                    if (res.length == 0 && !this.selectedPartnerData) {
                        this._toastService.warning('Please Select Partner!');
                        this.isSubmitted = false;
                        return of(false);
                    }
                    this.selectedPartnerData = res[0];
                    this.selectedPartner = { field: 'id', value: res[0].id };
                    body.partnerId = this.selectedPartnerData.id;
                    if (!!res.length) {
                        return this._accoutingRepo.checkSoaCDNoteIsSynced(body).pipe(
                            catchError(this.catchError),
                            concatMap((rs: any) => {
                                if (!rs.status) {
                                    this._toastService.error(rs.message);
                                    this.isSubmitted = false;
                                    return of(false);
                                } else {
                                    return this._accoutingRepo.getExistingCharge(body, this.settlementCode);
                                }
                            })
                        );
                    }
                }))
            .subscribe(
                (res: IGetExistsCharge) => {
                    if (!!res) {
                        this.orgChargeShipment = cloneDeep(res);
                        this.shipments = res.shipmentSettlement;
                        this.total = res.total;
                        this.totalAmountVnd = this.total.totalVNDStr;
                        this.checkedAllCharges();
                        this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
                            this.setAdvanceToSurcharge(shipment, null, res.shipmentSettlement.filter(x => x.hblId === shipment.hblId)[0].advanceNo);
                        });
                        this.getVatpartnerDataSource();
                        this.getInvoiceAndVatPartner();
                        this.isSubmitted = false;
                    }
                }
            );
        // else {
        //     this._accoutingRepo.checkSoaCDNoteIsSynced(body).pipe(
        //         catchError(this.catchError),
        //         concatMap((rs: any) => {
        //             if (!rs.status) {
        //                 console.log('mess', rs)
        //                 this._toastService.error(rs.message);
        //                 this.isSubmitted = false;
        //                 return of(false);
        //             } else {
        //                 return this._accoutingRepo.getExistingCharge(body);
        //             }
        //         })
        //     )
        //         .subscribe(
        //             (res: IGetExistsCharge) => {
        //                 if (!!res) {
        //                     this.orgChargeShipment = cloneDeep(res);
        //                     this.shipments = res.shipmentSettlement;
        //                     this.total = res.total;
        //                     this.totalAmountVnd = this.total.totalVNDStr;
        //                     this.checkedAllCharges();
        //                     this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
        //                         this.setAdvanceToSurcharge(shipment, null, res.shipmentSettlement.filter(x=>x.hblId === shipment.hblId)[0].advanceNo);
        //                     });
        //                     this.getVatpartnerDataSource();
        //                     this.getInvoiceAndVatPartner();
        //                     this.isSubmitted = false;
        //                 }
        //             }
        //         );
        // }
    }

    checkedAllCharges() {
        this.shipments.forEach((shipment: any) => {
            shipment.isSelected = true;
            shipment.chargeSettlements.map((i: Surcharge) => {
                i.isSelected = true;
                if (!!i.invoiceDate) {
                    i.invoiceDate = formatDate(new Date(i.invoiceDate), 'dd/MM/yyyy', 'en');
                } else {
                    i.invoiceDate = null;
                }
            }
            );
        });
    }

    // Add Charge Button event
    submit() {
        this.selectedCharge = [];
        this.shipments.forEach((shipment: any) =>
            shipment.chargeSettlements.filter((charge: Surcharge) => charge.isSelected)
                .map((surcharge: Surcharge) => this.selectedCharge.push(new Surcharge(surcharge)))
        );
        console.log('Shipment',this.shipments);
        

        // if(this.shipments.every(x=>x.jobId.includes('LOG'))){
        //     for (const charge of this.selectedCharge) {
        //         if(charge.type.toLowerCase()===CommonEnum.CHARGE_TYPE.OBH.toLowerCase()){
        //             if(!this.utility.isWhiteSpace(charge.invoiceNo )&& this.utility.isWhiteSpace(charge.seriesNo)){
        //                 this._toastService.warning("Series No Must be fill in");
        //                 return;
        //             }
        //             if(this.utility.isWhiteSpace(charge.invoiceNo) && !this.utility.isWhiteSpace(charge.seriesNo)){
        //                 this._toastService.warning("Invoice No Must be fill in");
        //                 return;
        //             }
        //         }
        //     }
        // }
        console.log('charges', this.selectedCharge)
        if (!this.selectedCharge.length) {
            this._toastService.warning(`Don't have any charges in this period, Please check it again! `);
            return;
        } else {
            this.selectedCharge.forEach(c => {
                if (!!c.invoiceDate) {
                    const [day, month, year]: string[] = c.invoiceDate.split("/");
                    c.invoiceDate = formatDate(new Date(+year, +month - 1, +day), 'yyyy-MM-dd', 'en');
                } else {
                    c.invoiceDate = null;
                }
                c.amountVnd = !c.amountVnd ? 0 : c.amountVnd;
                c.vatAmountVnd = !c.vatAmountVnd ? 0 : c.vatAmountVnd;
            });
            this.onRequest.emit(this.selectedCharge);
            this.selectedCharge = [];
            this.closePopup();
        }
    }

    getPartnerById(id: string) {
        const partner: Partner = this.listVatPartner.find((p: Partner) => p.id === id);
        return partner || null;
    }

    reset() {
        this.referenceNo.setValue(null);
        this.referenceInput.setValue(null)
        this.resetPartner();
        this.isCheckAll = false;

        this.resetData();
        this.selectedServices = (this.initService || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));
        this.serviceDate.setValue(null);
        this.personInCharge.setValue(null);
        this.resetFormShipmentInput();
        this.confirmInvoice = false;
        this.invoiceNoAll = null;
        this.resetInvoiceDateAll();
    }

    resetPartner() {
        this.selectedPartnerData = null;
        this.selectedPartner = {};
    }

    resetData() {
        this.shipments = [];
        this.total = {};
        this.totalAmountVnd = '';
    }

    resetFormShipmentInput() {
        this.referenceNo.setValue(this.referenceNos[0].value);
        this.referenceInput.setValue(null);
        this.selectedServices = (this.initService || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));
    }

    resetInvoiceDateAll(){
        this.invoiceDateAll.setValue(null);
    }

    onResetInvoice(){
        this.confirmInvoice = false;
        this.invoiceNoAll = null;
        this.resetInvoiceDateAll();
        this.shipments.forEach((shipment: ShipmentChargeSettlement) => {
            shipment.chargeSettlements.forEach((charge: Surcharge) => {
                if (charge.isSelected) {
                    charge.invoiceNo =  this.invoiceNoAll;
                    charge.invoiceDate = null;
                    this.onChangeInvoiceNo(charge, charge.invoiceNo);
                }
            })
        });
    }
}
export interface ISearchExistsChargeSettlePayment {
    soaNo: string[];
    creditNo: string[];
    jobIds: string[];
    hbls: string[];
    mbls: string[];
    customNos: string[];
    partnerId: string;
    servicesType: string;
    serviceDateFrom: string;
    serviceDateTo: string;
    personInCharge: string;
    requester: string;
}

interface IGetExistsCharge {
    shipmentSettlement: ShipmentChargeSettlement[];
    total: any;
}

class ShipmentChargeSettlement {
    isSelected: boolean = true;
    settlementNo: string = '';
    jobId: string = '';
    mbl: string = '';
    hbl: string = '';
    hblId: string = '';
    type: string = '';
    shipmentId: string = '';
    customNo: string = '';
    advanceNo: string = '';
    originAdvanceNo: string = '';
    advanceNoList: string[] = [];
    totalNetAmount: number = 0;
    totalNetAmountVND: number = 0;
    totalAmount: number = 0;
    totalAmountVND: number = 0;
    totalNetVND: number = 0;
    totalVATVND: number = 0;
    totalNetUSD: number = 0;
    totalVATUSD: number = 0;
    totalVND: number = 0;
    advanceAmount: number = 0;
    balance: number = 0;
    chargeSettlements: Surcharge[] = [];
}