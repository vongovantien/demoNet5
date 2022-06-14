import { Component, ViewChild } from '@angular/core';
import { CatChargeToAddOrUpdate } from 'src/app/shared/models/catalogue/catChargeToAddOrUpdate.model';
import { Router } from '@angular/router';
import { FormAddChargeComponent } from '../components/form-add-charge/form-add-charge.component';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize, tap, concatMap } from 'rxjs/operators';
import { AppPage } from 'src/app/app.base';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { VoucherListComponent } from '../components/voucher-list/voucher-list.component';
import { SystemConstants } from 'src/constants/system.const';
import { GenerateSellingChargePopupComponent } from '../components/popup/generate-selling-charge/generate-selling-charge.popup';
import { CatChargeDefaultAccount } from 'src/app/shared/models/catalogue/catChargeDefaultAccount.model';
import { CommonEnum } from '@enums';
import { of } from 'rxjs';
import { RoutingConstants } from '@constants';
import { chargeState } from '../store';

@Component({
    selector: 'add-charge',
    templateUrl: './add-charge.component.html',
    styleUrls: ['./../detail-charge/detail-charge.component.scss']
})
export class AddChargeComponent extends AppPage {

    @ViewChild(FormAddChargeComponent) formAddCharge: FormAddChargeComponent;
    @ViewChild(VoucherListComponent) voucherList: VoucherListComponent;
    @ViewChild(GenerateSellingChargePopupComponent) popupGenerateSelling: GenerateSellingChargePopupComponent;

    resultStateAddNew;

    constructor(
        protected router: Router,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ChargeToAdd: CatChargeToAddOrUpdate = new CatChargeToAddOrUpdate();

    ngOnInit() {
    }

    onsubmitData() {
        this.ChargeToAdd = new CatChargeToAddOrUpdate();
        this.ChargeToAdd.charge.code = this.formAddCharge.code.value;
        this.ChargeToAdd.charge.chargeNameEn = this.formAddCharge.nameEn.value;
        this.ChargeToAdd.charge.chargeNameVn = this.formAddCharge.nameVn.value;
        this.ChargeToAdd.charge.unitId = +this.formAddCharge.unit.value;
        this.ChargeToAdd.charge.unitPrice = +this.formAddCharge.unitPrice.value;
        this.ChargeToAdd.charge.currencyId = this.formAddCharge.currency.value;
        this.ChargeToAdd.charge.vatrate = +this.formAddCharge.vat.value;
        this.ChargeToAdd.charge.debitCharge = this.formAddCharge.debitCharge.value;
        this.ChargeToAdd.charge.chargeGroup = this.formAddCharge.chargeGroup.value;
        this.ChargeToAdd.charge.active = this.formAddCharge.active.value;
        this.ChargeToAdd.charge.productDept = this.formAddCharge.formGroup.controls['productDept'].value;
        this.ChargeToAdd.charge.mode = this.formAddCharge.formGroup.controls['mode'].value;
        this.ChargeToAdd.charge.creditCharge = this.formAddCharge.creditCharge.value;

        let serviceTypeId = '';
        this.ChargeToAdd.charge.type = this.formAddCharge.type.value;
        if (this.formAddCharge.service.value !== null) {
            if (this.formAddCharge.service.value.length > 0) {
                this.formAddCharge.requiredService = false;
                this.formAddCharge.service.value.forEach(element => {
                    serviceTypeId += ";" + element.id;
                });
            } else {
                this.formAddCharge.service.setValue(null);
                this.formAddCharge.requiredService = true;
                return null;
            }
            this.ChargeToAdd.charge.serviceTypeId = serviceTypeId;
            this.ChargeToAdd.charge.id = SystemConstants.EMPTY_GUID;
            this.ChargeToAdd.listChargeDefaultAccount = this.voucherList.ChargeToAdd.listChargeDefaultAccount;
            return this.ChargeToAdd;
        } else {
            return null;
        }
    }

    addCharge() {
        this.formAddCharge.isSubmitted = true;
        this.voucherList.isSubmitted = true;

        if (this.formAddCharge.service.value == null) {
            this.formAddCharge.requiredService = true;
            return;
        } else if (this.formAddCharge.service.value.length === 0) {
            this.formAddCharge.requiredService = true;
            return;
        } else {
            this.formAddCharge.requiredService = false;
        }
        if (this.formAddCharge.checkValidateForm() && this.voucherList.validatateDefaultAcountLine()) {
            this.onsubmitData();
            if (this.formAddCharge.isShowMappingSelling && !this.formAddCharge.debitCharge.value && this.formAddCharge.generateSelling.value === true) {
                this.popupGenerateSelling.chargeCode.setValue(this.formAddCharge.code.value.replace(this.formAddCharge.code.value.substring(0, 1), "S"));
                this.popupGenerateSelling.accountNo.setValue(null);
                this.popupGenerateSelling.accountNoVAT.setValue(null);
                this.popupGenerateSelling.show();
                return;
            }
            this._catalogueRepo.addCharge(this.ChargeToAdd)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this.router.navigate([`${RoutingConstants.CATALOGUE.CHARGE}`]);
                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }

    }

    addSellingCharge(data: any) {
        this.ChargeToAdd = this.onsubmitData();
        if (!!data) {
            this.ChargeToAdd.charge.code = data.chargeCode;
            this.ChargeToAdd.charge.type = 'DEBIT';
            this.ChargeToAdd.listChargeDefaultAccount = [];

            const chargeDefault = new CatChargeDefaultAccount();
            chargeDefault.type = 'Công Nợ';
            chargeDefault.creditAccountNo = data.accountNo;
            chargeDefault.debitVat = data.accountNoVAT;
            !!chargeDefault.creditAccountNo || !!chargeDefault.debitVat ? this.ChargeToAdd.listChargeDefaultAccount.push(chargeDefault) : this.ChargeToAdd.listChargeDefaultAccount = [];

            this._catalogueRepo.addCharge(this.ChargeToAdd)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete()),
                    concatMap((res: CommonInterface.IResult) => {
                        if (res.status) {
                            this.resultStateAddNew = res;
                            this.formAddCharge.debitCharges = this._catalogueRepo.getCharges({ active: true, type: CommonEnum.CHARGE_TYPE.DEBIT });
                            return this._catalogueRepo.getCharges({ active: true, type: CommonEnum.CHARGE_TYPE.DEBIT });
                        }
                        return of({ data: null, message: 'Something getting error. Please check again!', status: false });
                    })
                )
                .subscribe(
                    (listCharge: any) => {
                        if (!!listCharge) {
                            this._toastService.success('Create Selling Charge Success!!', '');
                            this.formAddCharge.debitCharge.setValue(this.resultStateAddNew.data);
                            this.popupGenerateSelling.hide();
                        } else {
                            this._toastService.error(listCharge.message, '');
                        }
                    }
                );

        }

    }
}
