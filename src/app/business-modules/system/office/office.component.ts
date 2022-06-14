import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { ButtonModalSetting } from '../../../shared/models/layout/button-modal-setting.model';
import { ButtonType } from '../../../shared/enums/type-button.enum';
import { SystemRepo } from 'src/app/shared/repositories';
import { Office } from 'src/app/shared/models/system/office';
import { map, finalize, catchError } from 'rxjs/operators';
import { NgProgress } from '@ngx-progressbar/core';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'src/app/shared/services';
import { Router } from '@angular/router';
import { ExportRepo } from 'src/app/shared/repositories';
import { RoutingConstants, SystemConstants } from '@constants';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-office',
    templateUrl: './office.component.html'
})
export class OfficeComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    headers: CommonInterface.IHeaderTable[];
    offices: Office[] = [];
    criteria: any = {};
    selectedOffice: Office;
    importButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.import
    };
    exportButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.export
    };
    saveButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.save
    };

    cancelButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.cancel
    };
    addButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.add
    };
    constructor(
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _router: Router,
        private _exportRepo: ExportRepo


    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchOffice;
        this.requestSort = this.sortLocal;
    }

    sortLocal(sort: string): void {
        this.offices = this._sortService.sort(this.offices, sort, this.order);
    }

    ngOnInit() {
        this.headers = [


            { title: 'Office Code', field: 'code', sortable: true, width: 100 },
            { title: 'Name EN', field: 'branchNameEn', sortable: true },
            { title: 'Name Local', field: 'branchNameVn', sortable: true },
            { title: 'Name Abbr', field: 'shortName', sortable: true },
            { title: 'Address EN', field: 'addressEn', sortable: true },
            { title: 'Address Local', field: 'addressVn', sortable: true },
            { title: 'TaxCode', field: 'taxcode', sortable: true },
            { title: 'Company', field: 'companyName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },

        ];
        this.dataSearch = {
            type: 'All'
        };
        this.criteria.all = null;
        this.searchOffice();

    }

    export() {
        this._exportRepo.exportOffice(this.criteria)
            .subscribe(
                (response: HttpResponse<any>) => {
                    this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
                (errors: any) => {
                },
                () => { }
            );
    }


    onSearchOffice(dataSearch: any) {
        this.dataSearch = dataSearch;
        this.criteria = {};
        if (this.dataSearch.type === 'All') {
            this.criteria.all = this.dataSearch.keyword;
        }
        else {
            this.criteria.all = null;
        }
        if (this.dataSearch.type === 'Code') {

            this.criteria.Code = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'NameEn') {
            this.criteria.BranchNameEn = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'NameVn') {
            this.criteria.BranchNameVn = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'NameAbbr') {
            this.criteria.ShortName = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'Taxcode') {
            this.criteria.TaxCode = this.dataSearch.keyword;
        }
        if (this.dataSearch.type === 'Company') {
            this.criteria.CompanyName = this.dataSearch.keyword;
        }


        this.searchOffice();

    }

    searchOffice() {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.getOffice(this.page, this.pageSize, Object.assign({}, this.criteria))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    if (data.data != null) {
                        return {
                            data: data.data.map((item: any) => new Office(item)),
                            totalItems: data.totalItems,
                        };
                    }
                    return {
                        data: new Office(),
                        totalItems: 0,
                    };



                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.offices = res.data;
                    console.log(this.offices);
                },
            );
    }

    showDeletePopup(office: Office) {
        this.confirmDeletePopup.show();
        this.selectedOffice = office;
    }

    onDeleteOffice() {
        this.confirmDeletePopup.hide();
        this.deleteOffice(this.selectedOffice.id);
    }

    deleteOffice(id: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._systemRepo.deleteOffice(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchOffice();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    gotoDetailOffice(id: number) {
        this._router.navigate([`${RoutingConstants.SYSTEM.OFFICE}/${id}`]);
    }



}
