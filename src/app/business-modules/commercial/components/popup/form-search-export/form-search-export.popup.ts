import { Component } from '@angular/core';
import { PopupBase } from '@app';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { getMenuUserPermissionState, IAppState } from '@store';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { ExportRepo, SystemRepo } from '@repositories';
import { SystemConstants } from '@constants';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { NgProgress } from '@ngx-progressbar/core';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'form-search-export-popup',
    templateUrl: './form-search-export.popup.html'
})
export class FormSearchExportComponent extends PopupBase {

    formSearch: FormGroup;
    createdDate: AbstractControl;
    salesman: AbstractControl;
    status: AbstractControl;
    salesmanList: any[] = [];
    salesmanActive: any[] = [];
    statusList: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: 'Active', text: 'Active' },
        { id: 'Inactive', text: 'Inactive' },
    ];

    dataSearch: any = {};
    partnerType: string = null;

    constructor(
        private readonly _ngProgressService: NgProgress,
        private readonly _fb: FormBuilder,
        private readonly _sysRepo: SystemRepo,
        private readonly _exportRepo: ExportRepo,
        private readonly _activedRoute: ActivatedRoute,
        private readonly _store: Store<IAppState>
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this._activedRoute.data
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                if (!!data.type) {
                    this.partnerType = data.type;
                }
            })

        this.initForm()

        this._store.select(getMenuUserPermissionState)
            .pipe(
                switchMap((res: any) => this._sysRepo.getListUserWithPermission(res.menuId, 'Detail')),
                takeUntil(this.ngUnsubscribe)
            ).subscribe((res: any) => {
                this.salesmanList = res;

                this.salesmanList.unshift({ id: 'All', username: 'All' });
                this.salesman.setValue([this.salesmanList[0].id]);
            });
    }

    initForm() {
        this.formSearch = this._fb.group({
            salesman: [],
            createdDate: [],
            status: [this.statusList[0].id]
        });

        this.salesman = this.formSearch.controls['salesman'];
        this.createdDate = this.formSearch.controls['createdDate'];
        this.status = this.formSearch.controls['status'];
    }

    detectChangeDataInfo(data: any, type: string) {
        switch (type) {
            case 'salesman':
                if (data.length > 1) {
                    if (data.findIndex(x => x.id === 'All') === 0) {
                        this.salesmanActive.splice(this.salesmanActive.findIndex((item) => item === 'All'), 1);
                        this.salesman.setValue(this.salesmanActive);
                    } else if (data.findIndex(x => x.id === 'All') > 0) {
                        this.salesmanActive.length = 0;
                        this.salesmanActive = [...this.salesmanActive, 'All'];
                    }
                    break;
                }
        }
    }

    getDataSearch(type: string = 'partner') {
        if ((this.salesmanActive.findIndex(x => x === 'All') === 0) || !this.salesmanActive.length) {
            if (type === 'partner') {
                this.dataSearch.saleman = this.salesmanList.filter(x => x.id !== 'All').map(x => x.username).join(";");
            } else {
                this.dataSearch.saleman = this.salesmanList.filter(x => x.id !== 'All').map(x => x.id).join(";");
            }
        } else {
            if (type === 'partner') {
                this.dataSearch.saleman = this.salesmanList.filter(x => this.salesmanActive.findIndex(item => item === x.id) >= 0).map(x => x.username).join(";");
            } else {
                this.dataSearch.saleman = this.salesmanList.filter(x => this.salesmanActive.findIndex(item => item === x.id) >= 0).map(x => x.id).join(";");
            }
        }
        this.dataSearch.partnerType = this.partnerType;
        this.dataSearch.datetimeCreatedFrom = (!!this.createdDate.value && !!this.createdDate.value.startDate) ? formatDate(this.createdDate.value.startDate, 'yyyy-MM-dd', 'en') : null;
        this.dataSearch.datetimeCreatedTo = (!!this.createdDate.value && !!this.createdDate.value.endDate) ? formatDate(this.createdDate.value.endDate, 'yyyy-MM-dd', 'en') : null;
        this.dataSearch.active = (!!this.status.value && this.status.value !== this.statusList[0].id) ? (this.status.value === this.statusList[1].id ? true : false) : null;
        const userLogged = JSON.parse(localStorage.getItem('id_token_claims_obj'));
        this.dataSearch.author = userLogged.nameEn;
    }

    exportData() {
        this.getDataSearch();
        if (!!this.dataSearch) {
            this._progressRef.start();
            this._exportRepo.exportPartner(this.dataSearch)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: HttpResponse<any>) => {
                        if (res.headers.get(SystemConstants.EFMS_FILE_NAME)!=null) {
                            this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                        } else {
                            this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, 'eFms-partner.xlsx');
                        }
                        this.close();
                    }
                );
        }
    }
    exportAgreementInfo() {
        this.getDataSearch('agreement');
        if (!!this.dataSearch) {
            this._progressRef.start();
            this._exportRepo.exportAgreementInfo(this.dataSearch)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res:HttpResponse<any>) => {
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME))
                    }
                );
        }
    }

    resetSearch() {
        this.salesmanActive.length = 0;
        this.salesmanActive = [...this.salesmanActive, 'All'];
        this.createdDate.setValue(null);
        this.status.setValue(this.statusList[0].id);
    }

    close() {
        this.dataSearch = {};
        this.hide();
    }

}
