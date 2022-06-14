import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TariffAddComponent } from '../add/add-tariff.component';
import { SettingRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { switchMap, tap, catchError, finalize, map } from 'rxjs/operators';
import { TariffAdd } from 'src/app/shared/models';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { SystemConstants } from 'src/constants/system.const';
import { combineLatest } from 'rxjs';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-detail-tariff',
    templateUrl: './detail-tariff.component.html',
})
export class TariffDetailComponent extends TariffAddComponent {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    tariffId: string = '';
    tariff: TariffAdd;
    ACTION: CommonType.ACTION_FORM = "UPDATE";

    constructor(
        protected _settingRepo: SettingRepo,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _cd: ChangeDetectorRef,
        protected _router: Router
    ) {
        super(_settingRepo, _progressService, _toastService, _router);
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this._progressRef.start();
        combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            tap((param: Params) => {
                this.tariffId = param.id;
                if (param.action) {
                    this.ACTION = (param.action).toUpperCase() || "UPDATE";
                    this._cd.detectChanges();
                }
            }),
            switchMap(
                () => this._settingRepo.getDetailTariff(this.tariffId)
                    .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            ),
        )
            .subscribe((res: CommonInterface.IResult) => {
                if (res.message) {
                    this.getTariffDetail(res.data);
                }
            });
    }

    getTariffDetail(res: any) {
        this.tariff = new TariffAdd(res);
        const objectTariffForm = {
            tariffName: this.tariff.setTariff.tariffName,
            productService: (this.formAddTariffComponent.productSerices || [].filter(i => i.value === this.tariff.setTariff.productService))[0],
            tariffType: this.formAddTariffComponent.tariffTypes.filter(type => type.value === this.tariff.setTariff.tariffType)[0],
            status: this.formAddTariffComponent.status.filter(i => i.value === this.tariff.setTariff.status)[0],
            effectiveDate: { startDate: new Date(this.tariff.setTariff.effectiveDate), endDate: new Date(this.tariff.setTariff.effectiveDate) },
            expiredDate: { startDate: new Date(this.tariff.setTariff.expiredDate), endDate: new Date(this.tariff.setTariff.expiredDate) },
            cargoType: this.formAddTariffComponent.cargoTypes.filter(type => type.value === this.tariff.setTariff.cargoType)[0],
            serviceMode: this.formAddTariffComponent.serviceModes.filter(mode => mode.value === this.tariff.setTariff.serviceMode)[0],
            description: this.tariff.setTariff.description,
        };

        // * Update Form Group.
        this.formAddTariffComponent.formAdd.controls['tariff'].setValue(objectTariffForm);
        this.formAddTariffComponent.minDateExpired = this.formAddTariffComponent.createMoment(this.tariff.setTariff.effectiveDate);

        // * Update comboGrid.
        this.formAddTariffComponent.selectedOffice = <CommonInterface.IComboGridData>{ field: 'id', value: this.tariff.setTariff.applyOfficeId };

        switch (this.tariff.setTariff.tariffType) {
            case 'Customer':
                this.formAddTariffComponent.selectedCustomer = <CommonInterface.IComboGridData>{ field: 'id', value: this.tariff.setTariff.customerId };

                break;
            case 'Supplier':
                this.formAddTariffComponent.selectedSupplier = <CommonInterface.IComboGridData>{ field: 'id', value: this.tariff.setTariff.supplierId };

                break;
            case 'Agent':
                this.formAddTariffComponent.selectedAgent = <CommonInterface.IComboGridData>{ field: 'id', value: this.tariff.setTariff.agentId };
                break;
            default:

                break;
        }

        this.formAddTariffComponent.onChangeTariffType({ value: this.tariff.setTariff.tariffType, displayName: '' });
    }

    updateTafiff() {
        if (!this.checkValidateFormTariff()) {
            return;
        }
        this.onSubmitData();

        this._progressRef.start();
        if (this.ACTION === "COPY") {
            this.updateIdTariff(SystemConstants.EMPTY_GUID);
            this.onCreateTariff();
        } else {
            this.updateIdTariff(this.tariffId);
            this._settingRepo.updateTariff(this.tariff)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);

                            // * Get detail
                            this._settingRepo.getDetailTariff(this.tariffId)
                                .subscribe(
                                    (result: CommonInterface.IResult) => {
                                        if (result.message) {
                                            this.getTariffDetail(result.data);
                                        }
                                    }
                                );
                        } else {
                            this._toastService.error(res.message);
                        }
                    },
                );
        }

    }

    deleteTariff() {
        if (this.tariff.setTariff.status) {
            return;
        } else { this.confirmDeletePopup.show(); }
    }

    onDeleteTariff() {
        this._progressRef.start();
        this._settingRepo.deleteTariff(this.tariffId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeletePopup.hide();
                }))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this._router.navigate([`${RoutingConstants.TOOL.TARIFF}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    updateIdTariff(id: string) {
        this.tariff.setTariff.id = id;
        for (const item of this.tariff.setTariffDetails) {
            item.tariffId = id;
        }
    }

}
