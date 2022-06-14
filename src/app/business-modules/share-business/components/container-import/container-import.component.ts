import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';

import { PopupBase } from 'src/app/popup.base';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { finalize, catchError } from 'rxjs/operators';
import { InfoPopupComponent } from 'src/app/shared/common/popup';

import * as fromStore from './../../store';
import { SystemConstants } from '@constants';
@Component({
    selector: 'container-import-popup',
    templateUrl: './container-import.component.html'
})
export class ShareContainerImportComponent extends PopupBase implements OnInit {
    @ViewChild(InfoPopupComponent) importAlert: InfoPopupComponent;

    isShowInvalid: boolean = true;
    totalValidRow: number = 0;
    totalInvalidRow: number = 0;
    headers: CommonInterface.IHeaderTable[];
    data: any[];
    existedError: string = null;
    duplicatedError: string = null;
    importedData: any[] = [];
    mblid: string = null;
    hblid: string = null;

    constructor(
        private _docRepo: DocumentationRepo,
        private _store: Store<any>,
        private _progressService: NgProgress
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.getData;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Cont Type', field: 'containerTypeName', sortable: true, required: true },
            { title: 'Cont Qty', field: 'quantity', sortable: true, required: true },
            { title: 'Cont No', field: 'containerNo', sortable: true },
            { title: 'Seal No', field: 'sealNo', sortable: true },
            { title: 'GW', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'NW', field: 'nw', sortable: true },
            { title: 'Package Qty', field: 'packageQuantity', sortable: true },
            { title: 'Package Type', field: 'packageTypeName', sortable: true },
            { title: 'Mark No', field: 'markNo', sortable: true },
            { title: 'Description', field: 'description', sortable: true },
            { title: 'Commodity', field: 'commodityName', sortable: true },
            { title: 'Unit', field: 'unitOfMeasureName', sortable: true },
        ];
    }

    chooseFile(file: Event) {
        if (file.target['files'] == null) { return; }
        this._progressRef.start();
        let parentId = this.hblid;
        let isHouseBill = true;
        if (parentId == null) {
            parentId = this.mblid;
            isHouseBill = false;
        }
        this._docRepo.upLoadContainerFile(file.target['files'], parentId, isHouseBill)
            .pipe(
                finalize(() => {
                    this._progressRef.complete();
                    if (this.data != null) {
                        this.getData();
                    }
                })
            )
            .subscribe((response: any) => {
                if (response["list"] != null) {
                    this.data = response["list"];
                    this.totalItems = this.data.length;
                    this.totalValidRow = response['totalValidRows'];
                    this.duplicatedError = response['duplicatedError'];
                    this.existedError = response['existedError'];
                    this.totalInvalidRow = this.totalItems - this.totalValidRow;
                }
            }, err => {
            });
    }
    pageChanged(event: any) {
        if (this.page !== event.page || this.pageSize !== event.itemsPerPage) {
            this.page = event.page;
            this.pageSize = event.itemsPerPage;

            this.getData();
        }
    }
    selectPageSize(pageSize: number) {
        this.pageSize = pageSize;
        this.page = 1;  // TODO reset page to initial
        this.totalItems = 0;
        this.getData();
    }
    getData() {
        this.totalItems = this.data.length;
        this.page = 0;
        const end = this.page + (this.pageSize - 1);
        this.importedData = this.data.slice(this.page, end);
        console.log(this.importedData);
    }
    downloadFile() {
        this._docRepo.downloadcontainerfileExcel()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, "ContainerImportTemplate.xlsx");
                },
            );
    }

    hideInvalid() {
        this.page = 0;
        const end = this.page + (this.pageSize - 1);
        if (this.data == null) { return; }
        this.isShowInvalid = !this.isShowInvalid;
        if (this.isShowInvalid) {
            this.totalItems = this.data.length;
            this.importedData = this.data.slice(this.page, end);
        } else {
            const inValidItems = this.data.filter(x => !x.isValid);
            this.totalItems = inValidItems.length;
            this.importedData = inValidItems.slice(this.page, end);
        }
    }

    import(element) {
        if (this.data == null) { return; }
        if (this.totalInvalidRow > 0) {
            this.importAlert.show();
        } else {
            console.log("container from import excel", this.data);
            this._store.dispatch(new fromStore.AddContainersAction(this.data));
            this.reset(element);
            this.hide();
        }
    }
    reset(element) {
        this.data = null;
        this.importedData = [];
        this.totalItems = 0;
        this.totalValidRow = 0;
        this.totalInvalidRow = 0;
        this.duplicatedError = null;
        this.existedError = null;
        element.value = "";
    }
    close(element) {
        this.reset(element);
        this.hide();
    }
}
