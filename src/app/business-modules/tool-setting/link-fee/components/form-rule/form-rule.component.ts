import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SettingRepo } from '@repositories';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Charge, Partner, Tariff, User } from '@models';
import { RuleLinkFee } from 'src/app/shared/models/tool-setting/rule-link-fee';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { DataService } from '@services';
import { SystemConstants } from 'src/constants/system.const';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { formatDate } from '@angular/common';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'form-rule',
    templateUrl: './form-rule.component.html',
})
export class FormRuleComponent extends PopupBase implements OnInit {
    @Output() onUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() rule: RuleLinkFee = new RuleLinkFee();

    @ViewChild(ConfirmPopupComponent) confirmCreatePopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent) infoPopupComponent: InfoPopupComponent;

    formGroup: FormGroup;
    ruleName: AbstractControl;
    serviceBuying: AbstractControl;
    serviceSelling: AbstractControl;
    status: AbstractControl;

    selectedChargeBuying: Partial<CommonInterface.IComboGridData> | any = {};
    selectedChargeSelling: Partial<CommonInterface.IComboGridData> | any = {};
    selectedPartnerBuying: Partial<CommonInterface.IComboGridData> | any = {};
    selectedPartnerSelling: Partial<CommonInterface.IComboGridData> | any = {};
    title: string = 'Add New Rule Link';

    services: CommonInterface.IComboGirdConfig | any = {};
    configPartner: CommonInterface.IComboGirdConfig | any = {};
    configChargeBuying: CommonInterface.IComboGirdConfig | any = {};
    configChargeSelling: CommonInterface.IComboGirdConfig | any = {};

    expiredDate: AbstractControl;
    effectiveDate: AbstractControl;

    minDateEffective: any = null;
    minDateExpired: any = null;

    datetimeCreated: string;
    userNameCreated: string;
    userNameModified: string;
    datetimeModified: string;

    isBuying: boolean = true;
    isSelling: boolean = true;

    constructor(
        private _fb: FormBuilder,
        private _toast: ToastrService,
        protected _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        private _settingRepo: SettingRepo,
        private _progressService: NgProgress,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
        this.initForm();
        this.initBasicData();
        this.getService();
        this.getPartner();
        // this.getChargeBuying();
        // this.getChargeSelling();
        console.log(this.rule.expiredDate);

    }

    initForm() {
        this.formGroup = this._fb.group({
            ruleName: [null, Validators.compose([
                Validators.required
            ])],
            serviceBuying: [null, Validators.compose([
                Validators.required
            ])],
            serviceSelling: [null, Validators.compose([
                Validators.required
            ])],
            effectiveDate: [null, Validators.compose([
                Validators.required
            ])],
            expiredDate: [null],
            status: [true]
        });
        this.serviceBuying = this.formGroup.controls['serviceBuying'];
        this.serviceSelling = this.formGroup.controls['serviceSelling'];
        this.ruleName = this.formGroup.controls['ruleName'];
        this.expiredDate = this.formGroup.controls['expiredDate'];
        this.effectiveDate = this.formGroup.controls['effectiveDate'];
        this.status = this.formGroup.controls['status'];
        this.formGroup.get("effectiveDate").valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                map((data: any) => data.startDate)

            )
            .subscribe((value: any) => {
                this.minDateExpired = this.createMoment(value); // * Update MinDate -> ExpiredDate.
            });

    }

    initBasicData() {
        this.configPartner = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'taxCode', label: 'Partner Code' },
                { field: 'shortName', label: 'Abbr Name' },
                { field: 'partnerNameEn', label: 'Name EN' },

            ]
        }, { selectedDisplayFields: ['shortName'], });

        this.configChargeBuying = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unit', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });

        this.configChargeSelling = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'chargeNameEn', label: 'Name' },
                { field: 'unitPrice', label: 'Unit Price' },
                { field: 'unit', label: 'Unit' },
                { field: 'code', label: 'Code' },
            ]
        }, { selectedDisplayFields: ['chargeNameEn'], });
    }

    getService() {
        this.services = [
            { text: 'Custom Logistic', id: 'CL' },
            { text: 'Air Export', id: 'AE' },
            { text: 'Air Import', id: 'AI' },
            { text: 'Sea Consol Export', id: 'SCE' },
            { text: 'Sea Consol Import', id: 'SCI' },
            { text: 'Sea FCL Export', id: 'SFE' },
            { text: 'Sea FCL Import', id: 'SFI' },
            { text: 'Sea LCL Export', id: 'SLE' },
            { text: 'Sea LCL Import', id: 'SLI' },
            { text: 'Inland Trucking', id: 'IT' },
        ];
    }


    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.configPartner.dataSource = this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER) || [];
        } else {
            this._catalogueRepo.getListPartner(null, null, { active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataPartner: any = []) => {
                        this.configPartner.dataSource = dataPartner || [];
                        this._dataService.setDataService(SystemConstants.CSTORAGE.PARTNER, dataPartner || []);
                    },
                );
        }
    }
    getChargeBuying() {

        this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceBuying.value?.id, type: CommonEnum.CHARGE_TYPE.CREDIT })
            .pipe(catchError(this.catchError))
            .subscribe(
                (dataCharge: any = []) => {
                    this.configChargeBuying.dataSource = dataCharge;
                    this._dataService.setDataService('RULE_LINK_BUY', dataCharge || []);
                },
            );

    }

    getChargeSelling() {

        this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceSelling.value?.id, type: CommonEnum.CHARGE_TYPE.DEBIT })
            .pipe(catchError(this.catchError))
            .subscribe(
                (dataCharge: any = []) => {
                    this.configChargeSelling.dataSource = dataCharge;
                    this._dataService.setDataService('RULE_LINK_SELL', dataCharge);
                },
            );

    }

    enableSelling() {
        this.isSelling = false;
        this.selectedChargeSelling = {};
        this.resetChargeSelling();
        this.getChargeSelling();
    }
    enableBuying() {
        this.isBuying = false;
        this.selectedChargeBuying = {};
        this.resetChargeBuying();
        this.getChargeBuying();
    }
    onSelectDataFormInfo(data: Charge | Partner | any, key: string | any) {
        switch (key) {
            case 'chargeBuying':
                this.selectedChargeBuying = { field: 'id', value: data.id, data: data };
                this.rule.chargeBuying = data.id;
                break;
            case 'chargeSelling':
                this.selectedChargeSelling = { field: 'id', value: data.id, data: data };
                this.rule.chargeSelling = data.id;
                break;
            case 'partnerBuying':
                this.selectedPartnerBuying = { field: 'shortName', value: data.shortName, data: data };
                this.rule.partnerBuying = data.id;
                break;
            case 'partnerSelling':
                this.selectedPartnerSelling = { field: 'shortName', value: data.shortName, data: data };
                this.rule.partnerSelling = data.id;
                break;
            default:
                break;
        }
        console.log(this.selectedPartnerSelling);
    }

    resetPartnerSelling() {
        this.rule.partnerSelling = null;
    }
    resetPartnerBuying() {
        this.rule.partnerBuying = null;
        this.selectedPartnerBuying.value = null;
    }
    resetChargeSelling() {
        this.rule.chargeSelling = null;
        this.selectedChargeSelling.value = null;
    }
    resetChargeBuying() {
        this.rule.chargeBuying = null;
        this.selectedChargeBuying.value = null;
    }

    showInfoPopUp() {
        this.infoPopupComponent.show();
        this.confirmCreatePopup.hide()
    }

    saveRule() {
        this._progressRef.start();
        this.isSubmitted = true;
        const valueForm = this.formGroup.getRawValue();
        const rule: RuleLinkFee = new RuleLinkFee(valueForm);
        if (!this.selectedChargeBuying.value || !this.selectedChargeSelling.value || !this.selectedPartnerBuying.value || !this.effectiveDate.value.startDate) {
            this.showInfoPopUp()
            return;
        }
        if (!this.expiredDate.value?.startDate || !this.expiredDate) {
            rule.expiredDate = null
        } else {
            rule.expiredDate = formatDate(this.expiredDate.value.startDate, 'yyyy-MM-dd', 'en')
        }
        if (this.formGroup.invalid) {
            this.showInfoPopUp()
            return;
        }
        if (!this.isShowUpdate) {
            rule.id = '';
            rule.effectiveDate = formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en')
            rule.partnerBuying = this.rule.partnerBuying,
                rule.partnerSelling = this.rule.partnerSelling?.length > 0 ? this.rule.partnerSelling : 'All',
                rule.chargeBuying = this.rule.chargeBuying,
                rule.chargeSelling = this.rule.chargeSelling,
                rule.serviceBuying = rule.serviceBuying.id,
                rule.serviceSelling = rule.serviceSelling.id,
                this._settingRepo.addRule(rule)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toast.success(res.message);
                                this.isSubmitted = false;
                                this.onUpdate.emit(true);
                                this.hide();
                                this._progressRef.complete();
                                return;
                            }
                            this._toast.error(res.message);
                            this._progressRef.complete();
                        });
            this._progressRef.complete();
        } else {
            rule.id = this.rule.id,
                rule.effectiveDate = this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                rule.partnerBuying = this.rule.partnerBuying,
                rule.partnerSelling = this.rule.partnerSelling,
                rule.chargeBuying = this.rule.chargeBuying,
                rule.chargeSelling = this.rule.chargeSelling,
                rule.serviceBuying = rule.serviceBuying.id,
                rule.serviceSelling = rule.serviceSelling.id,
                this._settingRepo.updateRule(rule).subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toast.success(res.message);
                            this.isSubmitted = false;
                            this.onUpdate.emit(true);
                            this.hide();
                            this._progressRef.complete();
                            return;
                        }
                        this._toast.error(res.message);
                        this._progressRef.complete();
                    });
            this._progressRef.complete();
        }

    }

    resetExpiredDate() {
        this.expiredDate.setValue(null);
    }

}

