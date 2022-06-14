import { Component, ViewChild } from '@angular/core';
import { SortService } from 'src/app/shared/services/sort.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, takeUntil, withLatestFrom, every } from 'rxjs/operators';
import { CustomDeclaration } from 'src/app/shared/models';
import { AppList } from 'src/app/app.list';
import { OperationRepo, DocumentationRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, Permission403PopupComponent } from 'src/app/shared/common/popup';
import _map from 'lodash/map';
import { Router } from '@angular/router';
import { IAppState, getMenuUserPermissionState, getCurrentUserState } from '@store';
import { Store } from '@ngrx/store';
import { SystemConstants } from 'src/constants/system.const';
import { formatDate } from '@angular/common';
import { RoutingConstants } from '@constants';
import { getOperationClearanceDataSearch, getOperationClearanceList, getOperationClearanceLoadingState, getOperationClearancePagingState } from '../store';
import { CustomsDeclarationLoadListAction } from '../store/actions/custom-clearance.action';
import { HttpResponse } from '@angular/common/http';
import { InjectViewContainerRefDirective } from '@directives';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-custom-clearance',
    templateUrl: './custom-clearance.component.html',
})
export class CustomClearanceComponent extends AppList {
    @ViewChild(Permission403PopupComponent) canNotAllowActionPopup: Permission403PopupComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    listCustomDeclaration: CustomDeclaration[] = [];
    menuPermission: SystemInterface.IUserPermission;
    messageConvertError: string = '';
    clearancesToConvert: CustomDeclaration[] = [];

    defaultDataSearch = {
        fromClearanceDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd', 'en'),
        toClearanceDate: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
        imPorted: null,
        personHandle: null
    };

    constructor(
        private _store: Store<IAppState>,
        private _sortService: SortService,
        private _toastrService: ToastrService,
        private _operationRepo: OperationRepo,
        private _documentRepo: DocumentationRepo,
        private _exportRepo: ExportRepo,
        private _router: Router,
    ) {
        super();
        this.requestSort = this.sortCD;
        this.requestList = this.requestCustomDeclarationList;
    }

    ngOnInit() {
        this._store.select(getCurrentUserState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: SystemInterface.IClaimUser) => {
                if (!!res.userName) {
                    this.defaultDataSearch.personHandle = res.id
                }
            });

