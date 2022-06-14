import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';

import { Permission403PopupComponent, ConfirmPopupComponent, SearchOptionsComponent } from '@common';
import { Partner, Contract } from '@models';
import { CatalogueRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { CommonEnum } from '@enums';
import { RoutingConstants, SystemConstants } from '@constants';

import { AppList } from 'src/app/app.list';

import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IAgentState, getAgentSearchParamsState, SearchList, getAgentDataListState, LoadListAgent, getAgentPagingState } from './store';
import { FormContractCommercialPopupComponent } from '../../share-modules/components';
import { Observable } from 'rxjs';
import { getMenuUserSpecialPermissionState } from '@store';
import { FormSearchExportComponent } from '../components/popup/form-search-export/form-search-export.popup';
import { HttpResponse } from '@angular/common/http';


@Component({
    selector: 'app-commercial-agent',
    templateUrl: './commercial-agent.component.html',
})
export class CommercialAgentComponent extends AppList implements OnInit {

    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(SearchOptionsComponent, { static: true }) searchOptionsComponent: SearchOptionsComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(FormSearchExportComponent) formSearchExportPopup: FormSearchExportComponent;

    menuSpecialPermission: Observable<any[]>;

    agents: Partner[] = [];
    saleMans: Contract[] = [];

    dataSearchs: any = [];

    selectedAgent: Partner;

    headerSalemans: CommonInterface.IHeaderTable[];
    headerSearch: CommonInterface.IHeaderTable[];

    constructor(private _ngProgressService: NgProgress,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAgentState>,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _router: Router,
        private _cd: ChangeDetectorRef,
        private _exportRepo: ExportRepo) {
        super();

        this._progressRef = this._ngProgressService.ref();
        this.requestSearch = this.onSearch;
        this.requestList = this.getPartners;
        this.requestSort = this.sortPartners;
    }


    ngOnInit(): void {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this._store.select(getAgentSearchParamsState)
            .pipe(
                withLatestFrom(this._store.select(getAgentPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data: any) => {
                    if (!!data.dataSearch) {
                        this.dataSearchs = data.dataSearch;
                    }
                    this.page = data.page;
                    this.pageSize = data.pageSize;
                }
            );
        this._store.select(getAgentDataListState)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((data: any) => {
                    return {
                        data: !!data.data ? data.data.map((item: any) => new Partner(item)) : [],
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.agents = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
        this.headerSalemans = [
            { title: 'No', field: '', sortable: true },
            { title: 'Salesman', field: 'username', sortable: true },
            { title: 'Agreement Type', field: 'contractType', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
            { title: 'Office', field: 'office', sortable: true },
            { title: 'Company', field: 'company', sortable: true },

            { title: 'Status', field: 'status', sortable: true },
            { title: 'CreateDate', field: 'createDate', sortable: true }
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
            { title: 'Agreement Type', field: 'contractType', sortable: true }
        ];

        this.configSearch = {
            settingFields: this.headerSearch.map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab
        };
        localStorage.removeItem('success_add_sub');
        this.dataSearch = { All: '' };
        this.dataSearch.partnerType = 'Agent';
        // this.getPartners();
        this.onSearch(this.dataSearch);
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

        this.formContractPopup.contractType.setValue('Trial');
        this.formContractPopup.currencyId.setValue('VND');
        this.formContractPopup.creditCurrency.setValue('VND');
        this.formContractPopup.baseOn.setValue('Invoice Date');
        this.formContractPopup.autoExtendDays.setValue(0);

        this.formContractPopup.trialEffectDate.setValue(null);
        this.formContractPopup.trialExpiredDate.setValue(null);
        this.formContractPopup.effectiveDate.setValue(null);
        this.formContractPopup.isCustomerRequest = true;
        this.formContractPopup.show();
        this.formContractPopup.show();
    }

    onRequestContract($event: boolean) {
        const success = $event;
        if (success === true) {
            this.requestList();
        }
    }

    onSearch(event: CommonInterface.ISearchOption) {
        this.dataSearch = {};
        this.dataSearch[event.field || "All"] = event.searchString || '';
        this.dataSearch.partnerType = 'Agent';
        if (!!event.field && event.searchString === "") {
            this.dataSearchs.keyword = "";
        }
        const searchData: ISearchGroup = {
            type: !!event.field ? event.field : this.dataSearchs.type,
            keyword: !!event.searchString ? event.searchString : this.dataSearchs.keyword
        };
        this.page = 1;
        this._store.dispatch(SearchList({ payload: searchData }));
        if (Object.keys(this.dataSearchs).length > 0) {
            const type = this.dataSearchs.type === "userCreatedName" ? "userCreated" : this.dataSearchs.type;
            this.dataSearch[type] = this.dataSearchs.keyword;
        }
        this.requestList();
        //this._store.dispatch(LoadListAgent({page: this.page, size: this.pageSize, dataSearch: Object.assign({}, this.dataSearch)}));
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
        //             this.agents = res.data || [];
        //             this.totalItems = res.totalItems;
        //         }
        //     );
        this._store.dispatch(LoadListAgent({ page: this.page, size: this.pageSize, dataSearch: Object.assign({}, this.dataSearch) }));
    }

    sortPartners() {
        this.agents = this._sortService.sort(this.agents, this.sort, this.order);
    }

    sortBySaleman(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMans = this._sortService.sort(this.saleMans, sortData.sortField, sortData.order);
        }
    }

    ngAfterViewInit() {
        if (Object.keys(this.dataSearchs).length > 0) {
            this.searchOptionsComponent.searchObject.searchString = this.dataSearchs.keyword;
            this.searchOptionsComponent.searchObject.field = this.dataSearchs.type;
            this.searchOptionsComponent.searchObject.displayName = this.headerSearch.find(x => x.field === this.dataSearchs.type)?.title;
        }
        this._cd.detectChanges();
    }

    resetSearch(event) {
        this.dataSearch = {};
        this.dataSearchs = {};
        this.onSearch(event);
    }

    showSaleman(customerId: string) {
        this._catalogueRepo.getListContract(customerId)
            .pipe(catchError(this.catchError), finalize(() => {
            })).subscribe(
                (res: any) => {
                    this.saleMans = res || [];
                }
            );
    }

    showConfirmDelete(customer: Partner) {
        this.selectedAgent = customer;
        this._catalogueRepo.checkDeletePartnerPermission(this.selectedAgent.id)
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
                            this._toastService.warning("This Agent " + res.message);
                        }
                    }
                }
            );
    }

    onDelete() {
        this._catalogueRepo.checkDeletePartnerPermission(this.selectedAgent.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res) {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Agent " + res.message);
                        }
                        this.confirmDeletePopup.hide();
                        return;
                    } else {
                        this.confirmDeletePopup.hide();
                        this._progressRef.start();
                        this._catalogueRepo.deletePartner(this.selectedAgent.id)
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

    export() {
        this.formSearchExportPopup.show();
    }


    showDetail(agent: Partner) {
        this.selectedAgent = agent;
        this._catalogueRepo.checkViewDetailPartnerPermission(this.selectedAgent.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._router.navigate([`${RoutingConstants.COMMERCIAL.AGENT}/${this.selectedAgent.id}`]);
                    } else {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Agent " + res.message);
                        }
                    }
                },
            );
    }

    exportAgreementInfo() {
        this._progressRef.start()
        this._exportRepo.exportAgreementInfo(this.dataSearch)
            .pipe(finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME))
                }
            )
    }

}
interface ISearchGroup {
    type: string;
    keyword: string;
}

