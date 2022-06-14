import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';

import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { Router } from '@angular/router';
import { SystemConstants } from 'src/constants/system.const';
import { ButtonType } from 'src/app/shared/enums/type-button.enum';
import { ButtonModalSetting } from 'src/app/shared/models/layout/button-modal-setting.model';
import { PartnerListComponent } from './components/partner-list/partner-list.component';
import { NgProgress } from '@ngx-progressbar/core';
import { AppList } from 'src/app/app.list';
import { ExportRepo, CatalogueRepo } from '@repositories';
import { ConfirmPopupComponent, Permission403PopupComponent, SearchOptionsComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { RoutingConstants } from '@constants';
import { CommonEnum } from '@enums';

import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { SearchList, IPartnerDataState, getPartnerDataSearchParamsState } from './store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getMenuUserSpecialPermissionState } from '@store';
import { FormContractCommercialPopupComponent } from '../../share-modules/components';
import { FormSearchExportComponent } from '../../commercial/components/popup/form-search-export/form-search-export.popup';
import { HttpResponse } from '@angular/common/http';
type PARTNERDATA_TAB = 'allTab' | 'Customer' | 'Agent' | 'Carrier' | 'Consginee' | 'Shipper';


enum PartnerDataTab {
    ALL = 'allTab',
    CUSTOMER = 'Customer',
    AGENT = 'Agent',
    CARRIER = 'Carrier',
    CONSIGNEE = 'Consignee',
    SHIPPER = 'Shipper'
}



@Component({
    selector: 'app-partner',
    templateUrl: './partner.component.html'
})
export class PartnerComponent extends AppList implements OnInit {
    @ViewChild(PartnerListComponent) allPartnerComponent: PartnerListComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: any;
    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(SearchOptionsComponent, { static: true }) searchOptionsComponent: SearchOptionsComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(FormSearchExportComponent) formSearchExportPopup: FormSearchExportComponent;

    menuSpecialPermission: Observable<any[]>;
    pager: PagerSetting = PAGINGSETTING;
    headerSearch: CommonInterface.IHeaderTable[];

    configSearch: any = {};

    criteria: any = { partnerGroup: PartnerGroupEnum.CUSTOMER };
    partner: Partner;
    tabName = {
        customerTab: "customerTab",
        agentTab: "agentTab",
        carrierTab: "carrierTab",
        consigneeTab: "consigneeTab",
        shipperTab: "shipperTab",
        allTab: "allTab"
    };
    addButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.add
    };
    importButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.import
    };
    exportButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.export
    };
    activeTab: string = this.tabName.allTab;

    selectedTab: PARTNERDATA_TAB = PartnerDataTab.ALL; // Default tab.

    allowDelete: boolean = false;

    dataSearchs: any = [];



    constructor(private router: Router,
        private _ngProgressService: NgProgress,
        private _exportRepo: ExportRepo,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IPartnerDataState>,
        private _toastService: ToastrService,
        private _cd: ChangeDetectorRef) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this._store.select(getPartnerDataSearchParamsState)
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
        this.headerSearch = [
            { title: 'Partner ID', field: 'accountNo', sortable: true },
            { title: 'Name ABBR', field: 'shortName', sortable: true },
            { title: 'Salesman', field: 'saleman', sortable: true },
            { title: 'Tax Code', field: 'taxCode', sortable: true },
            { title: 'Tel', field: 'tel', sortable: true },
            { title: 'Fax', field: 'fax', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
        ];

        this.configSearch = {
            settingFields: this.headerSearch.map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab
        };
        this.tabSelect(this.activeTab);
    }

    resetSearch(event) {
        this.onSearch(event);
    }

    onSearch(event) {
        const currentTab = this.criteria.partnerGroup;
        this.criteria = {};
        this.criteria.partnerGroup = currentTab;
        if (event.field === "All") {
            this.criteria.all = event.searchString;
        } else {
            if (event.field === "accountNo") {
                this.criteria.accountNo = event.searchString;
            }
            if (event.field === "shortName") {
                this.criteria.shortName = event.searchString;
            }
            if (event.field === "addressVn") {
                this.criteria.addressVn = event.searchString;
            }
            if (event.field === "taxCode") {
                this.criteria.taxCode = event.searchString;
            }
            if (event.field === "tel") {
                this.criteria.tel = event.searchString;
            }
            if (event.field === "fax") {
                this.criteria.fax = event.searchString;
            }
            if (event.field === "userCreatedName") {
                this.criteria.userCreated = event.searchString;
            }
            if (event.field === "saleman") {
                this.criteria.saleman = event.searchString;
            }
        }

        this.allPartnerComponent.dataSearch = this.criteria;
        this.allPartnerComponent.page = 1;
        if (!!event.field && event.searchString === "") {
            this.dataSearchs.keyword = "";
        }
        const searchData: ISearchGroup = {
            type: !!event.field ? event.field : this.dataSearchs.type,
            keyword: !!event.searchString ? event.searchString : this.dataSearchs.keyword,
            partnerGroup: this.criteria.partnerGroup
        };
        this.page = 1;
        this._store.dispatch(SearchList({ payload: searchData }));

        this.allPartnerComponent.requestList();
    }
    tabSelect(tabName) {
        this.pager.currentPage = 1;
        this.pager.pageSize = SystemConstants.OPTIONS_PAGE_SIZE;
        this.activeTab = tabName;

        if (tabName === this.tabName.customerTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CUSTOMER;
        }
        if (tabName === this.tabName.agentTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.AGENT;
        }
        if (tabName === this.tabName.carrierTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CARRIER;
        }
        if (tabName === this.tabName.consigneeTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CONSIGNEE;
        }
        if (tabName === this.tabName.shipperTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.SHIPPER;
        }
        if (tabName === this.tabName.allTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.ALL;
        }
    }

    ngAfterViewInit() {
        if (Object.keys(this.dataSearchs).length > 0) {
            this.searchOptionsComponent.searchObject.searchString = this.dataSearchs.keyword;
            const type = this.dataSearchs.type === "userCreated" ? "userCreatedName" : this.dataSearchs.type;
            this.searchOptionsComponent.searchObject.field = this.dataSearchs.type === "userCreated" ? "userCreatedName" : this.dataSearchs.type;
            this.searchOptionsComponent.searchObject.displayName = this.dataSearchs.type !== "All" ? this.headerSearch.find(x => x.field === type).title : this.dataSearchs.type;
            this.allPartnerComponent.dataSearch[this.dataSearchs.type] = this.dataSearchs.keyword;
        }
        // this.onSearch(this.dataSearch);
        this._cd.detectChanges();
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
            this.allPartnerComponent.requestList();
        }
    }

    showConfirmDelete(event) {
        this.partner = event;
        this._catalogueRepo.checkDeletePartnerPermission(this.partner.id)
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
                            this._toastService.warning("This Partner " + res.message);
                        }
                    }
                }
            );
    }

    showDetail(event) {
        this.partner = event;
        this._catalogueRepo.checkViewDetailPartnerPermission(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/detail/${this.partner.id}`]);
                    } else {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Partner " + res.message);
                        }
                    }
                },
            );
    }

    onDelete() {
        this._catalogueRepo.checkDeletePartnerPermission(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res) {
                        if (res.data === 403) {
                            this.info403Popup.show();
                        } else {
                            this._toastService.warning("This Partner " + res.message);
                        }
                        this.confirmDeletePopup.hide();
                        return;
                    } else {
                        this.confirmDeletePopup.hide();
                        this._progressRef.start();
                        this._catalogueRepo.deletePartner(this.partner.id)
                            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                            .subscribe(
                                (res: CommonInterface.IResult) => {
                                    if (res.status) {
                                        this._toastService.success(res.message);

                                        this.allPartnerComponent.dataSearch = this.criteria;
                                        this.allPartnerComponent.getPartners();
                                        this.confirmDeletePopup.hide();
                                    } else {
                                        this._toastService.error(res.message);
                                    }
                                }
                            );

                    }
                },
            );
    }

    addPartner() {
        const type = this.activeTab === this.tabName.allTab ? -1 : this.criteria.partnerGroup;
        this.router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/add`], { queryParams: { partnerType: type } });
    }

    exportPartnerData() {
        this.formSearchExportPopup.show();
    }

    exportAgreementInfo() {
        this._progressRef.start()
        this._exportRepo.exportAgreementInfo(this.criteria)
            .pipe(finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                }
            )
    }
}

interface ISearchGroup {
    type: string;
    keyword: string;
    partnerGroup: string;
}
