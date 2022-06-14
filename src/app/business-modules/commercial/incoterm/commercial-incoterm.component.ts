import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList, IPermissionBase } from 'src/app/app.list';
import { IncotermModel } from '@models';
import { CatalogueRepo } from '@repositories';
import { catchError, finalize, map, tap, switchMap } from 'rxjs/operators';
import { CommercialFormSearchIncotermComponent } from './components/form-search-incoterm/form-search-incoterm.component';
import { SortService } from '@services';
import { RoutingConstants, SystemConstants } from '@constants';
import { Permission403PopupComponent, ConfirmPopupComponent } from '@common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-commercial-incoterm',
    templateUrl: './commercial-incoterm.component.html',
})
export class CommercialIncotermComponent extends AppList implements OnInit, IPermissionBase {

    @ViewChild("formSearch") formSearch: CommercialFormSearchIncotermComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    incoterms: IncotermModel[];
    selectedIncotermId: string;

    constructor(
        private _ngProgressService: NgProgress,
        private _router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestList = this.getIncotermListPaging;
        this.requestSort = this.sortIncotermList;
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit(): void {
        this.headers = [
            { title: 'Incoterm', field: 'code', sortable: true },
            { title: 'Name En', field: 'nameEn', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
            { title: 'Create Date', field: 'datetimeCreated', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },

        ];
        this.getIncotermListPaging();
    }

    getIncotermListPaging() {
        this.isLoading = true;
        this._catalogueRepo.getIncotermListPaging(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
                map((res: any) => {
                    return {
                        data: res.data,
                        totalItems: res.totalItems,
                    };
                })
            ).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.totalItems = res.totalItems || 0;
                    this.incoterms = (res.data || []).map(i => new IncotermModel(i)) || [];

                },
            );
    }

    onSearchIncoterm(event) {
        this.dataSearch = event;
        this.page = 1;
        this.getIncotermListPaging();
    }

    onResetIncoterm(event) {
        this.dataSearch = event;
        this.formSearch.initForm();
        this.getIncotermListPaging();
    }

    sortIncotermList(sortField: string, order: boolean) {
        this.incoterms = this._sortService.sort(this.incoterms, sortField, order);
    }

    exportExcel() {
        this._catalogueRepo.downloadIncotermListExcel(this.dataSearch)
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                }
            );
    }

    checkAllowDetail(incotermId: string): void {
        this._catalogueRepo.checkAllowGetDetailIncoterm(incotermId)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.COMMERCIAL.INCOTERM}/${incotermId}`]);
                    } else {
                        this.permissionPopup.show();
                    }
                }
            );
    }

    checkAllowDelete(incotermId: string): void {
        this.selectedIncotermId = incotermId;
        this._catalogueRepo.checkAllowDeleteIncoterm(this.selectedIncotermId)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.confirmDeletePopup.show();
                    } else {
                        this.permissionPopup.show();
                    }
                }
            );
    }

    onDelete() {
        this._progressRef.start();
        this._catalogueRepo.deleteIncoterm(this.selectedIncotermId)
            .pipe(catchError(this.catchError),
                finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.confirmDeletePopup.hide();
                        this._toastService.success(res.message);
                        this.onResetIncoterm({});

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}

