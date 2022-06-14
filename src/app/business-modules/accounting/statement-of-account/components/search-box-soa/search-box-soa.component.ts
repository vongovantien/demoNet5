import { Component, EventEmitter, Output } from '@angular/core';
import { formatDate } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { Currency, Partner, User } from 'src/app/shared/models';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { SortService, DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { AppForm } from '@app';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';
import { SearchListSOA } from '../../store/actions';
import { getDataSearchSOAState, getSOAPagingState } from '../../store/reducers';

@Component({
    selector: 'soa-search-box',
    templateUrl: './search-box-soa.component.html',
})
export class StatementOfAccountSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    selectedRange: any;

    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    partners: Partner[] = [];
    selectedPartner: any = {};

    currencyList: Currency[] = [];
    selectedCurrency: any = null;

    users: User[] = [];
    userLogged: User;
    currentUser: User = null;

    statusSOA: any[] = [];
    selectedStatus: any = null;

    reference: string = '';

    constructor(
        private _sysRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _dataService: DataService,
        private _store: Store<IAppState>,
    ) {
        super();
        this.requestReset = this.reset;
    }

    ngOnInit(): void {
        this.getBasicData();
        this.getStatus();
        this.getUserLogged();
        this.subscriptionSearchParamState();
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    subscriptionSearchParamState() {
        this._store.select(getDataSearchSOAState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (!!data) {
                        this.reference=data.dataSearch.strCodes;
                    }
                }
            );
    }

    getBasicData() {
        forkJoin([ // ? forkJoin like Promise.All
            this._catalogueRepo.getListCurrency(),
            this._sysRepo.getListSystemUser(),
            this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.ALL, active: true })
        ]).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                ([dataCurrency, dataSystemUser, dataPartner]: any) => {
                    this.partners = this.mapModel(dataPartner, Partner);
                    // * add all value into partners data
                    this.partners.push(new Partner({ taxCode: 'All', shortName: 'All', partnerNameEn: 'All' }));
                    this.selectedPartner = { field: 'partnerNameEn', value: 'All' };

                    this.partners = this._sortService.sort(this.partners, 'shortName', true);
                    this.currencyList = dataCurrency || [];
                    this.users = dataSystemUser || [];
                    // * set config for combogird
                    this.configPartner.dataSource = this.partners;
                    this.configPartner.displayFields = [
                        { field: 'taxCode', label: 'Taxcode' },
                        { field: 'shortName', label: 'Name (ABR)' },
                        { field: 'partnerNameEn', label: 'Customer Name [EN]' },
                    ];
                    this.configPartner.selectedDisplayFields = ['partnerNameEn'];

                    this._dataService.setData(SystemConstants.CSTORAGE.CURRENCY, dataCurrency);
                    this._dataService.setData(SystemConstants.CSTORAGE.PARTNER, dataPartner);
                    this._dataService.setData(SystemConstants.CSTORAGE.SYSTEM_USER, dataSystemUser);
                },
            );
    }

    getStatus() {
        this.statusSOA = [
            { title: 'New', name: 'New' },
            { title: 'Issued Voucher', name: 'Issued Voucher' },
            { title: 'Issued Invoice', name: 'Issued Invoice' },
            { title: 'Request Confirmed', name: 'Request Confirmed' },
            { title: 'Confirmed ', name: 'Confirmed ' },
            { title: 'Need Revise', name: 'Need Revise' },
            { title: 'Done', name: 'Done' },
        ];
        // this.selectedStatus = this.statusSOA[0];
    }

    onSelectDataFormSearch(data: any, key: string) {
        switch (key.toLowerCase()) {
            case 'partner':
                this.selectedPartner = <any>{ field: data.partnerNameEn, value: data.id };
                break;
            case 'currency':
                this.selectedCurrency = data;
                break;
            case 'user':
                this.currentUser = data;
                break;
            case 'status':
                this.selectedStatus = data;
                break;
            default:
                break;
        }

    }

    mapModel(data: any[], Model: any) {
        try {
            return (data || []).map((item: any) => new Model(item));
        } catch (error) {
            // Todo handle error.
            console.log(error + '');
        }
    }

    search() {
        const body = {
            strCodes: this.reference.replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').split(',').toString().trim(),
            customerID: (this.selectedPartner.value === 'All' ? '' : this.selectedPartner.value) || '',
            soaFromDateCreate: !!this.selectedRange.startDate ? formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en') : null,
            soaToDateCreate: !!this.selectedRange.endDate ? formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en') : null,
            soaStatus: !!this.selectedStatus ? this.selectedStatus.name : null,
            soaCurrency: !!this.selectedCurrency ? this.selectedCurrency.id : null,
            soaUserCreate: !!this.currentUser ? this.currentUser.id : null,
            CurrencyLocal: "VND"
        };
        this._store.dispatch(SearchListSOA({ dataSearch: body }));
        this.onSearch.emit(body);
    }

    // * reset data in form search
    reset() {
        this.reference = '';
        this.selectedPartner = { field: 'partnerNameEn', value: 'All' };
        this.currentUser = null;
        this.selectedStatus = null;
        this.selectedRange = null;
        this.selectedCurrency = null;
        // ? search again!
        this.onSearch.emit(<any>{ CurrencyLocal: "VND" });
    }

    resetDate(){
        this.selectedRange = null;
    }

    resetPersonalHandle(){
        this.currentUser = null;
    }

}