        this._store.select(getMenuUserPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: SystemInterface.IUserPermission) => {
                    if (res !== null && res !== undefined) {
                        this.menuPermission = res;
                    }
                }
            );
        this.headers = [
            { title: 'Clearance No', field: 'clearanceNo', sortable: true },
            { title: 'Clearance Date', field: 'clearanceDate', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Clearance Location', field: 'gatewayName', sortable: true },
            { title: 'Partner Name', field: 'customerName', sortable: true },
            { title: 'Package Qty', field: 'pcs', sortable: true },
            { title: 'GW', field: 'grossWeight', sortable: true },
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
            { title: 'Status', field: 'jobNo', sortable: true },
            { title: 'Import Country', field: 'importCountryName', sortable: true },
            { title: 'Export Country', field: 'exportCountryName', sortable: true },
        ];
        this.getListSettlePayment();
        this.getListCustomsDeclaration();
        this.isLoading = this._store.select(getOperationClearanceLoadingState);
    }

    onSearchClearance(dataSearch?: any) {
        this.dataSearch = dataSearch;
    }

    getListCustomsDeclaration() {
        this._store.select(getOperationClearanceDataSearch)
            .pipe(
                withLatestFrom(this._store.select(getOperationClearancePagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (criteria: any) => {
                    if (!!criteria.dataSearch) {
                        this.dataSearch = criteria.dataSearch;
                    }
                    else {
                        this.dataSearch = this.defaultDataSearch;
                    }

                    this.page = criteria.page;
                    this.pageSize = criteria.pageSize;
                    this.requestCustomDeclarationList();
                }
            );
    }

    requestCustomDeclarationList() {
        this._store.dispatch(CustomsDeclarationLoadListAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    getListSettlePayment() {
        this._store.select(getOperationClearanceList)
            .pipe(
                catchError(this.catchError),
                takeUntil(this.ngUnsubscribe),
                map((data: CommonInterface.IResponsePaging | any) => {
                    return {
                        data: data.data.map((item: any) => new CustomDeclaration(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.listCustomDeclaration = res.data || [];
                    this.totalItems = res.totalItems || 0;
                },
            );
    }

    sortCD(sort: string): void {
        if (!!sort) {
            if (!!this.listCustomDeclaration.length) {
                this.listCustomDeclaration = this._sortService.sort(this.listCustomDeclaration, this.sort, this.order);
            }
        }
    }

    showDetail(id) {
        this._operationRepo.checkViewDetailPermission(id)
            .subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.LOGISTICS.CUSTOM_CLEARANCE}/detail`, id]);
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }

    getDataFromEcus() {
        this._operationRepo.importCustomClearanceFromEcus()
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!!res.message) {
                        this._toastrService.success(res.message, '');
                    }
                    this.getListCustomsDeclaration();
                },
            );
    }

    getDataOlaFromEcus() {
        this._operationRepo.importCustomClearanceOlaFromEcus()
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!!res.message) {
                        this._toastrService.success(res.message, '');
                    }
                    this.getListCustomsDeclaration();
                },
            );
    }

    confirmConvert(isReplicate: boolean) {
        this._toastrService.clear();
        if (this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo).length > 0) {
            this.clearancesToConvert = this.checkValidClearancesToJobs();
            if (this.clearancesToConvert === null) { return; }

            if (this.messageConvertError.length > 0) {
                this._toastrService.error(this.messageConvertError, '', { enableHtml: true });
                this.messageConvertError = '';
                return;
            } else {
                let partnerIdsToCheckPoint: string[] = [];

                this.clearancesToConvert.forEach(c => {
                    c.isReplicate = isReplicate;
                    partnerIdsToCheckPoint.push(c.customerId);
                });

                partnerIdsToCheckPoint = [...new Set(partnerIdsToCheckPoint)];
                const sourceCheckPoint: any = [];
                for (let i = 0; i < partnerIdsToCheckPoint.length; i++) {
                    sourceCheckPoint.push(this._documentRepo.validateCheckPointContractPartner(partnerIdsToCheckPoint[i], '', 'CL', null, 1));
                }

                forkJoin([...sourceCheckPoint])
                    .pipe()
                    .subscribe((res: CommonInterface.IResult[]) => {
                        if (!!res.length) {
                            const isValid = res.some(x => x.status == false);
                            if (isValid) {
                                const messages = res.filter((i) => i.status === false).map(x => x.message);
                                console.log(messages);
                                messages.forEach(message => {
                                    this._toastrService.warning(message);
                                });
                            } else {
                                this._documentRepo.checkAllowConvertJob(this.clearancesToConvert)
                                    .subscribe(
                                        (res: any) => {
                                            if (res.status) {
                                                this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                                                    title: 'Warning',
                                                    body: 'Do you want to convert selected Clearance No to shipment',
                                                    labelConfirm: 'Ok',
                                                    labelCancel: 'No'
                                                }, () => { this.onComfirmConvertToJobs(); });
                                            } else {
                                                if (res.data === 403) {
                                                    this._toastrService.error(res.message, '', { enableHtml: true });
                                                } else {
                                                    this.canNotAllowActionPopup.show();
                                                }
                                            }
                                        },
                                    );
                            }
                        }
                    });

            }
        } else {
            this._toastrService.warning("Chưa chọn clearance để Convert", '', { enableHtml: true });
        }
    }

    deleteClearance() {
        const customCheckedArray: CustomDeclaration[] = this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo) || [];
        if (this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo).length > 0) {
            this._operationRepo.checkDeletePermission(customCheckedArray)
                .subscribe(
                    (res: any) => {
                        if (res.success) {
                            this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                                title: 'Warning',
                                body: 'Do you want to delete Clearance No selected',
                                labelCancel: 'No',
                                labelConfirm: 'Ok',
                            }, () => { this.onConfirmDelete(); });
                        } else {
                            this.canNotAllowActionPopup.show();
                        }
                    },
                );
        } else {
            this._toastrService.warning("Chưa chọn clearance để Delete", '', { enableHtml: true });
        }
    }

    onConfirmDelete() {
        const customCheckedArray: CustomDeclaration[] = this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo) || [];
        this._operationRepo.deleteMultipleClearance(customCheckedArray || [])
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.getListCustomsDeclaration();
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }

    onComfirmConvertToJobs() {
        this._documentRepo.convertExistedClearanceToJob(this.clearancesToConvert)
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastrService.success('Convert Success');
                        this.getListCustomsDeclaration();
                    }
                },
            );
    }

    checkUncheckAll() {
        for (const clearance of this.listCustomDeclaration) {
            clearance.isSelected = this.isCheckAll;
        }
    }

    onChangeAction() {
        this.isCheckAll = this.listCustomDeclaration.every((item: CustomDeclaration) => item.isSelected);
    }

    checkValidClearancesToJobs() {
        const customCheckedArray: CustomDeclaration[] = this.listCustomDeclaration.filter((item: CustomDeclaration) => item.isSelected && !item.jobNo);
        if (customCheckedArray === null) {
            return customCheckedArray;
        }
        for (const row of customCheckedArray) {
            const clearance: CustomDeclaration = row;

            if (clearance.mblid === null || clearance.mblid.length === 0) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có MBL/MAWB để tạo job mới <br />`;
            }
            if (clearance.hblid === null || clearance.hblid.length === 0) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có HBL/HAWB để tạo job mới <br />`;
            }
            if (clearance.clearanceDate === null) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có clearance date để tạo job mới <br />`;
            }
            if (clearance.partnerTaxCode === null || clearance.partnerTaxCode.length === 0) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có customer để tạo job mới <br />`;
            }
            if (clearance.serviceType !== "Air" && clearance.serviceType !== "Express") {
                if (clearance.cargoType === null) {
                    this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có cargo type để tạo mới <br />`;
                }
            }
            if (clearance.type === null) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có Type để tạo job mới <br />`;
            }
        }
        if (this.messageConvertError.length === 0) {
            const customCheckedHBL = customCheckedArray.map(x => x.hblid);
            const customCheckedMBL = customCheckedArray.map(x => x.mblid);
            if (customCheckedHBL.some((c, index) => customCheckedHBL.indexOf(c) !== index)) {
                if (customCheckedMBL.some((c, index) => customCheckedMBL.indexOf(c) !== index)) {
                    this.messageConvertError += `Các clearance được chọn đang trùng số [MBL/MAWB] và [HBL/HAWB] <br />`;
                }
                // this.messageConvertError = `Các clearance được chọn đang trùng số [HBL/HAWB] <br />`;
            }

        }
        return customCheckedArray;
    }

    export() {
        const body = this.dataSearch || {};
        this._exportRepo.exportCustomClearance(body)
            .subscribe(
                (response: HttpResponse<Blob>) => {
                    this.downLoadFile(response, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
                (errors: any) => {
                },
                () => { }
            );
    }

    gotoCreateCD() {
        this._router.navigate([`${RoutingConstants.LOGISTICS.CUSTOM_CLEARANCE}/new`]);
    }

    import() {
        this._router.navigate([`${RoutingConstants.LOGISTICS.CUSTOM_CLEARANCE}/import`]);

    }


}



