import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppList } from '@app';
import {  RoutingConstants, SystemConstants } from '@constants';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, ExportRepo } from '@repositories';
import { SortService } from '@services';
import { getMenuUserSpecialPermissionState, IAppState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { CombineBilling } from 'src/app/shared/models/accouting/combine-billing.model';
import { LoadListCombineBilling } from './store/actions';
import { getCombineBillingListState, getCombineBillingLoadingListState, getCombineBillingPagingState, getDataSearchCombineBillingState } from './store/reducers';
import {
  ConfirmPopupComponent, Permission403PopupComponent
} from '@common';
import { InjectViewContainerRefDirective } from '@directives';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'combine-billing',
  templateUrl: './combine-billing.component.html',
})
export class CombineBillingComponent extends AppList implements OnInit {
  @ViewChild(InjectViewContainerRefDirective) confirmPopupContainerRef: InjectViewContainerRefDirective;
  @ViewChild(ConfirmPopupComponent) confirmPopup: ConfirmPopupComponent;
  @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;

  billings: CombineBilling[] = [];
  // Get data with 6 month from current
  dataSearch : any = {
    createdDateFrom: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()), 'yyyy-MM-dd', 'en'),
    createdDateTo: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
  };
  criteriaExport: any = {};
  isExport: boolean = false;
  
  constructor(
    private _progressService: NgProgress,
    private _sortService: SortService,
    protected _accountingRepo: AccountingRepo,
    private _toastService: ToastrService,
    private _router: Router,
    private _store: Store<IAppState>,
    private _exportRepo: ExportRepo
  ) {
    super();
    this._progressRef = this._progressService.ref();
    this.requestList = this.requestSearchBilling;
    this.requestSort = this.sortBilling;
  }

  ngOnInit() {
    this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
    this.headers = [
      { title: 'Combine No', field: 'combineBillingNo', sortable: true },
      { title: 'Partner Name', field: 'partnerName', sortable: true },
      { title: 'Total Amount VND', field: 'totalAmountVnd', sortable: true },
      { title: 'Total Amount USD', field: 'totalAmountUsd', sortable: true },
      { title: 'Creator', field: 'userCreatedName', sortable: true },
      { title: 'Create Date', field: 'datetimeCreated', sortable: true }
    ];

    this.isLoading = this._store.select(getCombineBillingLoadingListState);

    this.getListCombineBilling();
    
    this._store.select(getDataSearchCombineBillingState)
      .pipe(
        withLatestFrom(this._store.select(getCombineBillingPagingState)),
        takeUntil(this.ngUnsubscribe),
        map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
      )
      .subscribe(
        (data: any) => {
          if (!!data.dataSearch) {
            this.dataSearch = data.dataSearch;
          }
          this.page = data.page;
          this.pageSize = data.pageSize;
          this.requestSearchBilling();
        }
      );

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
    }
  }

  getListCombineBilling() {
    this._store.select(getCombineBillingListState)
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
                    this.billings = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
  }

  prepareDeleteCombine(data: any) {
    this._accountingRepo.checkExistingCombine(data)
        .subscribe((value: boolean) => {
            if (value) {
                this.showPopupDynamicRender<ConfirmPopupComponent>(
                    ConfirmPopupComponent,
                    this.confirmPopupContainerRef.viewContainerRef, {
                    body: 'Do you want to delete ?',
                    labelConfirm: 'Yes',
                    labelCancel: 'No'
                }, () => {
                    this.deleteCombineBilling(data);
                })
            } else {
                this.confirmPopup.show();
            }
        });
}

deleteCombineBilling(id: string) {
    this._accountingRepo.deleteCombineBilling(id)
        .pipe(
            catchError(this.catchError),
        ).subscribe(
            (res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(res.message, '');
                    this.requestSearchBilling();
                } else {
                    this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                }
            },
        );
}

  sortBilling() {
    if (!!this.billings.length) {
      this.billings = this._sortService.sort(this.billings, this.sort, this.order);
    }
  }

  requestSearchBilling() {
    this._store.dispatch(LoadListCombineBilling({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
  }

  viewDetail(data: any): void {
    console.log('datas', data)
    this._accountingRepo
            .checkAllowViewDetailCombine(data.id)
            .subscribe((value: boolean) => {
                if (value) {
                  this._router.navigate([`${RoutingConstants.ACCOUNTING.COMBINE_BILLING}/detail/${data.id}`]);
                } else {
                    this.permissionPopup.show();
                }
            });
    
  }

  exportCombineOPS(currency: string) {
    this.isExport = true;
    this.criteriaExport = this.dataSearch;
    if (this.criteriaExport.partnerId) {
      let combineNos = [];
      this.billings.forEach(combine => {
        combineNos.push(combine.combineBillingNo)
      });
      if (combineNos.length) {
        this._progressRef.start();
        this.criteriaExport.referenceNo = combineNos;
        this.criteriaExport.currency = currency;
        this._exportRepo.exportCombineOps(this.criteriaExport)
          .pipe(
            catchError(this.catchError),
            finalize(() => this._progressRef.complete())
          )
          .subscribe(
            (response: HttpResponse<any>) => {
              if (response!=null) {
                this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
              } else {
                this._toastService.warning('No data found');
              }
            },
          );
        this.isExport = false;
      }else{
        this._toastService.warning("No data apply. Please re-check again.")
      }
    }else{
      this._toastService.warning("Please apply search with partner.")
    }
  }

}
