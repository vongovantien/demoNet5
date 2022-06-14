import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { NgProgress } from '@ngx-progressbar/core';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { SortService } from '@services';
import { Partner, Company, Office } from '@models';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { IPartnerDataState, getPartnerDataSearchParamsState, getPartnerDataListState, LoadListPartner, getPartnerDataListPagingState } from '../../store';
import { Store } from '@ngrx/store';


@Component({
    selector: 'app-partner-list',
    templateUrl: './partner-list.component.html'
})
export class PartnerListComponent extends AppList implements OnInit {
    // @Input() type = 0;
    @Input() criteria: any = {};
    @Output() deleteConfirm = new EventEmitter<Partner>();
    @Output() detail = new EventEmitter<Partner>();
    partners: any[] = [];
    headerSalemans: CommonInterface.IHeaderTable[];
    isCustomer = false;
    saleMans: any[] = [];
    services: any[] = [];
    offices: any[] = [];
    company: Company[] = [];

    isSearch: boolean = false;
    dataSearchs: any = [];

    constructor(private _ngProgressService: NgProgress,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _store: Store<IPartnerDataState>,
        private _systemRepo: SystemRepo) {
        super();

        this._progressRef = this._ngProgressService.ref();
        this.requestSearch = this.searchPartner;
        this.requestList = this.getPartners;
        this.requestSort = this.sortPartners;
    }

    ngOnInit() {
        //this.getService();
        //this.getOffice();
        //this.getCompany();
        this._store.select(getPartnerDataSearchParamsState)
            .pipe(
                withLatestFrom(this._store.select(getPartnerDataListPagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data: any) => {
                    if (!!data.dataSearch) {
                        this.dataSearchs = data.dataSearch;
                        console.log(this.dataSearchs);
                        if (Object.keys(this.dataSearchs).length > 0) {
                            this.dataSearchs.type = this.dataSearchs.type === "userCreatedName" ? "userCreated" : this.dataSearchs.type;
                            this.criteria[this.dataSearchs.type] = this.dataSearchs.keyword;
                        }
                        this.page = data.page;
                        this.pageSize = data.pageSize;
                    }

                }
            );
        this._store.select(getPartnerDataListState)
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
                    this.partners = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
        this.headerSalemans = [
            { title: 'No', field: '', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
            { title: 'Office', field: 'office', sortable: true },
            { title: 'Company', field: 'company', sortable: true },
            { title: 'Salesman', field: 'username', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'CreateDate', field: 'createDate', sortable: true }
        ];
        this.headers = [
            { title: 'Partner ID', field: 'accountNo', sortable: true },
            { title: 'Name ABBR', field: 'shortName', sortable: true },
            { title: 'Tax Code', field: 'taxCode', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
            { title: 'Billing Address', field: 'addressVn', sortable: true },
            { title: 'Tel Address', field: 'tel', sortable: true },
            { title: 'Fax', field: 'fax', sortable: true },
            { title: 'Modify', field: 'datetimeModified', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
            { title: 'Office', field: 'officeName', sortable: true },
        ];
        localStorage.removeItem('success_add_sub');
        this.dataSearch = this.criteria;
        if (this.criteria.partnerGroup === PartnerGroupEnum.CUSTOMER) {
            this.isCustomer = true;
        } else {
            this.isCustomer = false;
        }

        this.getPartners();
    }

    replaceService() {
        for (const item of this.saleMans) {
            this.services.forEach(itemservice => {
                if (item.service === itemservice.id) {
                    item.service = itemservice.text;
                }
            });
        }
    }

    replaceOffice() {
        for (const it of this.saleMans) {
            this.offices.forEach(item => {
                if (it.office === item.id) {
                    it.office = item.branchNameEn;
                }
                if (it.company === item.buid) {
                    const objCompany = this.company.find(x => x.id === item.buid);
                    it.company = objCompany.bunameAbbr;
                }
            });
        }

    }


    getOffice() {
        this._systemRepo.getListOffices()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.offices = res;
                    }
                },
            );
    }

    getCompany() {
        this._systemRepo.getListCompany()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.company = res;
                    }
                },
            );
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                    }
                },
            );
    }

    showSaleman(partnerId: string) {
        this._catalogueRepo.getListContract(partnerId)
            .pipe(catchError(this.catchError), finalize(() => {
            })).subscribe(
                (res: any) => {
                    this.saleMans = res || [];
                    this.replaceService();
                    this.replaceOffice();
                }
            );
    }

    sortBySaleman(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMans = this._sortService.sort(this.saleMans, sortData.sortField, sortData.order);
        }
    }

    searchPartner(event: CommonInterface.ISearchOption) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
    }

    getPartners() {
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.getListPartner(this.page, this.pageSize, this.dataSearch)
            .pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            })).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.partners = res.data || [];
                    console.log(this.partners);
                    this.totalItems = res.totalItems;
                }
            );
    }

    sortPartners() {
        this.partners = this._sortService.sort(this.partners, this.sort, this.order);
    }

    showDetail(item) {
        this.detail.emit(item);
    }

    showConfirmDelete(item) {
        this.deleteConfirm.emit(item);
    }
}
