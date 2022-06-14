import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CatChargeToAddOrUpdate } from 'src/app/shared/models/catalogue/catChargeToAddOrUpdate.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ChargeConstants } from 'src/constants/charge.const';
import { AddChargeComponent } from '../add-charge/add-charge.component';
import { CatalogueRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';
import { RoutingConstants } from '@constants';
@Component({
    selector: 'detail-charge',
    templateUrl: './detail-charge.component.html',
    styleUrls: ['./detail-charge.component.scss']
})
export class DetailChargeComponent extends AddChargeComponent {

    Charge: CatChargeToAddOrUpdate = null;
    isSubmitted = false;
    id: string = '';
    ngDataType = [
        { id: "CREDIT", text: "CREDIT" },
        { id: "DEBIT", text: "DEBIT" },
        { id: "OBH", text: "OBH" }
    ];
    ngDataTypeChargeDefault: Array<string> = ["Công Nợ", "Giải Chi", "Loại Khác"];

    ngDataService = [
        { text: ChargeConstants.IT_DES, id: ChargeConstants.IT_CODE },
        { text: ChargeConstants.AI_DES, id: ChargeConstants.AI_CODE },
        { text: ChargeConstants.AE_DES, id: ChargeConstants.AE_CODE },
        { text: ChargeConstants.SFE_DES, id: ChargeConstants.SFE_CODE },
        { text: ChargeConstants.SFI_DES, id: ChargeConstants.SFI_CODE },
        { text: ChargeConstants.SLE_DES, id: ChargeConstants.SLE_CODE },
        { text: ChargeConstants.SLI_DES, id: ChargeConstants.SLI_CODE },
        { text: ChargeConstants.SCE_DES, id: ChargeConstants.SCE_CODE },
        { text: ChargeConstants.SCI_DES, id: ChargeConstants.SCI_CODE },
        { text: ChargeConstants.CL_DES, id: ChargeConstants.CL_CODE }
    ];
    timeOut: any;

    constructor(
        private route: ActivatedRoute,
        protected router: Router,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress, ) {
        super(router, _catalogueRepo, _toastService, _progressService);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = params.id;

        });
    }

    ngAfterViewInit() {
        this.timeOut = setTimeout(() => {
            this.getChargeDetail();
        }, 30);
    }

    getChargeDetail() {
        this._catalogueRepo.getChargeById(this.id).subscribe((res: any) => {
            if (!!res) {
                this.Charge = res;
                this.formAddCharge.activeServices = this.formAddCharge.getCurrentActiveService(this.Charge.charge.serviceTypeId);
                this.formAddCharge.updateDataToForm(this.Charge);
                console.log(this.formAddCharge.activeServices);
                
                this.voucherList.ChargeToAdd.listChargeDefaultAccount = this.Charge.listChargeDefaultAccount;
                this.voucherList.isShowUpdate = this.Charge.permission.allowUpdate;
                this.Charge.charge.userCreated = res.charge.userCreated;
                if (!!this.formAddCharge.debitCharge.value) {
                    this.formAddCharge.generateSelling.setValue(false);
                }
            }
        });
    }

    updateCharge() {
        this.formAddCharge.isSubmitted = true;
        this.voucherList.isSubmitted = true;
        if (!this.formAddCharge.checkValidateForm()) {
            return;
        }
        if (this.voucherList.validatateDefaultAcountLine()) {
            const modeltoUpdate = this.onsubmitData();
            if (this.formAddCharge.isShowMappingSelling && !this.formAddCharge.debitCharge.value && this.formAddCharge.generateSelling.value === true) {
                this.popupGenerateSelling.chargeCode.setValue(this.formAddCharge.code.value.replace(this.formAddCharge.code.value.substring(0, 1), "S"));
                this.popupGenerateSelling.accountNo.setValue(null);
                this.popupGenerateSelling.accountNoVAT.setValue(null);
                this.popupGenerateSelling.show();
                return;
            }
            if (modeltoUpdate !== null) {
                modeltoUpdate.charge.id = this.id;
                modeltoUpdate.charge.userCreated = this.Charge.charge.userCreated;
                this._catalogueRepo.updateCharge(modeltoUpdate)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => this._progressRef.complete())
                    )
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message, '');
                                // this.router.navigate([`${RoutingConstants.CATALOGUE.CHARGE}`]);
                            } else {
                                this._toastService.error(res.message, '');
                            }
                        }
                    );
            }
        }
    }

    ngOnDestroy() {
        clearTimeout(this.timeOut);
    }

}
