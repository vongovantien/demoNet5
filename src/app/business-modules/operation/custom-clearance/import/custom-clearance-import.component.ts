import { Component, OnInit, ViewChild } from '@angular/core';
import { PagingService } from 'src/app/shared/services/paging-service';
import { SortService } from 'src/app/shared/services/sort.service';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemConstants } from 'src/constants/system.const';
import { language } from 'src/languages/language.en';
import { ToastrService } from 'ngx-toastr';
import { OperationRepo } from '@repositories';
import { finalize, catchError } from 'rxjs/operators';
import { AppPage } from 'src/app/app.base';
import { InfoPopupComponent } from '@common';

@Component({
    selector: 'app-custom-clearance-import',
    templateUrl: './custom-clearance-import.component.html',
})
export class CustomClearanceImportComponent extends AppPage implements OnInit {
    @ViewChild(InfoPopupComponent) invaliDataAlert: InfoPopupComponent;
    data: any[];
    pagedItems: any[] = [];
    inValidItems: any[] = [];
    totalValidRows: number = 0;
    totalRows: number = 0;
    isShowInvalid: boolean = true;
    pager: PagerSetting = PAGINGSETTING;

    constructor(
        private pagingService: PagingService,
        private sortService: SortService,
        private toastr: ToastrService,
        private _operationRepo: OperationRepo,
        private _progressService: NgProgress) {
        super();
        this._progressRef = this._progressService.ref();
    }

    isDesc = true;
    sortKey: string;

    ngOnInit() {
        this.pager.totalItems = 0;
    }

    chooseFile(file: Event) {
        if (file.target['files'] == null) { return; }
        this._progressRef.start();
        /**/
        this.resetBeforeSelecedFile();
        /**/
        this._operationRepo.upLoadClearanceFile(file.target['files'])
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                })
            )
            .subscribe((response: any) => {
                this.data = response.data;
                this.pager.totalItems = this.data.length;
                this.totalValidRows = response.totalValidRows;
                this.pager.currentPage = 1;
                this.totalRows = this.data.length;
                this.pagingData(this.data);
                this._progressRef.complete();
            }, () => {
            });
    }

    pagingData(data: any[]) {
        this.pager = this.pagingService.getPager(data.length, this.pager.currentPage, this.pager.pageSize);
        this.pager.numberPageDisplay = SystemConstants.OPTIONS_NUMBERPAGES_DISPLAY;
        this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
        this.pagedItems = data.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
    async downloadSample() {
        this._operationRepo.downloadCustomClearanceExcel()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, "CustomClearanceTemplate.xlsx");
                },
            );
    }
    sort(property) {
        this.isDesc = !this.isDesc;
        this.sortKey = property;
        this.pagedItems = this.sortService.sort(this.pagedItems, property, this.isDesc);
    }


    hideInvalid() {
        if (this.data == null) { return; }
        this.isShowInvalid = !this.isShowInvalid;
        this.sortKey = '';
        if (this.isShowInvalid) {
            this.pager.totalItems = this.data.length;
            this.pagingData(this.data);
        } else {
            this.inValidItems = this.data.filter(x => !x.isValid);
            this.pagingData(this.inValidItems);
            this.pager.totalItems = this.inValidItems.length;
        }
    }

    reset(element) {
        this.data = null;
        this.pagedItems = null;
        this.pager.totalItems = 0;
        this.totalRows = this.totalValidRows = 0;
        element.value = "";
    }

    resetBeforeSelecedFile() {
        this.pager.currentPage = 1;
        this.pager.totalItems = 0;
        this.totalRows = this.totalValidRows = 0;
        this.pagedItems = [];
        this.isShowInvalid = true;
    }

    import(element) {
        if (this.data == null || this.data === undefined) {
            this.toastr.warning('Not selected import file', '', { positionClass: 'toast-bottom-right', closeButton: true, timeOut: 5000 });
            return;
        }
        if (this.totalRows - this.totalValidRows > 0) {
            this.invaliDataAlert.show();
        } else {
            this._progressRef.start();
            this._operationRepo.importCustomClearance(this.data)
                .pipe(
                    finalize(() => {
                        this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res) => {
                        if (res.success) {
                            this.toastr.success(language.NOTIFI_MESS.IMPORT_SUCCESS);
                            this.pager.totalItems = 0;
                            this.reset(element);
                        } else {
                            this.toastr.error(res.message);
                        }
                    }
                );
        }
    }
    selectPageSize() {
        this.pager.currentPage = 1;
        if (this.isShowInvalid) {
            this.pager.totalItems = this.data.length;
            this.pagingData(this.data);

        } else {
            this.inValidItems = this.data.filter(x => !x.isValid);
            this.pagingData(this.inValidItems);
            this.pager.totalItems = this.inValidItems.length;
        }
    }
    pageChanged(event: any): void {
        if (this.pager.currentPage !== event.page || this.pager.pageSize !== event.itemsPerPage) {
            this.pager.currentPage = event.page;
            this.pager.pageSize = event.itemsPerPage;

            this.pagingData(this.data);
        }
    }
}
