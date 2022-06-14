import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { SortService } from 'src/app/shared/services/sort.service';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { Currency } from 'src/app/shared/models';
import { AppList } from 'src/app/app.list';
import { CatalogueRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { FormCreateCurrencyPopupComponent } from './components/form-create/form-create-currency.popup';

import { catchError, finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-currency',
    templateUrl: './currency.component.html',
})
export class CurrencyComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(FormCreateCurrencyPopupComponent) formPopup: FormCreateCurrencyPopupComponent;

    currencies: Array<Currency> = [];

    headers: CommonInterface.IHeaderTable[];

    currency: Currency = new Currency();

    criteria: any = {};

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'id', displayName: 'Code' },
            { fieldName: 'currencyName', displayName: 'Name' }
        ],
        typeSearch: TypeSearch.outtab
    };

    constructor(
        private _sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgessSerice: NgProgress,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
    ) {
        super();

        this.requestList = this.getCurrencies;
        this.requestSort = this.sortCurrency;
        this._progressRef = this._ngProgessSerice.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Code', sortable: true, field: 'id' },
            { title: 'Name', sortable: true, field: 'currencyName' },
            { title: 'DeFault', sortable: true, field: 'isDefault' },
            { title: 'Status', sortable: true, field: 'active' },
        ];
        this.getCurrencies();
    }

    getCurrencies() {
        this._progressRef.start();
        this._catalogueRepo.getListCurrency(this.page, this.pageSize, this.criteria)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (response: CommonInterface.IResponsePaging) => {
                    this.currencies = response.data;
                    this.totalItems = response.totalItems;
                    this.pageSize = response.size;
                }
            );
    }

    sortCurrency() {
        this.currencies = this._sortService.sort(this.currencies, this.sort, this.order);
    }

    onSearch(event: { field: string, searchString: string, displayName: string }) {
        this.criteria = {};
        this.criteria[event.field] = event.searchString;
        this.getCurrencies();
    }

    resetSearch(event: any) {
        this.criteria = {};
        this.getCurrencies();
    }

    showAdd() {
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [false, false];

        this.formPopup.form.reset();
        this.formPopup.show();
    }

    showDetail(currency: Currency) {
        this.currency = currency;
        [this.formPopup.isUpdate, this.formPopup.isSubmitted] = [true, false];


        this.formPopup.form.setValue({
            code: this.currency.id,
            name: this.currency.currencyName,
            active: this.currency.active,
            default: this.currency.isDefault
        });

        this.formPopup.show();
    }

    showConfirmDelete(currency: Currency) {
        this.currency = currency;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();
        this._catalogueRepo.deleteCurrency(this.currency.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (response: CommonInterface.IResult) => {
                    if (response.status) {
                        this._toastService.success(response.message);

                        this.getCurrencies();
                    } else {
                        this._toastService.error(response.message);
                    }
                }
            );
    }

    export() {
        this._progressRef.start();

        this._exportRepo.exportCurrency(this.criteria)
            .pipe((finalize(() => this._progressRef.complete())))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }
}
