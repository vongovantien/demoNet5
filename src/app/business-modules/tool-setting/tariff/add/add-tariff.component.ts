import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { TariffFormAddComponent } from '../components/form-add-tariff/form-add-tariff.component';
import { TariffAdd, Tariff } from 'src/app/shared/models';
import { SettingRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { Router } from '@angular/router';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-add-tariff',
    templateUrl: './add-tariff.component.html',
})
export class TariffAddComponent extends AppList {

    @ViewChild(TariffFormAddComponent) formAddTariffComponent: TariffFormAddComponent;

    tariff: TariffAdd = new TariffAdd();

    constructor(
        protected _settingRepo: SettingRepo,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        protected _router: Router,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
    }

    checkValidateFormTariff() {
        let valid: boolean = true;

        this.formAddTariffComponent.isSubmitted = true;

        if (this.detectInvalidFormAdd() || this.detectInvalidTariffType()) {
            valid = false;
        }

        if (!this.tariff.setTariffDetails.length) {
            this._toastService.warning('Please add tariff to create new OPS tariff');
            valid = false;
        }

        return valid;
    }

    onSubmitData() {
        const tariffForm: any = this.formAddTariffComponent.formAdd.value.tariff;

        const setTariff: any = {
            cargoType: tariffForm.cargoType.value,
            effectiveDate: formatDate(tariffForm.effectiveDate.startDate, 'yyyy-MM-dd', 'en'),
            expiredDate: formatDate(tariffForm.expiredDate.startDate, 'yyyy-MM-dd', 'en'),
            productService: tariffForm.productService.value,
            serviceMode: tariffForm.serviceMode.value,
            status: tariffForm.status.value,
            tariffType: tariffForm.tariffType.value,
            description: tariffForm.description,
            tariffName: tariffForm.tariffName,

            id: SystemConstants.EMPTY_GUID,
            customerId: this.tariff.setTariff.customerId,
            agentId: this.tariff.setTariff.agentId,
            applyOfficeId: this.tariff.setTariff.officeId,
            supplierId: this.tariff.setTariff.supplierId
        };

        this.tariff.setTariff = Object.assign({}, this.tariff.setTariff, setTariff);
    }

    createTariff() {
        if (!this.checkValidateFormTariff()) {
            return;
        }
        this.onSubmitData();

        this._progressRef.start();

        this.tariff.setTariff.id = SystemConstants.EMPTY_GUID; // * UPDATE ID FOR CREATE TARIFF.

        this.onCreateTariff();

    }

    onCreateTariff() {
        this._settingRepo.addTariff(this.tariff)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.TOOL.TARIFF}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                },
            );
    }

    detectInvalidFormAdd() {
        return (
            !this.formAddTariffComponent.formAdd.value.tariff.tariffName
            || !this.formAddTariffComponent.formAdd.value.tariff.tariffType
            || !this.formAddTariffComponent.formAdd.value.tariff.status
            || !this.formAddTariffComponent.formAdd.value.tariff.effectiveDate
            || !this.formAddTariffComponent.formAdd.value.tariff.expiredDate
            || !this.formAddTariffComponent.formAdd.value.tariff.productService
            || !this.formAddTariffComponent.formAdd.value.tariff.cargoType
            || !this.formAddTariffComponent.formAdd.value.tariff.serviceMode
            || !this.formAddTariffComponent.selectedOffice.value
            || !this.tariff.setTariff.officeId
        );
    }

    detectInvalidTariffType() {
        switch (this.formAddTariffComponent.formAdd.value.tariff.tariffType.value) {
            case 'Customer':
                return !this.tariff.setTariff.customerId;
            case 'Agent':
                return !this.tariff.setTariff.agentId;
            case 'Supplier':
                return !this.tariff.setTariff.supplierId;
            default:
                return false;
        }
    }

    back() {
        this._router.navigate([`${RoutingConstants.TOOL.TARIFF}`]);
    }
}
