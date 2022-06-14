import { Component, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { CompanyInformationFormAddComponent } from '../components/form-add-company/form-add-company.component';
import { SystemRepo } from 'src/app/shared/repositories';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { finalize, catchError } from 'rxjs/operators';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-add-company-info',
    templateUrl: './add-company-infomation.component.html',
})
export class CompanyInformationAddComponent extends AppPage {

    @ViewChild(CompanyInformationFormAddComponent) formAdd: CompanyInformationFormAddComponent;

    constructor(
        protected _systemRepo: SystemRepo,
        protected _router: Router,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void { }

    cancel() {
        this._router.navigate([`${RoutingConstants.SYSTEM.COMPANY}`]);
    }

    create() {
        this.formAdd.isSubmitted = true;
        if (this.formAdd.formGroup.invalid) {
            return;
        }

        this._progressRef.start();
        const body: ICompanyAdd = {
            companyCode: this.formAdd.code.value,
            companyNameEn: this.formAdd.bunameEn.value,
            companyNameVn: this.formAdd.bunameVn.value,
            companyNameAbbr: this.formAdd.bunameAbbr.value,
            website: this.formAdd.website.value,
            photoUrl: this.formAdd.photoUrl,
            status: this.formAdd.active.value.value,
            photoName: this.formAdd.photoUrl,
        };
        this._systemRepo.addNewCompany(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this._router.navigate([`${RoutingConstants.SYSTEM.COMPANY}/${res.data.id}`]);

                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }
}

interface ICompanyAdd {
    companyCode: string;
    companyNameEn: string;
    companyNameVn: string;
    companyNameAbbr: string;
    website: string;
    photoName: string;
    photoUrl: string;
    status: boolean;
}
