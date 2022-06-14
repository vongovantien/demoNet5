import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';

import { IFormAddCompany, CompanyInformationFormAddComponent } from '../components/form-add-company/form-add-company.component';
import { Company, Office } from '@models';
import { ToastrService } from 'ngx-toastr';
import { AppList } from 'src/app/app.list';
import { Store } from '@ngrx/store';

import { IShareSystemState, SystemLoadUserLevelAction } from '../../store';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

import { forkJoin } from 'rxjs';
import isUUID from 'validator/lib/isUUID';
import { SortService } from '@services';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-detail-company-info',
    templateUrl: './detail-company-information.component.html',
    styleUrls: ['./detail-company-information.component.scss']
})
export class CompanyInformationDetailComponent extends AppList {
    @ViewChild(CompanyInformationFormAddComponent) formAddCompany: CompanyInformationFormAddComponent;
    formData: IFormAddCompany = {
        code: 'sss',
        bunameEn: '',
        bunameVn: '',
        bunameAbbr: '',
        website: '',
        active: true,
        kbExchangeRate: null,
    };
    
    companyId: string = '';
    company: Company;

    offices: Office[] = [];

    headersOffice: CommonInterface.IHeaderTable[];

    constructor(
        private _activedRouter: ActivatedRoute,
        private _router: Router,
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _store: Store<IShareSystemState>
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortLocal;

        this.headersOffice = [
            { title: 'Office Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'branchNameEn', sortable: true },
            { title: 'Name Local', field: 'branchNameVn', sortable: true },
            { title: 'Name Abbr', field: 'shortName', sortable: true },
            { title: 'Address En', field: 'addressEn', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
        ];
    }

    ngOnInit(): void {

        this._activedRouter.params
            .pipe(
                tap(
                    (param: Params) => {
                        if (param.id && isUUID(param.id)) {
                            this.companyId = param.id;
                            this._store.dispatch(new SystemLoadUserLevelAction({ companyId: this.companyId, type: 'company' }));
                        } else {
                            // TODO handle error.
                        }
                    }
                ),
                switchMap(
                    (param: Params) => {
                        return forkJoin([
                            this._systemRepo.getDetailCompany(this.companyId),
                            this._systemRepo.getOfficeByCompany(this.companyId),
                        ]).pipe(
                            tap((res: any[]) => { this.getDataDetail(res[0]); })
                        );
                    }
                )).subscribe(
                    (res: any) => {
                        this.offices = (res[1] || []).map(o => new Office(o));
                    }
                );
    }

    getDataDetail(company: Company) {
        this.company = new Company(company);
        this.formData.code = company.code;
        this.formData.bunameAbbr = company.bunameAbbr;
        this.formData.bunameEn = company.bunameEn;
        this.formData.bunameVn = company.bunameVn;
        this.formData.website = company.website;
        this.formData.active = company.active;
        this.formData.kbExchangeRate = company.kbExchangeRate;

        this.formAddCompany.photoUrl = this.company.logoPath;


        this.formAddCompany.removeValidators(this.formAddCompany.code); // * Remove Validate
        this.formAddCompany.isDisabled = true; // * Disabled code input

        this.formAddCompany.formGroup.patchValue(this.formData);
        this.formAddCompany.active.setValue(this.formAddCompany.types.filter(i => i.value === company.active)[0]);
        
    }

    getDetailCompany() {
        this._systemRepo.getDetailCompany(this.companyId)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res) => {
                    this.getDataDetail(res);
                }
            );
    }

    saveInformation() {
        this.formAddCompany.isSubmitted = true;
        if (this.formAddCompany.formGroup.invalid) {
            return;
        } else {
            const modelUpdeteCompany: any = {
                id: this.companyId,
                companyCode: this.formAddCompany.code.value,
                companyNameEn: this.formAddCompany.bunameEn.value,
                companyNameVn: this.formAddCompany.bunameVn.value,
                companyNameAbbr: this.formAddCompany.bunameAbbr.value,
                website: this.formAddCompany.website.value,
                photoName: this.formAddCompany.code.value,
                photoUrl: this.formAddCompany.photoUrl,
                status: this.formAddCompany.active.value.value,
                kbExchangeRate: this.formAddCompany.kbExchangeRate.value
            };

            this._progressRef.start();
            this._systemRepo.updateCompany(this.companyId, modelUpdeteCompany)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, 'Save Successfully');
                            this.getDetailCompany();
                        } else {
                            this._toastService.warning(res.message);
                        }
                    }
                );
        }
    }

    cancel() {
        this._router.navigate([`${RoutingConstants.SYSTEM.COMPANY}`]);
    }

    gotoDetailOffice(office: Office) {
        this._router.navigate([`${RoutingConstants.SYSTEM.OFFICE}/${office.id}`]);
    }

    sortLocal(sort: string): void {
        this.offices = this._sortService.sort(this.offices, sort, this.order);
    }
}




