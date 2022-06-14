import { Component, ViewChild } from '@angular/core';
import { OfficeFormAddComponent } from '../components/form-add-office/form-add-office.component';
import { AppPage } from 'src/app/app.base';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemRepo } from 'src/app/shared/repositories';
import { finalize, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { RoutingConstants } from '@constants';



@Component({
    selector: 'app-office.addnew',
    templateUrl: './office.addnew.component.html'
})
export class OfficeAddNewComponent extends AppPage {

    @ViewChild(OfficeFormAddComponent) formAdd: OfficeFormAddComponent;

    constructor(private _progressService: NgProgress,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router
    ) {
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit() {
    }

    create() {
        this.formAdd.isSubmited = true;
        if (this.formAdd.formGroup.valid) {
            this._progressRef.start();
            const body: IOfficeAdd = {
                branchNameEn: this.formAdd.branchNameEn.value,
                branchNameVn: this.formAdd.branchNameVn.value,
                buid: this.formAdd.company.value,
                addressVn: this.formAdd.addressVn.value,
                addressEn: this.formAdd.addressEn.value,
                tel: this.formAdd.tel.value,
                fax: this.formAdd.fax.value,
                email: this.formAdd.email.value,
                taxcode: this.formAdd.taxcode.value,
                bankAccountVnd: this.formAdd.bankAccountVND.value,
                bankAccountUsd: this.formAdd.bankAccountUSD.value,
                bankAccountNameVn: this.formAdd.bankAccountName_VN.value,
                bankAccountNameEn: this.formAdd.bankAccountName_EN.value,
                bankAddressLocal: this.formAdd.bankAddress_Local.value,
                bankAddressEn: this.formAdd.bankAddress_En.value,
                code: this.formAdd.code.value,
                swiftCode: this.formAdd.swiftCode.value,
                shortName: this.formAdd.shortName.value,
                active: this.formAdd.active.value.value,
                location: this.formAdd.location.value,
                bankNameEn: this.formAdd.bankName_En.value,
                bankNameLocal: this.formAdd.bankName_Local.value,
                officeType: this.formAdd.officeType.value,
            };
            this._systemRepo.addNewOffice(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this._router.navigate([`${RoutingConstants.SYSTEM.OFFICE}/${res.data.id}`]);

                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }


    }
}
interface IOfficeAdd {
    branchNameVn: string;
    branchNameEn: string;
    bankAccountNameVn: string;
    bankAccountNameEn: string;
    bankAddressEn: string;
    buid: string;
    addressVn: string;
    addressEn: string;
    tel: string;
    fax: string;
    email: string;
    taxcode: string;
    bankAccountVnd: string;
    bankAccountUsd: string;
    bankAddressLocal: string;
    code: string;
    swiftCode: string;
    shortName: string;
    active: boolean;
    location: string;
    bankNameEn: string;
    bankNameLocal: string;
    officeType: string;
}
