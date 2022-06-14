import { AppList } from "@app";
import { Component, ChangeDetectorRef, ViewChild } from "@angular/core";
import { SortService } from "@services";
import { ToastrService } from "ngx-toastr";
import { CommodityGroup } from "@models";
import { CatalogueRepo, ExportRepo } from "@repositories";
import { NgProgress } from "@ngx-progressbar/core";
import { ConfirmPopupComponent } from "@common";
import { CommonEnum } from "@enums";

import { CommodityGroupAddPopupComponent } from "../form-create-commodity-group/form-create-commodity-group.popup";
import { catchError, finalize, map } from "rxjs/operators";
import { HttpResponse } from "@angular/common/http";
import { SystemConstants } from "@constants";
@Component({
    selector: 'commodity-group-list',
    templateUrl: './list-commodity-group.component.html',
})

export class CommodityGroupListComponent extends AppList {
    @ViewChild(CommodityGroupAddPopupComponent) commodityGroupAddPopupComponent: CommodityGroupAddPopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    commodityGroups: CommodityGroup[] = [];
    commodityGroup: CommodityGroup;

    constructor(
        private catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _cd: ChangeDetectorRef,
        private _ngProgessSerice: NgProgress,
        private _sortService: SortService,
    ) {
        super();
        this._progressRef = this._ngProgessSerice.ref();
        this.requestList = this.getGroupCommodities;
        this.requestSort = this.sortCommodityGroup;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Id', sortable: true, field: 'id' },
            { title: 'Name(EN)', sortable: true, field: 'groupNameEn' },
            { title: 'Name(Local)', sortable: true, field: 'groupNameVn' },
            { title: 'Status', sortable: true, field: 'active' },
        ];

        this.configSearch = {
            settingFields: this.headers.slice(1, 3).map(x => ({ "fieldName": x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.outtab,
        };
        this.getGroupCommodities();
    }

    ngAfterViewInit() {
        this._cd.detectChanges();
    }

    getGroupCommodities() {
        this._progressRef.start();
        this.catalogueRepo.getCommodityGroupPaging(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new CommodityGroup(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.commodityGroups = res.data;
                },
            );
    }

    openPopupAddCommodityGroup() {
        this.commodityGroupAddPopupComponent.action = 'create';
        this.commodityGroupAddPopupComponent.show();
    }

    showDetailCommodityGroup(commodityGroup) {
        this.catalogueRepo.getDetailCommodityGroup(commodityGroup.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res.id !== 0) {
                        const _commodityGroup = new CommodityGroup(res);
                        this.commodityGroupAddPopupComponent.action = "update"
                        this.commodityGroupAddPopupComponent.commodityGroup = _commodityGroup;
                        this.commodityGroupAddPopupComponent.getDetail();
                        this.commodityGroupAddPopupComponent.show();
                    } else {
                        this._toastService.error("Not found data");
                    }
                },
            );
    }

    onSearch(event: { field: string, searchString: string, displayName: string }) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.page = 1;
        this.getGroupCommodities();
    }

    resetSearch(event) {
        this.dataSearch = {};
        this.getGroupCommodities();
    }

    showConfirmDelete(data: any) {
        this.commodityGroup = data;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this.deleteGroupCommodity();
    }

    deleteGroupCommodity() {
        this.catalogueRepo.deleteCommodityGroup(this.commodityGroup.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getGroupCommodities();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    onRequestCommodityGroup() {
        this.getGroupCommodities();
    }

    sortCommodityGroup(sortData: CommonInterface.ISortData): void {
        this.commodityGroups = this._sortService.sort(this.commodityGroups, sortData.sortField, sortData.order);
    }

    exportComGroup() {
        this._exportRepo.exportCommodityGroup(this.dataSearch)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}