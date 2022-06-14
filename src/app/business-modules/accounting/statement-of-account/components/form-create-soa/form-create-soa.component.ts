import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { Charge, SOASearchCharge, User } from 'src/app/shared/models';
import { SystemConstants } from 'src/constants/system.const';
import { catchError, takeUntil, take, skip } from 'rxjs/operators';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { formatDate } from '@angular/common';
import _includes from 'lodash/includes';
import _uniq from 'lodash/uniq';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { DataService, SortService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { ShareModulesInputShipmentPopupComponent } from 'src/app/business-modules/share-modules/components';
import { Store } from '@ngrx/store';
import { IAppState, getMenuUserPermissionState } from '@store';
import { cloneDeep } from 'lodash';
import _uniqBy from 'lodash/uniqBy';

@Component({
    selector: 'soa-form-create',
    templateUrl: './form-create-soa.component.html'
})

export class StatementOfAccountFormCreateComponent extends AppPage {
    @Output() onApply: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(ShareModulesInputShipmentPopupComponent) inputShipmentPopupComponent: ShareModulesInputShipmentPopupComponent;

    configPartner: CommonInterface.IComboGirdConfig = {
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

    selectedRangeDate: any = null;

    selectedPartner: any = {};
    selectedCharge: any = {};
    selectedCharges: any[] = []; // for multiple select
    selectedCustomerShipment: any = {};
    selectedSaleman: any = null;
    saleMans: any[] = [];
    itlBOD: any = [];
    salemanDisplay: string = '';
    
    dateModes: any[] = [];
    selectedDateMode: any = null;

    types: any = [];
    selectedType: any = null;

    obhs: any = [];
    selectedObh: any = null;

    currencyList: any[] = [];
    selectedCurrency: any = null;

    users: any = [];
    selectedUser: any = [];

    services: any[] = [];
    selectedService: any[] = [];

    note: string = '';

    dataSearch: SOASearchCharge = new SOASearchCharge();

    isApplied: boolean = false;

    commodityGroup: any[] = [];
    commodity: any = null;

    shipmentInput: OperationInteface.IInputShipment;

    numberOfShipment: number = 0;
    airlineCode: string = '';

    userLogged: any;

    staffTypes: any = [];
    selectedStaffType: any = null;

    constructor(
        private _toastService: ToastrService,
        private _dataService: DataService,
        private _catalogueRepo: CatalogueRepo,
        private _sysRepo: SystemRepo,
        private _sortService: SortService,
        private _store: Store<IAppState>,
    ) {
        super();
    }

    ngOnInit() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.initBasicData();
        this.getUserLevel();
        this.getPartner();
        this.getCurrency();
        //this.getUser();
        this.getCharge();
        this.getService();
        this.getCommondity();
    }

    getUserLevel() {
        this._store.select(getMenuUserPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe), skip(1)) //* skip(1) - tránh case load 2 lần */
            .subscribe((menuPermission: SystemInterface.IUserPermission) => {
                if (menuPermission !== null && menuPermission !== undefined && Object.keys(menuPermission).length !== 0) {
                    console.log(menuPermission);
                    if (menuPermission.detail !== 'None') {
                        if (menuPermission.detail === 'All') {
                            this.getUserLevelByType({});
                        } else if (menuPermission.detail === 'Company') {
                            this.getUserLevelByType({ type: 'company', companyId: this.userLogged.companyId });
                        } else if (menuPermission.detail === 'Office') {
                            this.getUserLevelByType({ type: 'office', companyId: this.userLogged.companyId, officeId: this.userLogged.officeId });
                        } else if (menuPermission.detail === 'Department') {
                            this.getUserLevelByType({ type: 'department', companyId: this.userLogged.companyId, officeId: this.userLogged.officeId, departmentId: this.userLogged.departmentId });
                        } else if (menuPermission.detail === 'Group') {
                            this.getUserLevelByType({ type: 'group', companyId: this.userLogged.companyId, officeId: this.userLogged.officeId, departmentId: this.userLogged.departmentId, groupId: this.userLogged.groupId });
                        } else {
                            this.getUserLevelByType({ type: 'owner', companyId: this.userLogged.companyId, officeId: this.userLogged.officeId, departmentId: this.userLogged.departmentId, groupId: this.userLogged.groupId, userId: this.userLogged.id });
                        }
                    }
                }
            });
    }

    getUserLevelByType(body: any) {
        this._sysRepo.getUserLevelByType(body).pipe(catchError(this.catchError))
            .subscribe(
                (dataUser: any) => {
                    this.getCurrencyUser(dataUser);
                    console.log(dataUser)
                },
            );
    }

    getCommondity() {
        this._catalogueRepo.getCommodityGroup({})
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.commodityGroup = res || [];
                },
                (errors: any) => { },
                () => { },
            );
    }

    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.getPartnerData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER));
        } else {
            this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.ALL, active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataPartner: any) => {
                        this.getPartnerData(dataPartner);
                    },
                );

        }

        this._sysRepo.getEmployeeByUserId('ad78fc30-5316-46e5-bc9d-7e207efafbec').pipe()
            .subscribe((data: any) => {
                if(data){
                    this.itlBOD = [{ id: 'ad78fc30-5316-46e5-bc9d-7e207efafbec', value: data.employeeNameEn }];
                }
            })
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
        this.configPartner.displayFields = [
            { field: 'taxCode', label: 'Taxcode' },
            { field: 'shortName', label: 'Name' },
            { field: 'partnerNameEn', label: 'Customer Name' },
        ];
        this.configPartner.selectedDisplayFields = ['partnerNameEn'];
    }

    getCurrencyData(data: any) {
        this.currencyList = (data).map((item: any) => ({ id: item.id, text: item.id }));
        this.selectedCurrency = this.currencyList.filter((curr) => curr.id === "VND")[0];
        this.updateDataSearch('currency', this.selectedCurrency.id);
        this.updateDataSearch('currencyLocal', 'VND');
    }

    getCurrencyUser(data: any) {
        //this.users = (data || []).map((item: User) => ({ id: item.id, text: item.username }));
        this.users = (data || []).map((item: any) => ({ id: item.userId, text: item.userName })).filter((d, i, arr) => arr.findIndex(t => t.id === d.id) === i); // Distinct Users
        const userLogged: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.selectedUser = [this.users.filter((i: CommonInterface.INg2Select) => i.text.toLowerCase() === userLogged.userName.toLowerCase())[0]];

        this.updateDataSearch('strCreators', this.selectedUser.map((item: any) => item.id).toString());
    }

    getService() {
        this._sysRepo.getListServiceByPermision()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {

                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        //
                        // sort A -> Z theo text services
                        this.sortIncreaseServices('text', true);

                        this.services.unshift({ id: 'All', text: 'All' });

                        this.selectedService = [this.services[0].id];

                        /* */
                        this.dataSearch.strServices = this.services.filter(service => service.id !== 'All').map(service => service.id).toString();
                        this.dataSearch.serviceTypeId = this.dataSearch.strServices.replace(/(?:,)/g, ';');
                    } else {
                        this.handleError(null, (data) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                },
            );
    }

    sortIncreaseServices(sortField: string, order: boolean) {
        this.services = this._sortService.sort(this.services, sortField, order);
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.getCurrencyData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY));
        } else {
            this._catalogueRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCurrency: any) => {
                        this.getCurrencyData(dataCurrency);
                    },
                );
        }
    }

    getUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.getCurrencyUser(this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER));
        } else {
            this._sysRepo.getListSystemUser()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataUser: any) => {
                        this.getCurrencyUser(dataUser);
                    },
                );
        }
    }

    getCharge() {
        this._catalogueRepo.getListCharge()
            .pipe(catchError(this.catchError))
            .subscribe((data) => {
                this.charges = data;
                this.charges.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));

                this.configCharge.dataSource = data || [];
                this.configCharge.displayFields = [
                    { field: 'code', label: 'Charge Code' },
                    { field: 'chargeNameEn', label: 'Charge Name EN ' },
                ];
                this.configCharge.selectedDisplayFields = ['code'];

                this._dataService.setData(SystemConstants.CSTORAGE.CHARGE, data || []);
            },
            );
    }

    initBasicData() {
        this.dateModes = [
            { title: 'Created Date', value: 'CreatedDate' },
            { title: 'Service Date', value: 'ServiceDate' },
            //{ title: 'Invoice Issued Date', value: 'InvoiceIssuedDate' }, //Bỏ ra [20/01/2021]
        ];
        this.selectedDateMode = this.dateModes[1];

        this.types = [
            // { title: 'All', value: 'All' }, Đã confirm không cần type All [13/10/2020]
            { title: 'Debit', value: 'Debit' },
            { title: 'Credit', value: 'Credit' },
        ];
        this.selectedType = this.types[0];

        this.obhs = [
            { title: 'Yes', value: true },
            { title: 'No', value: false }
        ];
        this.selectedObh = this.obhs[0];

        this.staffTypes = [
            { value: 'PersonInCharge', title: 'Person In Charge' },
            { value: 'Salesman', title: 'Salesman' },
            { value: 'Creator', title: 'Creator' }
        ];
        this.selectedStaffType = this.staffTypes[0];

        this.updateDataSearch('isOBH', this.selectedObh.value);
        this.updateDataSearch('dateType', this.selectedDateMode.value);
        this.updateDataSearch('type', this.selectedType.value);
    }

    updateDataSearch(key: string, data: any) {
        this.dataSearch[key] = data;
        this.onChange.emit({ key: key, data: data });
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type.toLowerCase()) {
            case 'partner':
                this.selectedPartner = { field: data.partnerNameEn, value: data.id };
                this.updateDataSearch('customerID', this.selectedPartner.value);
                this.getInfoAgreement();
                break;
            case 'customershipment':
                this.selectedCustomerShipment = { field: data.partnerNameEn, value: data.id };
                this.updateDataSearch('customerShipmentId', this.selectedCustomerShipment.value);
                break;
            case 'date-mode':
                this.selectedDateMode = data;
                this.updateDataSearch('dateType', this.selectedDateMode.value);
                break;
            case 'type':
                this.selectedType = data;
                this.updateDataSearch('type', this.selectedType.value);
                this.getInfoAgreement();
                break;
            case 'obh':
                this.selectedObh = data;
                this.updateDataSearch('isOBH', this.selectedObh.value);
                break;
            case 'staff-style':
                this.selectedStaffType = data;
                this.updateDataSearch('staffType', this.selectedStaffType.value);
                break;
            case 'currency':
                this.selectedCurrency = data;
                this.updateDataSearch('currency', this.selectedCurrency.id);
                break;
            case 'service':
                // * reset selected charges & dataSource.
                this.selectedCharges.length = 0;
                this.configCharge.dataSource = this.charges;

                if (data.id === 'All') {
                    this.selectedService.length = 0;
                    this.selectedService = [...this.selectedService, 'All'];
                    this.configCharge.dataSource = [...this.charges];

                    this.updateDataSearch('serviceTypeId', this.services.filter(service => service.id !== 'All').map(service => service.id).toString().replace(/(?:,)/g, ';'));
                    this.updateDataSearch('strServices', this.services.filter(service => service.id !== 'All').map(service => service.id).toString());
                } else {
                    this.detectServiceWithAllOption(data.id);

                    // ? filter charge when add service
                    this.configCharge.dataSource = [...this.filterChargeWithService([...this.configCharge.dataSource], this.selectedService)];
                    this.configCharge.dataSource = [...this.configCharge.dataSource, new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' })];

                    this.updateDataSearch('serviceTypeId', this.selectedService.toString().replace(/(?:,)/g, ';'));
                    this.updateDataSearch('strServices', this.selectedService.toString());
                }

                break;
            case 'user':
                this.selectedUser = [];
                this.selectedUser.push(...data);
                this.updateDataSearch('strCreators', this.selectedUser.map((item: any) => item.id).toString());
                break;
            case 'charge':
                if (data.id === 'All') {
                    this.selectedCharges.length = 0;
                    this.selectedCharges.push({ id: 'All', code: 'All', chargeNameEn: 'All' });
                } else {
                    this.selectedCharges.push(data);
                    this.selectedCharges = [...new Set(this.selectedCharges)];

                    this.detectChargeWithAllOption(data);
                }
                break;
            case 'saleman':
                this.selectedSaleman = {};
                if(!!data){
                    this.selectedSaleman = cloneDeep({ id: data.id, value: data.value });
                    this.salemanDisplay = this.selectedSaleman.value;
                    this.updateDataSearch('salemanId', this.selectedSaleman.id);
                } else{
                    this.salemanDisplay = null;
                    this.updateDataSearch('salemanId', null);
                }
                break;
            default:
                break;
        }
    }

    onRemoveService(data: any) {
        // * filter charge when delete service
        this.configCharge.dataSource = [...this.filterChargeWithService([...this.configCharge.dataSource], this.selectedService)];

    }

    onRemoveUser(data: any) {
        this.selectedUser.splice(this.selectedUser.findIndex((item: any) => item.id === data.id), 1);
    }

    onRemoveCharge(index: number = 0) {
        this.selectedCharges.splice(index, 1);
    }

    detectServiceWithAllOption(data?: any) {
        if (!this.selectedService.every((value: any) => value !== 'All')) {
            this.selectedService.splice(this.selectedService.findIndex((item: any) => item === 'All'), 1);

            this.selectedService.length = 0;
            this.selectedService = [...this.selectedService, data];
        }
    }

    detectChargeWithAllOption(data?: any) {
        if (!this.selectedCharges.every((value: any) => value.id !== 'All')) {
            this.selectedCharges.splice(this.selectedCharges.findIndex((item: any) => item.id === 'All'), 1);

            this.selectedCharges.length = 0;
            this.selectedCharges = [...this.selectedCharges, data];
        }
    }

    isValidSearch(){
        if (this.isApplied && !this.selectedRangeDate.startDate || !this.selectedPartner.value) {
            return false;
        }
        if(this.selectedType.value === this.types[0].value){
            if(!this.salemanDisplay){
                return false;
            }
            if(this.selectedStaffType.value === this.staffTypes[1].value && (!this.selectedUser.some((item: any) => item.id === this.selectedSaleman.id))){
                this._toastService.warning("Selection Staff Saleman and Saleman must be the same.")
                return false;
            }
        }
        return true;
    }

    onApplySearchCharge() {
        this.isApplied = true;
        if (!this.isValidSearch()) {
            return;
        } else {
            const body = {
                currencyLocal: 'VND',
                currency: this.selectedCurrency.id,
                customerID: this.selectedPartner.value || '',
                dateType: this.selectedDateMode.value,
                fromDate: formatDate(this.selectedRangeDate.startDate, 'yyyy-MM-dd', 'en'),
                toDate: formatDate(this.selectedRangeDate.endDate, 'yyyy-MM-dd', 'en'),
                type: this.selectedType.value,
                isOBH: this.selectedObh.value,
                strCreators: this.selectedUser.map((item: any) => item.id).toString(),
                strCharges: this.selectedCharges.map((item: any) => item.id).toString(),
                note: this.note,
                serviceTypeId: this.selectedService[0] === 'All' ? this.services.filter(service => service.id !== 'All').map(service => service.id).toString().replace(/(?:,)/g, ';') : this.selectedService.toString().replace(/(?:,)/g, ';'),
                commodityGroupId: !!this.commodity ? this.commodity.id : null,
                strServices: this.selectedService[0] === 'All' ? this.services.filter(service => service.id !== 'All').map(service => service.id).toString() : this.selectedService.toString(),
                jobIds: this.mapShipment("JOBID"),
                hbls: this.mapShipment("HBL"),
                mbls: this.mapShipment("MBL"),
                customNo: this.mapShipment("CustomNo"),
                airlineCode: this.airlineCode,
                staffType: this.selectedStaffType.value,
                customerShipmentId: !!this.selectedCustomerShipment ? this.selectedCustomerShipment.value : null,
                salemanId: !!this.salemanDisplay ? this.selectedSaleman.id : null
            };
            this.dataSearch = new SOASearchCharge(body);
            this.onApply.emit(this.dataSearch);
        }
    }

    onChangeRangeDate(rangeDate: any) {
        if (!!rangeDate.startDate) {
            this.updateDataSearch('fromDate', formatDate(rangeDate.startDate, 'yyyy-MM-dd', 'en'));
        }
        if (!!rangeDate.endDate) {
            this.updateDataSearch('toDate', formatDate(rangeDate.endDate, 'yyyy-MM-dd', 'en'));
        }
    }

    onChangeNote(note: string) {
        this.dataSearch.note = note;
        this.updateDataSearch('note', note);
    }

    filterChargeWithService(charges: any[], keys: any[]) {
        const result: any[] = [];
        const ch = [...charges];
        for (const charge of ch) {
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


    mapServiceId(service: any = 'All') {
        let serviceTypeId = '';
        if (!!service) {
            if (service === 'All') {
                this.services = this.services.filter(service => service.id !== 'All');
                serviceTypeId = this.services.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            } else {
                serviceTypeId = this.selectedService.toString().replace(/(?:,)/g, ';');
            }
        } else {
            this.services.shift(); // * remove item with value 'All'
            serviceTypeId = this.services.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
        }

        return serviceTypeId;
    }

    openInputShipment() {
        this.inputShipmentPopupComponent.show();
    }

    onShipmentList(data: any) {
        this.shipmentInput = data;
        if (data) {
            this.numberOfShipment = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).length;
        } else {
            this.numberOfShipment = 0;
        }
    }

    mapShipment(type: string) {
        let _shipment = [];
        if (this.shipmentInput) {
            if (this.shipmentInput.keyword.length > 0) {
                const _keyword = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim());
                if (this.shipmentInput.type === type) {
                    _shipment = _keyword;
                }
            }
        }
        return _shipment;
    }

    getInfoAgreement(){
        if(this.selectedType.value === this.types[0].value && !!this.selectedPartner.value){
            this.saleMans = [];
            this._catalogueRepo.getAgreement(
                {
                    partnerId: this.selectedPartner.value, status: true, isGetChild: true
                }).subscribe(
                    (agreements: any[]) => {
                        if (!!agreements && !!agreements.length) {
                            this.selectedCurrency = this.currencyList.filter((curr) => curr.id === agreements[0].creditCurrency)[0];
                            this.saleMans = [...agreements.map(x => ({id: x.saleManId, value: x.saleManName})), ...this.itlBOD];
                            this.saleMans = _uniqBy(this.saleMans, 'id');
                        }else{
                            this.saleMans = this.itlBOD;
                            this.selectedCurrency = this.currencyList.filter((curr) => curr.id === "VND")[0];
                        }
                        this.updateDataSearch('currency', this.selectedCurrency.id);
                        if(this.saleMans.length > 0){
                            this.onSelectDataFormInfo(this.saleMans[0], 'saleman');
                        }
                        else{
                            this.onSelectDataFormInfo(null, 'saleman');
                        }
                    }
                );
            }
            else{
                this.onSelectDataFormInfo(null, 'saleman');
            }
    }
}
