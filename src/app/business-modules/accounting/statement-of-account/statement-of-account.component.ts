import { Component, ViewChild } from "@angular/core";
import {
    ConfirmPopupComponent,
    InfoPopupComponent,
    Permission403PopupComponent
} from "src/app/shared/common/popup";
import { AccountingRepo } from "src/app/shared/repositories";
import { catchError, finalize, map, takeUntil, withLatestFrom } from "rxjs/operators";
import { AppList } from "src/app/app.list";
import { SOA } from "src/app/shared/models";
import { ToastrService } from "ngx-toastr";
import { SortService } from "src/app/shared/services";
import { NgProgress } from "@ngx-progressbar/core";
import { Router } from "@angular/router";
import { RoutingConstants } from "@constants";
import { Store } from "@ngrx/store";
import { IAppState, getMenuUserSpecialPermissionState } from "@store";
import { getDataSearchSOAState, getSOAListState, getSOAPagingState } from "./store/reducers";
import { LoadListSOA } from "./store/actions";

@Component({
    selector: "app-statement-of-account",
    templateUrl: "./statement-of-account.component.html"
})
export class StatementOfAccountComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

    headers: CommonInterface.IHeaderTable[];

    SOAs: SOA[] = [];
    selectedSOA: SOA = null;
    messageDelete: string = "";

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _router: Router,
        private _store: Store<IAppState>,
    ) {
        super();

        this.requestSort = this.sortLocal;
        this.requestList = this.requestSearchSOA;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.headers = [
            { title: "SOA No", field: "soano", sortable: true, width: 90 },
            { title: "Partner", field: "partnerName", sortable: true },
            { title: "Shipment", field: "shipment", sortable: true },
            { title: "Credit Amount", field: "creditAmount", sortable: true },
            { title: "Debit Amount", field: "debitAmount", sortable: true },
            { title: "Total Amount", field: "totalAmount", sortable: true },
            { title: "Status", field: "status", sortable: true },
            { title: "Issue Date", field: "datetimeCreated", sortable: true },
            { title: "Issue Person", field: "userCreated", sortable: true },
            { title: "Modified Date", field: "datetimeModified", sortable: true },
            { title: 'Sync Status', field: 'syncStatus', sortable: true },
            { title: 'Last Sync', field: 'lastSyncDate', sortable: true },
        ];
        this.dataSearch = {
            CurrencyLocal: "VND"
        };
        this._store.select(getDataSearchSOAState)
          .pipe(
            withLatestFrom(this._store.select(getSOAPagingState)),
            takeUntil(this.ngUnsubscribe),
            map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
          )
          .subscribe(
            (data: any) => {
              if (!!data.dataSearch) {
                this.dataSearch = data.dataSearch;
              }
              if (!!data.dataSearch.dataSearch) {
                this.dataSearch = data.dataSearch.dataSearch;
              }
              this.page = data.page;
              this.pageSize = data.pageSize;
              this.requestSearchSOA();
            }
          );
        this.getSOAs();
    }

    prepareDeleteSOA(soaItem: SOA) {
        this._accoutingRepo
            .checkAllowDeleteSOA(soaItem.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.selectedSOA = new SOA(soaItem);
                    this.messageDelete = `Do you want to delete SOA ${soaItem.soano} ? `;
                    this.confirmPopup.show();
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    onConfirmDeleteSOA() {
        this._progressRef.start();
        this._accoutingRepo
            .deleteSOA(this.selectedSOA.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.confirmPopup.hide();
                    this._progressRef.complete();
                })
            )
            .subscribe((res: any) => {
                this._toastService.success(res.message, "", {
                    positionClass: "toast-bottom-right"
                });

                // * search SOA when success.
                this.onSearchSoa(this.dataSearch);
            });
    }

    onSearchSoa(data: any) {
        this.page = 1;
        this.dataSearch = data;
        this.requestSearchSOA();
        this.getSOAs();
    }

    getSOAs() {
        //this.pageSize=30;
        this.isLoading = true;
        this._progressRef.start();
        // this._accoutingRepo
        //     .getListSOA(
        //         this.page,
        //         this.pageSize,
        //         Object.assign({}, this.dataSearch)
        //     )
        //     .pipe(
        //         catchError(this.catchError),
        //         finalize(() => {
        //             this.isLoading = false;
        //             this._progressRef.complete();
        //         })
        //     )
        //     .subscribe((res: any) => {
        //         this.SOAs = (res.data || []).map((item: SOA) => new SOA(item));
        //         this.totalItems = res.totalItems || 0;
        //     });
        this._store.select(getSOAListState)
        .pipe(
            catchError(this.catchError),
            map((data: any) => {
                return {
                    data: !!data ? data.data : [],
                    totalItems: data.totalItems,
                };
            }),
            takeUntil(this.ngUnsubscribe),
        )
        .subscribe(
            (res: any) => {
                this.SOAs = res.data || [];
                this.totalItems = res.totalItems || 0;
                this.isLoading = false;
                this._progressRef.complete();
            },
        );
    }

    requestSearchSOA(){
        this._store.dispatch(LoadListSOA({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    sortLocal(sort: string): void {
        this.SOAs = this._sortService.sort(this.SOAs, sort, this.order);
    }

    viewDetail(soaId: string, soano: string, currency: string) {
        this._accoutingRepo
            .checkAllowGetDetailSOA(soaId)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}/detail/`], {
                        queryParams: { no: soano, currency: currency }
                    });
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'confirm-billing': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}/confirm-billing`]);
                break;
            }
            case 'soa': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}`]);
                break;
            }
            case 'combine-billing': {
                this._router.navigate([`${RoutingConstants.ACCOUNTING.COMBINE_BILLING}`]);
                break;
            }
        }
    }
}
