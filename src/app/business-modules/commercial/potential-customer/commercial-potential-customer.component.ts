import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList, IPermissionBase } from '@app';
import { CatPotentialModel } from '@models';
import { CatalogueRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { SortService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { Permission403PopupComponent, ConfirmPopupComponent } from '@common';
import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';

import { CommercialFormSearchPotentialCustomerComponent } from './components/form-search/form-search-potential-customer.component';
import { CommercialPotentialCustomerPopupComponent } from './components/popup/potential-customer-commercial.popup';

import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';


@Component({
    selector: 'app-commercial-potential-customer',
    templateUrl: './commercial-potential-customer.component.html',
})
export class CommercialPotentialCustomerComponent extends AppList implements OnInit, IPermissionBase {
    @ViewChild(CommercialFormSearchPotentialCustomerComponent) formSearch: CommercialFormSearchPotentialCustomerComponent;
    @ViewChild(CommercialPotentialCustomerPopupComponent) potentialCustomerPopup: CommercialPotentialCustomerPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    selectedPotentialId: string;

    potentialCustomers: CatPotentialModel[] = [];

    constructor(
        private _ngProgressService: NgProgress,
        private _sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestList = this.getPotentialCustomerListPaging;
        this.requestSort = this.sortPotentialCustomerList;
        this._progressRef = this._ngProgressService.ref();
    }
    ngOnInit(): void {
        this.headers = [
            { title: 'English Name', field: 'nameEn', sortable: true },
            { title: 'Local Name', field: 'nameLocal', sortable: true },
            { title: 'Tax Code', field: 'taxcode', sortable: true },
            { title: 'Tel', field: 'tel', sortable: true },
            { title: 'Address', field: 'address', sortable: true },
            { title: 'Email', field: 'email', sortable: true },
            { title: 'Margin', field: 'margin', sortable: true },
            { title: 'Quotation', field: 'quotation', sortable: true },
            { title: 'Creator', field: 'userCreatedName', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.configSearch = {
            settingFields: [...this.headers.slice(0, 4)]
                .map(x => ({ "fieldName": x.field === 'userCreatedName' ? 'creator' : x.field, "displayName": x.title })),
            typeSearch: CommonEnum.TypeSearch.intab
        };
        this.getPotentialCustomerListPaging();
    }

    getPotentialCustomerListPaging() {
        this.isLoading = true;
        this._catalogueRepo.getPotentialCustomerListPaging(this.page, this.pageSize, Object.assign({}, this.dataSearch))
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
                    this.potentialCustomers = (res.data || []).map(i => new CatPotentialModel(i)) || [];
                },
            );
    }

    sortPotentialCustomerList(sortField: string, order: boolean) {
        this.potentialCustomers = this._sortService.sort(this.potentialCustomers, sortField, order);
    }

    checkAllowDetail(potentialId: string): void {
        this._progressRef.start();
        this._catalogueRepo.checkAllowGetDetailPotential(potentialId)
            .pipe(
                switchMap(
                    (res: boolean) => {
                        if (res) {
                            return this._catalogueRepo.getDetailPotential(potentialId);
                        }
                        return of(null);
                    }
                ),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (res === null) {
                        this.permissionPopup.show();
                    } else {
                        this.potentialCustomerPopup.handleBindPotentialDetail(res.potential);
                        [this.potentialCustomerPopup.isUpdate, this.potentialCustomerPopup.isSubmitted] = [true, false];
                        this.potentialCustomerPopup.show();
                    }
                }
            );
    }

    checkAllowDelete(potentialId: string): void {
        this.selectedPotentialId = potentialId;
        this._catalogueRepo.checkAllowDeletePotential(potentialId)
            .pipe(
                catchError(this.catchError),
            ).subscribe((res: boolean) => {
                if (res) {
                    this.confirmDeletePopup.show();
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    onDelete() {
        this._progressRef.start();
        this._catalogueRepo.deletePotential(this.selectedPotentialId)
            .pipe(catchError(this.catchError),
                finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.confirmDeletePopup.hide();
                        this._toastService.success(res.message);
                        this.formSearch.searchObject = {
                            field: 'all',
                            displayName: 'All',
                            searchString: ""
                        };
                        this.onResetPotentialCustomer({});

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onSearchPotentialCustomer(event) {
        this.dataSearch = { [event.field]: event.searchString };

        this.page = 1;
        this.getPotentialCustomerListPaging();
    }

    onResetPotentialCustomer(event) {
        this.onSearchPotentialCustomer(event);
    }

    addNew() {
        [this.potentialCustomerPopup.isUpdate, this.potentialCustomerPopup.isSubmitted] = [false, false];
        this.potentialCustomerPopup.initForm();
        this.potentialCustomerPopup.show();
    }

    handleChangePotentialPopup(event: any) {
        this.dataSearch = {};
        this.getPotentialCustomerListPaging();
    }

    exportExcel() {
        this._catalogueRepo.downloadPotentialCustomerListExcel(this.dataSearch)
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                }
            );
    }

}

