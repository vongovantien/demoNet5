import { Component, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { AppList } from 'src/app/app.list';
import { Company } from 'src/app/shared/models';
import { SystemRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { SortService } from 'src/app/shared/services';

import { finalize, catchError } from 'rxjs/operators';

import { LoadCompanyAction, ICompanyState, getCompanyState } from './store';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-company-info',
    templateUrl: './company-information.component.html',
    styleUrls: ['./company-information.component.scss']
})
export class ComanyInformationComponent extends AppList {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    headers: CommonInterface.IHeaderTable[];

    companies: Company[] = [];
    selectedCompany: Company;

    constructor(
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _router: Router,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _exportRepo: ExportRepo,
        private _store: Store<ICompanyState>

    ) {
        super();
        this._progressRef = this._progressService.ref();

        this.requestList = this.requestSearchComapny;
        this.requestSort = this.sortCompany;

    }

    ngOnInit() {
        this.headers = [
            { title: 'Company Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'bunameEn', sortable: true },
            { title: 'Name Local', field: 'bunameVn', sortable: true },
            { title: 'Name Abbr', field: 'bunameAbbr', sortable: true },
            { title: 'Logo', field: 'logoPath', sortable: true },
            { title: 'Website', field: 'website', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.dataSearch = { All: null };

        this.requestSearchComapny();
        this.getCompany(this.dataSearch);
    }

    onSearchCompany(dataSearch: any) {
        this.dataSearch = dataSearch;
        this.requestSearchComapny();
    }

    requestSearchComapny() {
        this._store.dispatch(new LoadCompanyAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    getCompany(dataSearch?: any) {
        // this.isLoading = true;
        // this._progressRef.start();
        this._store.select<any>(getCompanyState)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this._progressRef.complete();
                })
            )
            .subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.companies = res.data;

                },

            );
    }

    sortCompany() {
        this.companies = this._sortService.sort(this.companies, this.sort, this.order);
    }

    showDeletePopup(company: Company) {
        this.selectedCompany = new Company(company);
        this.confirmDeletePopup.show();
    }

    gotoDetail(company: Company) {
        this._router.navigate([`${company.id}`]);
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();
        this._systemRepo.deleteCompany(this.selectedCompany.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.requestSearchComapny();
                    } else {
                        this._toastService.warning(res.message);
                    }
                }
            );
    }

    exportExcel() {
        this._exportRepo.exportCompany(this.dataSearch)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL,response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }

}

