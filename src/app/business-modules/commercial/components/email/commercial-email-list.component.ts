import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from '@app';
import { Router } from '@angular/router';
import { CatalogueRepo } from '@repositories';
import { PartnerEmail } from 'src/app/shared/models/catalogue/partnerEmail.model';
import { catchError, finalize } from 'rxjs/operators';
import { FormUpdateEmailCommercialCatalogueComponent } from 'src/app/business-modules/share-modules/components/form-update-email-commercial-catalogue/form-update-email-commercial-catalogue.popup';
import { ConfirmPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { SortService } from '@services';

@Component({
    selector: 'app-commercial-email-list',
    templateUrl: 'commercial-email-list.component.html'
})

export class CommercialEmailListComponent extends AppList {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(FormUpdateEmailCommercialCatalogueComponent) formUpdateEmailPopup: FormUpdateEmailCommercialCatalogueComponent;
    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _ngProgressService: NgProgress,
        private _sortService: SortService

    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
        this.requestSort = this.sortLocal;
    }

    partnerEmails: PartnerEmail[] = [];
    partnerId: string = '';
    id: string = '';
    indexLstEmail: number = null;

    ngOnInit() {
        this.headers = [
            { title: 'Office', field: 'officeAbbrName', sortable: true },
            { title: 'Email', field: 'email', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Update', field: '', sortable: false },
        ];
    }

    getEmailPartner(partnerId: string) {
        this.isLoading = true;
        this._catalogueRepo.getEmailPartner(partnerId)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
            })).subscribe(
                (res: PartnerEmail[]) => {
                    this.partnerEmails = res || [];
                }
            );
    }

    showConfirmDelete(id: string, index: number) {
        this.id = id;
        if (!!this.id) {
            this.confirmDeletePopup.show();
        } else {
            this.partnerEmails = [...this.partnerEmails.slice(0, index), ...this.partnerEmails.slice(index + 1)];
        }
    }

    gotoDetailEmail(id: string, index: number = null) {
        this.id = id;
        this.formUpdateEmailPopup.isUpdate = true;
        this.formUpdateEmailPopup.id = this.id;
        this.formUpdateEmailPopup.partnerId = this.partnerId;
        !!this.formUpdateEmailPopup.partnerId ? this.indexLstEmail = null : this.indexLstEmail = index;
        if (!!this.formUpdateEmailPopup.partnerId) {
            this._catalogueRepo.getDetailPartnerEmail(this.id)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: PartnerEmail) => {
                        if (!!res) {
                            this.formUpdateEmailPopup.updateFormValue(res);
                            this.formUpdateEmailPopup.show();
                        }
                    }
                );
        }
        else {
            this.formUpdateEmailPopup.indexDetailEmail = this.indexLstEmail;
            const data = this.partnerEmails[this.indexLstEmail];
            this.formUpdateEmailPopup.updateFormValue(data);
            this.formUpdateEmailPopup.show();
        }

    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._catalogueRepo.deletePartnerEmail(this.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getEmailPartner(this.partnerId);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }


    sortLocal(sort: string): void {
        this.partnerEmails = this._sortService.sort(this.partnerEmails, sort, this.order);
    }

    onRequestEmail($event: any) {
        const data = $event;
        if (data === true) {
            this.formUpdateEmailPopup.hide();
            this.getEmailPartner(this.partnerId);
        }
        else {
            data.officeAbbrName = this.formUpdateEmailPopup.offices.find(x => x.id === data.officeId).text;
            data.datetimeModified = new Date();
            const userLogged = JSON.parse(localStorage.getItem('id_token_claims_obj'));
            data.userModfiedName = userLogged.userName;
            if (this.indexLstEmail !== null) {
                this.partnerEmails[this.indexLstEmail].index = this.indexLstEmail;
                const checkUpdate = this.partnerEmails.some(x => data.type.includes(x.type) && data.officeId.includes(x.officeId) && x.index !== data.index);
                if (!checkUpdate) {
                    this.partnerEmails[this.indexLstEmail] = data;
                    this.partnerEmails = [...this.partnerEmails];
                    this.formUpdateEmailPopup.hide();
                } else {
                    this._toastService.error('Duplicate type,office!');
                }
            } else {
                const check = this.partnerEmails.some(x => data.type.includes(x.type) && data.officeId.includes(x.officeId));
                if (!check) {
                    this.partnerEmails = [...this.partnerEmails, data];
                    this.formUpdateEmailPopup.hide();
                } else {
                    this._toastService.error('Duplicate type,office!');
                }
            }
        }
    }

    showPopupUpdateEmail() {
        this.formUpdateEmailPopup.partnerId = this.partnerId;
        this.formUpdateEmailPopup.isUpdate = false;
        if (!this.formUpdateEmailPopup.isUpdate) {
            this.formUpdateEmailPopup.formGroup.reset();
            this.formUpdateEmailPopup.type.setValue("Billing");
        }
        this.formUpdateEmailPopup.show();
    }

}