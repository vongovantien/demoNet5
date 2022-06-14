import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { SystemRepo } from '@repositories';
import { SortService } from '@services';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { finalize, catchError, map } from 'rxjs/operators';
import { AuthorizedApproval } from 'src/app/shared/models/system/authorizedApproval';
import { AuthorizedApprovalPopupComponent } from '../popup/add-authorized-approval/add-authorized-approval.popup';
import { Permission403PopupComponent, ConfirmPopupComponent } from '@common';

@Component({
    selector: 'authorized-approval-list',
    templateUrl: 'list-authorized-approval.html'
})

export class AuthorizedApprovalListComponent extends AppList {
    @ViewChild(AuthorizedApprovalPopupComponent) formPopup: AuthorizedApprovalPopupComponent;
    @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    headersAuthorized: CommonInterface.IHeaderTable[];
    authorizedApprovals: AuthorizedApproval[] = [];
    idAuthorized: string = '';
    constructor(
        private _systemRepo: SystemRepo,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchAuthorizedApproval;
        this.requestSort = this.sortAuthorizedArroval;
    }
    ngOnInit() {
        this.headersAuthorized = [
            { title: 'Authorizer', field: 'authorizer', sortable: true },
            { title: 'Commssioner', field: 'commissionerName', sortable: true },
            { title: 'Office', field: 'officeCommissionerName', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Effective Date', field: 'effectiveDate', sortable: true },
            { title: 'Expiration Date', field: 'expirationDate', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
        this.searchAuthorizedApproval();
    }

    sortAuthorizedArroval(sort: string): void {
        this.authorizedApprovals = this._sortService.sort(this.authorizedApprovals, sort, this.order);
    }

    onRequestAuthorizedApproval() {
        this.searchAuthorizedApproval();
    }

    showDetail(authorized: AuthorizedApproval) {
        this._systemRepo.checkAllowGetDetailAuthorizedApproval(authorized.id)
            .subscribe(
                (res: boolean) => {
                    if (res) {
                        this.formPopup.authorized = authorized;
                        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];
                        this.formPopup.getUserByOffice(authorized.officeCommissioner);
                        this.formPopup.formAuthorizedApproval.setValue({
                            authorizer: this.formPopup.authorized.authorizer,
                            commissioner: this.formPopup.authorized.commissioner,
                            effectiveDate: !!this.formPopup.authorized.effectiveDate ? { startDate: new Date(this.formPopup.authorized.effectiveDate), endDate: new Date(this.formPopup.authorized.effectiveDate) } : null,
                            expirationDate: !!this.formPopup.authorized.expirationDate ? { startDate: new Date(this.formPopup.authorized.expirationDate), endDate: new Date(this.formPopup.authorized.expirationDate) } : null,
                            description: this.formPopup.authorized.description,
                            type: this.formPopup.authorized.type,
                            status: this.formPopup.authorized.active,
                            officeCommissioner: this.formPopup.authorized.officeCommissioner
                        });
                        this.formPopup.minDateEffective = this.formPopup.minDateExpired = this.minDate;

                        this.formPopup.show();
                    } else {
                        this.info403Popup.show();
                    }
                }
            );

    }

    searchAuthorizedApproval() {
        this._progressRef.start();
        this._systemRepo.getAuthorizedApproval(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    if (data.data !== null) {
                        return {
                            data: data.data.map((item: any) => new AuthorizedApproval(item)),
                            totalItems: data.totalItems,
                        };
                    }
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.totalItems = res.totalItems || 0;
                        this.authorizedApprovals = res.data || [];
                    } else {
                        this.totalItems = 0;
                        this.authorizedApprovals = [];
                    }
                },
            );
    }

    prepareDeleteAuthorizedApproval(id: string) {
        this.idAuthorized = id;
        this._systemRepo.checkDeleteAuthorizedApproval(this.idAuthorized)
            .subscribe((value: boolean) => {
                if (value) {
                    this.showConfirmDelete();
                } else {
                    this.info403Popup.show();
                }
            });
    }

    showConfirmDelete() {
        this.confirmDeletePopup.show();
    }

    onDeleteAuthorizedApproval() {
        this.confirmDeletePopup.hide();
        this.deleteAuthorizedApproval(this.idAuthorized);
    }

    deleteAuthorizedApproval(id: string) {
        this._progressRef.start();
        this._systemRepo.deleteAuthorizedApproval(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchAuthorizedApproval();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }


}
