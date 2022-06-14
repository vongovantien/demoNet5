import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AppForm } from 'src/app/app.form';
import { IncotermUpdateModel, IncotermModel } from '@models';
import { InfoPopupComponent } from '@common';
import { CommonEnum } from '@enums';
import { CatalogueRepo } from '@repositories';

import { CommercialFormIncotermComponent } from '../components/form-incoterm/form-incoterm.component';
import { CommercialListChargeIncotermComponent } from '../components/list-charge/list-charge-incoterm.component';

import { catchError } from 'rxjs/operators';

import _merge from 'lodash/merge';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'create-incoterm-commercial',
    templateUrl: './create-incoterm-commercial.component.html',
})
export class CommercialCreateIncotermComponent extends AppForm implements OnInit {

    @ViewChild(CommercialFormIncotermComponent) formCreateComponent: CommercialFormIncotermComponent;
    @ViewChild('selling') listChargeSelling: CommercialListChargeIncotermComponent;
    @ViewChild('buying') listChargeBuying: CommercialListChargeIncotermComponent;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;

    activeTab: string = CommonEnum.SurchargeTypeEnum.SELLING_RATE;

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _router: Router
    ) {
        super();
    }

    ngOnInit(): void { }

    onSubmit() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.formCreateComponent.formGroup.valid) {
            this.infoPopup.show();
            return;
        }

        if (!!this.listChargeSelling.incotermCharges.length) {
            this.listChargeSelling.isSubmitted = true;
            if (!this.listChargeSelling.validateListCharge()) {
                this.infoPopup.show();

                this.activeTab = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
                return;
            }

            if (!this.listChargeSelling.validateDuplicate()) {
                this.infoPopup.show();
                this.activeTab = CommonEnum.SurchargeTypeEnum.SELLING_RATE;
                return;
            }
        }

        if (!!this.listChargeBuying.incotermCharges.length) {
            this.listChargeBuying.isSubmitted = true;
            if (!this.listChargeBuying.validateListCharge()) {
                this.infoPopup.show();

                this.activeTab = CommonEnum.SurchargeTypeEnum.BUYING_RATE;
                return;
            }

            if (!this.listChargeBuying.validateDuplicate()) {
                this.infoPopup.show();
                this.activeTab = CommonEnum.SurchargeTypeEnum.BUYING_RATE;
                return;
            }
        }

        const formData: IncotermModel = this.getFormData();

        const incotermUpdateModel: IncotermUpdateModel = new IncotermUpdateModel();
        incotermUpdateModel.incoterm = formData;
        incotermUpdateModel.buyings = this.listChargeBuying.incotermCharges;
        incotermUpdateModel.sellings = this.listChargeSelling.incotermCharges;

        this.saveIncoterm(incotermUpdateModel);
    }

    getFormData() {
        const form: any = this.formCreateComponent.formGroup.value;
        const formData = {
            service: !!form.service && !!form.service.length ? form.service[0].id : null,
        };

        return Object.assign(_merge(form, formData));
    }

    saveIncoterm(model: IncotermUpdateModel) {
        this._catalogueRepo.createIncoterm(model).pipe(
            catchError(this.catchError),
        ).subscribe(
            (res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(res.message);
                    this._router.navigate([`${RoutingConstants.COMMERCIAL.INCOTERM}/${res.data}`]);
                }
            }
        );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.COMMERCIAL.INCOTERM}`]);
    }

}
