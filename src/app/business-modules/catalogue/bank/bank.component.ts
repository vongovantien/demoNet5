import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { SortService } from 'src/app/shared/services/sort.service';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { Bank } from 'src/app/shared/models';
import { AppList } from 'src/app/app.list';
import { CatalogueRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { FormCreateBankPopupComponent } from './components/form-create/form-create-bank.popup';

import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-bank',
    templateUrl: './bank.component.html',
})
export class BankComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(FormCreateBankPopupComponent) formPopup: FormCreateBankPopupComponent;

    banks: Array<Bank> = [];

    headers: CommonInterface.IHeaderTable[];

    Bank: Bank = new Bank();

    criteria: any = {};

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'bankNameVn', displayName: 'Bank Name VN' },
            { fieldName: 'bankNameEn', displayName: 'Bank Name EN' },
        ],
        typeSearch: TypeSearch.outtab
    };

    constructor(
        private _sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgessSerice: NgProgress,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _router: Router
    ) {
        super();

        this.requestList = this.getBanks;
        this.requestSort = this.sortBank;
        this._progressRef = this._ngProgessSerice.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', sortable: true, field: 'id' },
            { title: 'Bank Name (VN)', sortable: true, field: 'BankNameVN' },
            { title: 'Bank Name (EN)', sortable: true, field: 'BankNameEN' },
            { title: 'Status', sortable: true, field: 'active' },
        ];
        this.getBanks();
    }

    getBanks() {
        this._progressRef.start();
        this._catalogueRepo.getListBank(this.page, this.pageSize, this.criteria)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (response: CommonInterface.IResponsePaging) => {
                    this.banks = response.data??[];
                    this.totalItems = response.totalItems;
                    this.pageSize = response.size;
                }
            );
    }

    sortBank() {
        this.banks = this._sortService.sort(this.banks, this.sort, this.order);
    }

    onSearch(event: { field: string, searchString: string, displayName: string }) {
        this.criteria = {};
        this.criteria[event.field] = event.searchString;
        this.getBanks();
    }

    resetSearch(event: any) {
        this.criteria = {};
        this.getBanks();
    }

    showAdd() {
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [false, false];

        this.formPopup.form.reset();
        this.formPopup.show();
    }

    showDetail(Bank: Bank) {
        this.Bank = Bank;
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];
        this.formPopup.id = this.Bank.id;
        this.formPopup.userModifiedName = this.Bank.userModifiedName; 
        this.formPopup.userCreatedName = this.Bank.userCreatedName; 
        this.formPopup.form.setValue({
            bankNameCode: this.Bank.code,
            bankNameVN: this.Bank.bankNameVn,
            bankNameEN: this.Bank.bankNameEn,
            active: this.Bank.active,
            userModifiedName:this.Bank.userModifiedName,
            userCreatedName:this.Bank.userCreatedName
        });

        this.formPopup.show();
    }

    showConfirmDelete(Bank: Bank) {
        this.Bank = Bank;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();
        this._catalogueRepo.deleteBank(this.Bank.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (response: CommonInterface.IResult) => {
                    if (response.status) {
                        this._toastService.success(response.message);

                        this.getBanks();
                    } else {
                        this._toastService.error(response.message);
                    }
                }
            );
    }

    export() {
        this._progressRef.start();
        this._exportRepo.exportBank(this.criteria)
            .pipe((finalize(() => this._progressRef.complete())))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}
