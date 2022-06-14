import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { SortService } from '@services';
import { CatalogueRepo, ExportRepo } from '@repositories';
import { Router } from '@angular/router';
import { AppList } from 'src/app/app.list';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { ChartOfAccounts } from 'src/app/shared/models/catalogue/catChartOfAccounts.model';
import { catchError, finalize, map } from 'rxjs/operators';
import { FormCreateChartOfAccountsPopupComponent } from './components/form-create-chart-of-accounts/form-create-chart-of-accounts.popup';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-chart-of-accounts',
    templateUrl: 'chart-of-accounts.component.html'
})

export class ChartOfAccountsComponent extends AppList implements OnInit {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(FormCreateChartOfAccountsPopupComponent) formPopup: FormCreateChartOfAccountsPopupComponent;
    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;

    chartOfAccounts: ChartOfAccounts[] = [];
    chart: ChartOfAccounts = new ChartOfAccounts();
    constructor(private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _exportRepo: ExportRepo) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchChart;
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Account Code', field: 'accountCode', sortable: true, width: 100 },
            { title: 'Account Name Local', field: 'accountNameLocal', sortable: true },
            { title: 'Account Name EN', field: 'accountNameEn', sortable: true },
            { title: 'Status', field: 'active', sortable: true },

        ];
        this.dataSearch = {
            type: 'All'
        };
        this.searchChart();
    }

    sortLocal(sort: string): void {
        this.chartOfAccounts = this._sortService.sort(this.chartOfAccounts, sort, this.order);
    }

    showAdd() {
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [false, false];

        this.formPopup.formChart.reset();
        this.formPopup.active.setValue(true);
        this.formPopup.show();
    }

    showDetail(chart: ChartOfAccounts) {
        this._catalogueRepo.checkAllowGetDetailChartOfAccounts(chart.id)
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.chart = chart;
                        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];

                        this.formPopup.formChart.setValue({
                            accountCode: chart.accountCode,
                            accountNameLocal: chart.accountNameLocal,
                            accountNameEn: chart.accountNameEn,
                            active: chart.active
                        });
                        this.formPopup.idChart = this.chart.id;

                        this.formPopup.show();
                    } else {
                        this.info403Popup.show();
                    }
                }
            );

    }

    searchChart() {
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.getListChartOfAccounts(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((res: any) => {
                    return {
                        data: res.data != null ? res.data.map((item: any) => new ChartOfAccounts(item)) : [],
                        totalItems: res.totalItems,
                    };
                }),
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems;
                    this.chartOfAccounts = res.data || [];
                },
            );
    }

    onSearchCharge(dataSearch: any) {
        this.dataSearch = {};
        if (dataSearch.type === 'All') {
            this.dataSearch.all = dataSearch.keyword;
        } else {
            this.dataSearch.all = null;
            if (dataSearch.type === 'accountCode') {
                this.dataSearch.accountCode = dataSearch.keyword;
            }
            if (dataSearch.type === 'accountNameLocal') {
                this.dataSearch.accountNameLocal = dataSearch.keyword;
            }
            if (dataSearch.type === 'accountNameEn') {
                this.dataSearch.accountNameEn = dataSearch.keyword;
            }
            if (dataSearch.type === 'active') {
                this.dataSearch.active = dataSearch.keyword;
            }
        }
        this.searchChart();
    }

    showConfirmDelete(item: ChartOfAccounts) {
        this._catalogueRepo.checkAllowDeleteChartOfAccounts(item.id)
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.chart = item;
                        this.confirmDeletePopup.show();
                    } else {
                        this.info403Popup.show();
                    }
                }
            );
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();
        this._catalogueRepo.deleteChartOfAccounts(this.chart.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (response: CommonInterface.IResult) => {
                    if (response.status) {
                        this._toastService.success(response.message);
                        this.dataSearch = {};
                        this.searchChart();
                    } else {
                        this._toastService.error(response.message);
                    }
                }
            );
    }

    resetSearch(event: any) {
        this.dataSearch = {};
        this.searchChart();
    }

    export() {
        this._exportRepo.exportChartOfAccounts(this.dataSearch)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }

}