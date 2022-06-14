import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { AppList } from 'src/app/app.list';

import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { Customer, Contract } from '@models';
import { CatalogueRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { CommonEnum } from '@enums';
import { RoutingConstants, SystemConstants } from '@constants';
import { Permission403PopupComponent, ConfirmPopupComponent, SearchOptionsComponent } from '@common';

import { catchError, finalize, map, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { LoadListCustomer, SearchList } from './store/actions/customer.action';
import { ICustomerState, getCustomerSearchParamsState, getCustomerListState } from './store';
import { Observable } from 'rxjs';
import { getMenuUserSpecialPermissionState } from '@store';
import { FormContractCommercialPopupComponent } from '../../share-modules/components';
import { FormSearchExportComponent } from '../components/popup/form-search-export/form-search-export.popup';


@Component({
    selector: 'app-commercial-customer',
    templateUrl: './commercial-customer.component.html',
})
export class CommercialCustomerComponent extends AppList implements OnInit {

    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(SearchOptionsComponent, { static: true }) searchOptionsComponent: SearchOptionsComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(FormSearchExportComponent) formSearchExportPopup: FormSearchExportComponent;

    menuSpecialPermission: Observable<any[]>;

    customers: Customer[] = [];
    saleMans: Contract[] = [];

    dataSearchs: any = [];


    selectedCustomer: Customer;

    headerSalemans: CommonInterface.IHeaderTable[];

    headerSearch: CommonInterface.IHeaderTable[];

    constructor(private _ngProgressService: NgProgress,
        private _store: Store<ICustomerState>,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _router: Router,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _cd: ChangeDetectorRef) {
        super();

        this._progressRef = this._ngProgressService.ref();
        this.requestSearch = this.onSearch;
        this.requestList = this.getPartners;
        this.requestSort = this.sortPartners;
    }


    ngOnInit(): void {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this._store.select(getCustomerSearchParamsState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (!!data && !!data.keyword) {
                        this.dataSearchs = data;
                    }

                }
            );
        this._store.select(getCustomerListState)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new Customer(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.customers = res.data || [];
                    this.totalItems = res.totalItems || 0;
                }
            );
        this.headerSalemans = [
            { title: 'No', field: '', sortable: true },
            { title: 'Salesman', field: 'username', sortable: true },
            { title: 'Agreement Type', field: 'contractType', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
            { title: 'Office', field: 'office', sortable: true },
            { title: 'Company', field: 'company', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'CreateDate', field: 'createDate', sortable: true },
        ];
        this.headers = [
            { title: 'Partner ID', field: 'accountNo', sortable: true },
            { title: 'Name ABBR', field: 'shortName', sortable: true },
            { title: 'Tax Code', field: 'taxCode', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },

            { title: 'Modify', field: 'datetimeModified', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
            { title: 'Billing Address', field: 'addressVn', sortable: true },
        ];

        this.headerSearch = [
            { title: 'Partner ID', field: 'accountNo', sortable: true },
            { title: 'Name ABBR', field: 'shortName', sortable: true },
            { title: 'Tax Code', field: 'taxCode', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
            { title: 'Salesman', field: 'Saleman', sortable: true },
            { title: 'Agreement Type', field: 'contractType', sortable: true },
        ];

        this.configSearch = {
            settingFields: this.headerSearch.map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab
        };
        localStorage.removeItem('success_add_sub');
        this.dataSearch = { All: '' };
        this.dataSearch.partnerType = 'Customer';
        // this.getPartners();
        this.onSearch(this.dataSearch);
    }

    onSearch(event: CommonInterface.ISearchOption) {
        this.dataSearch = {};
        this.dataSearch.partnerType = 'Customer';
        this.dataSearch[event.field || "All"] = event.searchString || '';

        if (!!event.field && event.searchString === "") {
            this.dataSearchs.keyword = "";
        }
        const searchData: ISearchGroup = {
            type: !!event.field ? event.field : this.dataSearchs.type,
            keyword: !!event.searchString ? event.searchString : this.dataSearchs.keyword
        };
        //this.page = 1;
        this._store.dispatch(SearchList({ payload: searchData }));
        this._store.select(getCustomerListState)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((data: any) => {
                    return {
                        page: data.page,
                        pageSize: data.size
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.page = !!res.page ? res.page : 1,
                        this.pageSize = !!res.pageSize ? res.pageSize : 15
                }
            );

        if (Object.keys(this.dataSearchs).length > 0) {
            const type = this.dataSearchs.type === "userCreatedName" ? "userCreated" : this.dataSearchs.type;
            this.dataSearch[type] = this.dataSearchs.keyword;
        }
        //this._store.dispatch(LoadListCustomer({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
        this.requestList();
    }

    onCustomerRequest() {
        this.formContractPopup.formGroup.patchValue({
            officeId: [this.formContractPopup.offices[0]],
            contractNo: null,
            effectiveDate: null,
            expiredDate: null,
            paymentTerm: null,
            creditLimit: null,
            creditLimitRate: null,
            trialCreditLimit: null,
            trialCreditDays: null,
            trialEffectDate: null,
            trialExpiredDate: null,
            creditAmount: null,
            billingAmount: null,
            paidAmount: null,
            unpaidAmount: null,
            customerAmount: null,
            creditRate: null,
            description: null,
            vas: null,
            saleService: null,
        });
        this.formContractPopup.files = null;
        this.formContractPopup.fileList = null;
        this.formContractPopup.isUpdate = false;
        this.formContractPopup.isSubmitted = false;
        const userLogged = JSON.parse(localStorage.getItem('id_token_claims_obj'));
        this.formContractPopup.salesmanId.setValue(userLogged.id + '-' + userLogged.groupId + '-' + userLogged.departmentId);
        this.formContractPopup.formGroup.controls['paymentTerm'].setValue(30);
        this.formContractPopup.formGroup.controls['creditLimitRate'].setValue(120);
        this.formContractPopup.autoExtendDays.setValue(0);

        this.formContractPopup.contractType.setValue('Trial');
        this.formContractPopup.currencyId.setValue('VND');
        this.formContractPopup.creditCurrency.setValue('VND');
        this.formContractPopup.baseOn.setValue('Invoice Date');

        this.formContractPopup.trialEffectDate.setValue(null);
        this.formContractPopup.trialExpiredDate.setValue(null);
        this.formContractPopup.effectiveDate.setValue(null);
        this.formContractPopup.isCustomerRequest = true;
        this.formContractPopup.show();
        // this.formContractPopup.show();
    }

    onRequestContract($event: boolean) {
        const success = $event;
        if (success === true) {
            this.requestList();
        }
    }
    ngAfterViewInit() {
        if (Object.keys(this.dataSearchs).length > 0) {
            this.searchOptionsComponent.searchObject.searchString = this.dataSearchs.keyword;
            const type = this.dataSearchs.type === "userCreated" ? "userCreatedName" : this.dataSearchs.type;
            this.searchOptionsComponent.searchObject.field = this.dataSearchs.type;
            this.searchOptionsComponent.searchObject.displayName = this.dataSearchs.type !== "All" ? this.headerSearch.find(x => x.field === type).title : this.dataSearchs.type;
        }
        this._cd.detectChanges();
    }

    getPartners() {
        // this.isLoading = true;
        // this._progressRef.start();
        // this._catalogueRepo.getListPartner(this.page, this.pageSize, Object.assign({}, this.dataSearch))
        //     .pipe(catchError(this.catchError), finalize(() => {
        //         this._progressRef.complete();
        //         this.isLoading = false;
        //     })).subscribe(
        //         (res: CommonInterface.IResponsePaging) => {
        //             this.customers = res.data || [];
        //             this.totalItems = res.totalItems;
        //         }
        //     );
        this._store.dispatch(LoadListCustomer({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    sortPartners() {
        this.customers = this._sortService.sort(this.customers, this.sort, this.order);
    }

    sortBySaleman(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMans = this._sortService.sort(this.saleMans, sortData.sortField, sortData.order);
        }
    }

    resetSearch(event) {
        this.dataSearch = {};
        this.dataSearchs = {};
        this.onSearch(event);
    }

    showSaleman(customerId: string) {
        this._catalogueRepo.getListContract(customerId, true)
            .pipe(catchError(this.catchError), finalize(() => {
            })).subscribe(
                (res: any) => {
                    this.saleMans = res || [];
                }
            );
    }

    showConfirmDelete(customer: Customer) {
        this.selectedCustomer = customer;
        this._catalogueRepo.checkDeletePartnerPermission(this.selectedCustomer.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.confirmDeletePopup.show();
                    } else {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Customer " + res.message);
                        }
                    }
                }
            );
    }

    onDelete() {
        this._catalogueRepo.checkDeletePartnerPermission(this.selectedCustomer.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res) {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Customer " + res.message);
                        }
                        this.confirmDeletePopup.hide();
                        return;
                    } else {
                        this.confirmDeletePopup.hide();
                        this._progressRef.start();
                        this._catalogueRepo.deletePartner(this.selectedCustomer.id)
                            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                            .subscribe(
                                (res: CommonInterface.IResult) => {
                                    if (res.status) {
                                        this._toastService.success(res.message);

                                        this.resetSearch({});
                                    } else {
                                        this._toastService.error(res.message);
                                    }
                                }
                            );
                    }
                },
            );
    }

    showDetail(customer: Customer) {
        this.selectedCustomer = customer;
        this._catalogueRepo.checkViewDetailPartnerPermission(this.selectedCustomer.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._router.navigate([`${RoutingConstants.COMMERCIAL.CUSTOMER}/${this.selectedCustomer.id}`]);
                    } else {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Customer " + res.message);
                        }
                    }
                },
            );
    }

    export() {
        this.formSearchExportPopup.show();
    }

    exportAgreementInfo() {
        this._progressRef.start()
        this._exportRepo.exportAgreementInfo(this.dataSearch)
            .pipe(finalize(() => this._progressRef.complete()))
            .subscribe(
                (res) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'efms_customer_agreement.xlsx')
                }
            )
    }
}
interface ISearchGroup {
    type: string;
    keyword: string;
}
