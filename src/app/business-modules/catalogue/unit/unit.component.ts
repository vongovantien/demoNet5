import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { Unit } from 'src/app/shared/models/catalogue/catUnit.model';
import { SortService } from 'src/app/shared/services/sort.service';
import { AppList } from 'src/app/app.list';
import { CatalogueRepo, ExportRepo } from 'src/app/shared/repositories';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { FormCreateUnitPopupComponent } from './components/form/form-unit.popup';

import { catchError, finalize } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-unit',
    templateUrl: './unit.component.html',
})
export class UnitComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePoup: ConfirmPopupComponent;
    @ViewChild(FormCreateUnitPopupComponent) formUnitPopup: FormCreateUnitPopupComponent;

    configSearch: CommonInterface.IConfigSearchOption = {
        settingFields: [
            { fieldName: 'code', displayName: 'Code' },
            { fieldName: 'unitNameEn', displayName: 'English Name' },
            { fieldName: 'unitNameVn', displayName: 'Local Name' }
        ],
        typeSearch: TypeSearch.outtab
    };

    ListUnits: Unit[] = [];

    selectedUnit: Unit = null;

    constructor(
        private _sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgressService: NgProgress,
        private _exportRepo: ExportRepo,
        private _toastService: ToastrService
    ) {
        super();

        this._progressRef = this._ngProgressService.ref();

        this.requestList = this.getUnits;
        this.requestSearch = this.searchUnit;
        this.requestSort = this.sortUnit;
    }

    ngOnInit() {

        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'unitNameEn', sortable: true },
            { title: 'Name Local', field: 'unitNameVn', sortable: true },
            { title: 'Type', field: 'unitType', sortable: true },
            { title: 'Description EN', field: 'descriptionEn', sortable: true },
            { title: 'Description Local', field: 'descriptionVn', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];

        this.getUnits();
    }

    searchUnit(event: CommonInterface.ISearchOption) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.page = 1;
        this.getUnits();
    }

    resetSearch() {
        this.dataSearch = {};
        this.getUnits();
    }

    sortUnit() {
        this.ListUnits = this._sortService.sort(this.ListUnits, this.sort, this.order);
    }

    getUnits() {
        this._progressRef.start();
        this._catalogueRepo.getUnit(this.dataSearch, this.page, this.pageSize)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.totalItems = res.totalItems || 0;
                    this.ListUnits = res.data || [];
                }
            );
    }

    showUpdateUnit(unit: Unit) {
        this.formUnitPopup.isSubmitted = false;
        this.selectedUnit = unit;

        if (!!this.selectedUnit.code) {
            this.formUnitPopup.isUpdate = true;
            this.formUnitPopup.form.patchValue({
                unitType: { id: this.selectedUnit.unitType, text: this.formUnitPopup.unitTypes.find(type => type.id === this.selectedUnit.unitType).text },
                id: unit.id,
                code: unit.code,
                unitNameEn: unit.unitNameEn,
                unitNameVn: unit.unitNameVn,
                descriptionEn: unit.descriptionEn,
                descriptionVn: unit.descriptionVn,
                active: unit.active
            });

            this.formUnitPopup.show();
        }
    }

    addNewUnit() {
        this.formUnitPopup.isUpdate = false;
        this.formUnitPopup.isSubmitted = false;

        this.formUnitPopup.form.reset();
        this.formUnitPopup.show();
    }

    deleteUnit(unit: Unit) {
        this.selectedUnit = new Unit(unit);
        this.confirmDeletePoup.show();
    }

    onDelete() {
        this.confirmDeletePoup.hide();
        this._progressRef.start();

        this._catalogueRepo.deleteUnit(this.selectedUnit.id)
            .pipe(finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this.resetSearch();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    export() {
        this._progressRef.start();
        this._exportRepo.exportUnit(this.dataSearch)
            .pipe((finalize(() => this._progressRef.complete())))
            .subscribe(
                (res: HttpResponse<any>) => {
                    this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                },
            );
    }

}
