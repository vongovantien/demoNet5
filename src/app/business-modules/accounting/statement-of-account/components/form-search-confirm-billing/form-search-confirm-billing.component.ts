import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { JobConstants, SystemConstants } from '@constants';
import { CommonEnum } from '@enums';
import { Partner, User } from '@models';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppForm } from 'src/app/app.form';
import { SortService } from '@services';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'form-search-confirm-billing',
    templateUrl: './form-search-confirm-billing.component.html'
})

export class ConfirmBillingFormSearchComponent extends AppForm implements OnInit {
    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    searchOption: AbstractControl;
    referenceNo: AbstractControl;
    partner: AbstractControl;
    dateType: AbstractControl;
    issueDate: AbstractControl;
    confirmedBilling: AbstractControl;
    service: AbstractControl;
    csHandling: AbstractControl;

    partners: Observable<Partner[]>;
    formSearch: FormGroup;

    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;

    displayFieldsCreator: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameVn', label: 'Full Name' }
    ];

    searchOptionList: string[] = ['Debit Note', 'SOA', 'VAT Invoice'];
    dateTypeList: string[] = ['Confirm Billing Date', 'VAT Invoice Date'];
    confirmedBillingList: string[] = ['All', 'Yes', 'No'];

    services: any[] = [];
    selectedService: any[] = [];
    csHandlings: any[] = [];
    selectedCsHandling: any[] = [];

    dataSearch: any;
    userLogged: User;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _sysRepo: SystemRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestReset = this.reset;
    }

    ngOnInit() {
        this.initFormSearch();
        this.loadPartnerList();
        this.loadUserList();
        this.getService();
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            searchOption: [this.searchOptionList[0]],
            referenceNo: [],
            partner: [],
            dateType: [this.dateTypeList[1]],
            issueDate: [], // [{ startDate: new Date(), endDate: new Date() }],
            confirmedBilling: [this.confirmedBillingList[0]],
            service: [this.selectedService],
            csHandling: [this.selectedCsHandling]
        });
        this.searchOption = this.formSearch.controls['searchOption'];
        this.referenceNo = this.formSearch.controls['referenceNo'];
        this.partner = this.formSearch.controls['partner'];
        this.dateType = this.formSearch.controls['dateType'];
        this.issueDate = this.formSearch.controls['issueDate'];
        this.confirmedBilling = this.formSearch.controls['confirmedBilling'];
        this.service = this.formSearch.controls['service'];
        this.csHandling = this.formSearch.controls['csHandling'];
    }

    getService() {
        this._sysRepo.getListServiceByPermision()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        this.sortIncreaseServices('text', true);
                        this.services.unshift({ id: 'All', text: 'All' });
                        this.selectedService = [this.services[0].id];
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

    loadPartnerList() {
        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL, true);
    }

    loadUserList() {
        this._systemRepo.getSystemUsers({}).pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.csHandlings = this.utility.prepareNg2SelectData(res, 'id', 'username');
                        this.sortIncreaseServices('username', true);
                        this.csHandlings.unshift({ id: 'All', text: 'All' });
                        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
                        this.selectedCsHandling = [this.csHandlings.filter(stf => stf.id === this.userLogged.id)[0].id];
                    } else {
                        this.handleError(null, (data) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                },
            );
    }

    onSelectDataFormInfo(data: { id: any; }, type: string) {
        switch (type) {
            case 'partner':
                this.formSearch.controls['partner'].setValue(data.id);
                break;
            case 'service':
                if (data.id === 'All') {
                    this.selectedService.length = 0;
                    this.selectedService = [...this.selectedService, 'All'];
                } else {
                    this.detectServiceWithAllOption('service', data.id);
                }
                break;
            case 'csHandling':
                if (data.id === 'All') {
                    this.selectedCsHandling.length = 0;
                    this.selectedCsHandling = [...this.selectedCsHandling, 'All'];
                } else {
                    this.detectServiceWithAllOption('csHandling', data.id);
                }
                break;
            default:
                break;
        }
    }

    onRemoveDataFormInfo(data: any, type: string) {
        this.detectServiceWithAllOption(type);
    }

    detectServiceWithAllOption(type: string, data?: any) {
        if (type === "service") {
            if (!this.selectedService.every((value) => value !== 'All')) {
                this.selectedService.splice(this.selectedService.findIndex((item) => item === 'All'), 1);
                this.selectedService = [];
                this.selectedService.push(data);
            }
        }
        if (type === "csHandling") {
            if (!this.selectedCsHandling.every((value) => value !== 'All')) {
                this.selectedCsHandling.splice(this.selectedCsHandling.findIndex((item) => item === 'All'), 1);
                this.selectedCsHandling = [];
                this.selectedCsHandling.push(data);
            }
        }
    }

    mapObject(dataSelected: any[], dataList: any[]) {
        let result = '';
        if (dataSelected.length > 0) {
            if (dataSelected[0] === 'All') {
                const list = dataList.filter(f => f.id !== 'All');
                result = list.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            } else {
                result = dataSelected.toString().replace(/(?:,)/g, ';');
            }
        }
        return result;
    }

    onSubmit() {
        const criteria: any = {
            searchOption: this.searchOption.value,
            referenceNos: !!this.referenceNo.value ? this.referenceNo.value.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            partnerId: this.partner.value,
            dateType: !!this.dateType.value ? this.dateType.value : null,
            fromDate: this.issueDate.value ? (this.issueDate.value.startDate !== null ? formatDate(this.issueDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            toDate: this.issueDate.value ? (this.issueDate.value.endDate !== null ? formatDate(this.issueDate.value.endDate, 'yyyy-MM-dd', 'en') : null) : null,
            confirmedBilling: !!this.confirmedBilling.value ? this.confirmedBilling.value : null,
            services: this.mapObject(this.selectedService, this.services),
            csHandling: this.mapObject(this.selectedCsHandling, this.csHandlings)
        };
        this.onSearch.emit(criteria);
    }

    search() {
        this.onSubmit();
    }

    reset() {
        this.formSearch.reset();
        // this.issueDate.setValue({ startDate: new Date(), endDate: new Date() });
        this.searchOption.setValue(this.searchOptionList[0]);

        this.dateType.setValue(this.dateTypeList[1]);

        this.confirmedBilling.setValue(this.confirmedBillingList[0]);

        this.selectedService = [this.services[0].id];
        this.service.setValue(this.selectedService);

        this.selectedCsHandling = [this.csHandlings.filter(stf => stf.id === this.userLogged.id)[0].id];
        this.csHandling.setValue(this.selectedCsHandling);

        this.onSearch.emit(<any>{
            searchOption: this.searchOption.value,
            dateType: !!this.dateType.value ? this.dateType.value : null,
            fromDate: this.issueDate.value ? (this.issueDate.value.startDate !== null ? formatDate(this.issueDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            toDate: this.issueDate.value ? (this.issueDate.value.endDate !== null ? formatDate(this.issueDate.value.endDate, 'yyyy-MM-dd', 'en') : null) : null,
            confirmedBilling: !!this.confirmedBilling.value ? this.confirmedBilling.value : null,
            services: this.mapObject(this.selectedService, this.services),
            csHandling: this.mapObject(this.selectedCsHandling, this.csHandlings)
        });
    }
}
