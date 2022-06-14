import { Component, EventEmitter, Output, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo, AccountingRepo, OperationRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { takeUntil, distinctUntilChanged, catchError, map, debounceTime } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { CsShipmentSurcharge, CustomDeclaration, Surcharge } from 'src/app/shared/models';
import { SystemConstants } from 'src/constants/system.const';
import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';

@Component({
    selector: 'form-charge-popup',
    templateUrl: './form-charge.popup.html',
})

export class SettlementFormChargePopupComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdateChange: EventEmitter<any> = new EventEmitter<any>();

    @Input() state: string = 'create';

    isShow: boolean = false;
    // isOPS: boolean = false;

    term$ = new BehaviorSubject<string>('');
    charges: any[] = [];
    selectedCharge: any = null;

    configAmountCurrency: Partial<CurrencyMaskConfig> = {
        align: "left",
        precision: 2,
    };

    configShipment: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [
            { field: 'jobId', label: 'Job ID' },
            { field: 'mbl', label: 'MBL' },
            { field: 'hbl', label: 'HBL' },
        ],
        dataSource: [],
        selectedDisplayFields: ['jobId', `mbl`, 'hbl'],
    };
    selectedShipment: Partial<CommonInterface.IComboGridData> = {};
    selectedShipmentData: OperationInteface.IShipment;
    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [
            { field: 'shortName', label: 'Name' },
            { field: 'partnerNameEn', label: 'Customer Name' },
        ],
        dataSource: [],
        selectedDisplayFields: ['shortName'],
    };

    selectedPayer: Partial<CommonInterface.IComboGridData> = {};
    selectedPayerData: any;
    selectedOBHPartner: Partial<CommonInterface.IComboGridData> = {};
    selectedOBHData: any;

    units: any[] = [];
    selectedUnit: any = null;

    types: CommonInterface.ICommonTitleValue[];

    customDeclarations: CustomDeclaration[];
    initCD: CustomDeclaration[] = []; // * for filter cd note.

    form: FormGroup;
    chargeName: AbstractControl;
    qty: AbstractControl;
    price: AbstractControl;
    vat: AbstractControl;
    amount: AbstractControl;
    invoiceNo: AbstractControl;
    invoiceDate: AbstractControl;
    contNo: AbstractControl;
    note: AbstractControl;
    currency: AbstractControl;
    customNo: AbstractControl;
    type: AbstractControl;
    unit: AbstractControl;
    serieNo: AbstractControl;
    isOBH: AbstractControl;

    isDisabledOBH: boolean = true;
    isDisabledOBHPartner: boolean = true;
    isDupplicate: boolean = false;
    isContinue: boolean = false;

    action: string = 'create';
    selectedSurcharge: any;

    settlementCode: string = '';

    isFromshipment: boolean = false;
    isSynced: boolean = false // * Phí OBH đã sync đầu thu

    dataShipmentFromExistingCharge: Partial<{ jobId: string, mbl: string, hbl: string }> = {};

    constructor(
        private _documentRepo: DocumentationRepo,
        private _accoutingRepo: AccountingRepo,
        private _catalogueRepo: CatalogueRepo,
        private _operationRepo: OperationRepo,
        private _fb: FormBuilder,
        private _toastService: ToastrService,
    ) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.getShipment();
        this.getPartner();
        this.getUnit();
        this.getType();
        this.getCustomNo();

        // * Search autocomplete surcharge.
        this.term$.pipe(
            distinctUntilChanged(),
            this.autocomplete(500, ((term: any) => {
                return this._catalogueRepo.getSettlePaymentCharges(this.chargeName.value || "");
            }))
        ).subscribe(
            (res: any) => {
                this.charges = res || [];
            },
            (error: any) => { },
            () => { }
        );

        // * Detect close autocomplete when user click outside chargename control or select charge.
        this._isShowAutoComplete
            .pipe(
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe((isShow: boolean) => {
                this.isShow = isShow;
                this.chargeName.setValue(!!this.selectedCharge ? this.selectedCharge.chargeNameVn : null, { emitEvent: false });
            });
    }

    initForm() {
        this.form = this._fb.group({
            chargeName: ['', Validators.compose([
                Validators.required
            ])],
            qty: [, Validators.compose([
                Validators.required
            ])],
            price: [, Validators.compose([
                Validators.required
            ])],
            vat: [0],
            amount: [],
            invoiceNo: [],
            invoiceDate: [null],
            contNo: [],
            note: [],
            currency: [],
            customNo: [],
            type: [],
            unit: [null, Validators.compose([
                Validators.required
            ])],
            serieNo: [],
            isOBH: []
        });
        this.chargeName = this.form.controls['chargeName'];
        this.qty = this.form.controls['qty'];
        this.price = this.form.controls['price'];
        this.vat = this.form.controls['vat'];
        this.amount = this.form.controls['amount'];
        this.invoiceNo = this.form.controls['invoiceNo'];
        this.invoiceDate = this.form.controls['invoiceDate'];
        this.contNo = this.form.controls['contNo'];
        this.note = this.form.controls['note'];
        this.currency = this.form.controls['currency'];
        this.customNo = this.form.controls['customNo'];
        this.type = this.form.controls['type'];
        this.unit = this.form.controls['unit'];
        this.serieNo = this.form.controls['serieNo'];
        this.isOBH = this.form.controls['isOBH'];

        this.chargeName.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged(),
        ).subscribe(
            (keyword: string) => {
                this.term$.next(keyword);
            }
        );
    }

    initFormUpdate(data: any) {
        this.selectedSurcharge = data;
        this.form.setValue({
            customNo: !!data.clearanceNo ? (this.initCD.filter((item: CustomDeclaration) => item.clearanceNo === data.clearanceNo).length ? this.initCD.filter((item: CustomDeclaration) => item.clearanceNo === data.clearanceNo)[0] : null) : null,
            chargeName: data.chargeName || '',
            qty: data.quantity,
            price: data.unitPrice,
            vat: data.vatrate || 0,
            amount: data.total,
            invoiceNo: data.invoiceNo,
            contNo: data.contNo,
            note: data.notes,
            currency: data.currencyId || 'VND',
            type: this.types.filter(type => type.value === (data.typeOfFee || 'Other'))[0],
            unit: this.units.filter(unit => unit.id === data.unitId)[0],
            serieNo: data.seriesNo,
            invoiceDate: !!data.invoiceDate ? { startDate: new Date(data.invoiceDate), endDate: new Date(data.invoiceDate) } : null,
            isOBH: false
        });

        // * UPDATE CHARGE IN AUTOCOMPLETE
        this.selectedCharge = {};
        this.selectedCharge.id = data.chargeId || '';
        this.selectedCharge.chargeNameVn = data.chargeName || '';
        this.selectedCharge.code = data.chargeCode;
        this.selectedCharge.type = data.type === 'OBH' ? 'OBH' : 'CREDIT';

        if (this.selectedCharge.type !== 'OBH') {
            this.resetOBHPartner();

            // * DISABLED CHECKBOX OBH, OBH PARTNER.
            this.isOBH.disable();
            this.isOBH.setValue(false);

            this.isDisabledOBH = true;
            this.isDisabledOBHPartner = true;

            this.selectedPayer = { field: 'id', value: data.paymentObjectId };
            this.selectedPayerData = this.configPartner.dataSource.filter(i => i.id === data.paymentObjectId)[0];

        } else {

            this.isOBH.enable();
            this.isOBH.setValue(true);

            this.isDisabledOBH = false;
            this.isDisabledOBHPartner = false;

            this.selectedOBHPartner = { field: 'id', value: data.paymentObjectId };
            this.selectedPayer = { field: 'id', value: data.payerId };

            this.selectedOBHData = this.configPartner.dataSource.filter(i => i.id === data.paymentObjectId)[0];
            this.selectedPayerData = this.configPartner.dataSource.filter(i => i.id === data.payerId)[0];

        }
        this.selectedShipmentData = this.configShipment.dataSource.filter((i: OperationInteface.IShipment) => i.hblid === data.hblid)[0];
        this.selectedShipment = { field: 'jobId', value: data.jobId };

        if (!!this.selectedShipmentData) {
            this.customDeclarations = this.filterCDByShipment(this.selectedShipmentData);
            if (this.customDeclarations.length === 1) {
                this.customNo.setValue(this.customDeclarations[0]);
            }
        } else {
            // * Nếu không map được shipment thì hiển thị hardValue;
            this.selectedShipment.hardValue = `${data.jobId} - ${data.mbl} - ${data.hbl}`;

            // * Lưu giá trị để update.
            this.dataShipmentFromExistingCharge.jobId = data.jobId;
            this.dataShipmentFromExistingCharge.mbl = data.mbl;
            this.dataShipmentFromExistingCharge.hbl = data.hbl;
        }
    }

    filterCDByShipment(shipment: OperationInteface.IShipment): CustomDeclaration[] {
        return this.initCD.filter((item: CustomDeclaration) => {
            return (item.jobNo === shipment.jobId);
        });
    }

    getCustomNo() {
        this._operationRepo.getListCustomNoAsignPIC()
            .pipe(
                catchError(this.catchError),
                map((response: any[]) => response.map((item: CustomDeclaration) => new CustomDeclaration(item))),
            )
            .subscribe(
                (res: any) => {
                    this.initCD = res || [];
                },
            );
    }

    selectCharge(charge: any) {
        this._isShowAutoComplete.next(false);
        this.chargeName.setValue(charge.chargeNameVn, { emitEvent: false });
        this.selectedCharge = charge;

        if (this.selectedCharge.type !== 'OBH') {
            this.resetOBHPartner();

            // * disabled checkbox obh, OBH Partner.
            this.isOBH.disable();
            this.isDisabledOBH = true;
            this.isDisabledOBHPartner = true;

        } else {
            this.isOBH.enable();
            this.isOBH.setValue(false);
            this.isDisabledOBH = false;
            this.isDisabledOBHPartner = false;

        }
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'shipment':
                this.selectedShipment = { field: 'jobId', value: data.hbl };
                this.selectedShipmentData = data;

                // get CD with shipmentData
                this.getCustomNoByJob(this.selectedShipmentData.jobId);

                // if OBH checkbox
                if (this.isOBH.value) {
                    const partners: any[] = this.configPartner.dataSource || [];
                    const partner: any = partners.filter((item: any) => item.id.trim() === data.customerId.trim());

                    this.selectedOBHData = partner[0];
                    this.selectedOBHPartner = { field: 'id', value: partner[0].id };
                    this.isDisabledOBH = true;
                }
                break;
            case 'payer':
                this.selectedPayer = { field: data.partnerNameEn, value: data.id };
                this.selectedPayerData = data;
                break;
            case 'obh':
                this.selectedOBHPartner = { field: data.partnerNameEn, value: data.id };
                this.selectedOBHData = data;
                break;
            default:
                break;
        }
    }

    getShipment() {
        this._documentRepo.getShipmentAssginPIC() // ! getShipmentNotLocked deprecated
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any[]) => {
                    this.configShipment.dataSource = res;
                }
            );
    }

    getPartner() {
        const customersFromService = this._catalogueRepo.getCurrentCustomerSource();
        if (!!customersFromService.data.length) {
            this.getPartnerData(customersFromService.data)
            return;
        }
        this._catalogueRepo.getListPartner(null, null, { active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    this.getPartnerData(data);
                    this._catalogueRepo.customersSource$.next({ data })
                },
            );
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
    }

    getUnit() {
        this._catalogueRepo.getUnit({ active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: []) => {
                    this.units = res;
                },
            );
    }

    getType() {
        this.types = [
            { title: 'Norm', value: 'Norm' },
            { title: 'Invoice', value: 'Invoice' },
            { title: 'Other', value: 'Other' },
        ];

        this.type.setValue(this.types[2]);
    }

    getCustomNoByJob(jobNo: string) {
        this._operationRepo.getCustomDeclaration(jobNo)
            .pipe(
                catchError(this.catchError),
                map((response: any[]) => (response || []).map((item: CustomDeclaration) => new CustomDeclaration(item))),
            )
            .subscribe(
                (res: any) => {
                    this.customDeclarations = this.initCD = res || [];
                },
            );
    }

    submit() {
        const body = new Surcharge({
            id: !!this.selectedSurcharge ? this.selectedSurcharge.id : '00000000-0000-0000-0000-000000000000',
            hblid: !!this.selectedShipmentData ? this.selectedShipmentData.hblid : '00000000-0000-0000-0000-000000000000',
            type: this.selectedCharge.type === 'CREDIT' ? 'BUY' : 'OBH',
            chargeId: this.selectedCharge.id || '',
            chargeName: this.selectedCharge.chargeNameVn || '',
            chargeCode: this.selectedCharge.code,
            quantity: this.form.value.qty,
            unitId: this.form.value.unit.id,
            unitName: this.form.value.unit.unitNameEn,
            unitPrice: this.form.value.price,
            currencyId: this.form.value.currency,
            vatrate: this.form.value.vat,
            total: this.form.value.amount,
            notes: this.form.value.note,
            invoiceNo: this.form.value.invoiceNo,
            invoiceDate: !!this.form.value.invoiceDate && !!this.form.value.invoiceDate.startDate ? formatDate(this.form.value.invoiceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            seriesNo: this.form.value.serieNo,
            typeOfFee: this.form.value.type.value,
            isFromShipment: this.isFromshipment,
            contNo: this.form.value.contNo,
            clearanceNo: !!this.form.value.customNo ? this.form.value.customNo.clearanceNo : null,
            jobId: !!this.selectedShipmentData ? this.selectedShipmentData.jobId : (!!this.dataShipmentFromExistingCharge.jobId ? this.dataShipmentFromExistingCharge.jobId : null),
            hbl: !!this.selectedShipmentData ? this.selectedShipmentData.hbl : (!!this.dataShipmentFromExistingCharge.hbl ? this.dataShipmentFromExistingCharge.hbl : null),
            mbl: !!this.selectedShipmentData ? this.selectedShipmentData.mbl : (!!this.dataShipmentFromExistingCharge.mbl ? this.dataShipmentFromExistingCharge.mbl : null),
            settlementCode: this.settlementCode,
            isLocked: this.isLocked,
            hasNotSynce: this.selectedSurcharge.hasNotSynce,
            hadIssued: this.selectedSurcharge.hadIssued,
            payeeIssued: this.selectedSurcharge.payeeIssued,
            obhPartnerIssued: this.selectedSurcharge.obhPartnerIssued
        });

        if (!!this.selectedCharge && this.selectedCharge.type === 'CREDIT') {
            const dataChargeCredit = {
                objectBePaid: 'OTHER',
                paymentObjectId: this.selectedPayer.value,
                payerId: null,
                payer: this.selectedPayerData.shortName,
                obhPartnerName: ''
            };
            Object.assign(body, dataChargeCredit);
        }
        if (this.selectedCharge.type === 'OBH') {
            const dataChargeOBH = {
                payerId: this.selectedPayer?.value,
                paymentObjectId: this.selectedOBHPartner?.value,
                objectBePaid: null,
                payer: this.selectedPayerData?.shortName,
                obhPartnerName: this.selectedOBHData?.shortName
            };
            Object.assign(body, dataChargeOBH);
        }
        // if(this.selectedCharge.type==='OBH' && body.jobId.includes('LOG')){
        //     if(!this.utility.isWhiteSpace(body.invoiceNo )&& this.utility.isWhiteSpace(body.seriesNo)){
        //         this._toastService.warning("Series No Must be fill in");
        //         return;
        //     }
        //     if(this.utility.isWhiteSpace(body.invoiceNo) && !this.utility.isWhiteSpace(body.seriesNo)){
        //         this._toastService.warning("Invoice No Must be fill in");
        //         return;
        //     }

        // }

        // TODO EMIT (UPDATE, COPY, CREATE) TO LIST SURCHARGE.

        if (this.state === 'update') {
            if (this.action === 'copy') {
                if (this.detectDuplicate(this.selectedSurcharge, body)) {
                    this.isDupplicate = true;
                    this._toastService.warning('Charge has already existed!', 'Warning');
                } else {
                    this.isDupplicate = false;
                    this.checkValidateSurcharge(body);
                }
            } else { // ? else => update normaly.
                this.checkValidateSurcharge(body);
            }
            // ? else => create normaly.
        } else {
            this.checkValidateSurcharge(body);
        }
    }

    updateToContinue() {
        this.isContinue = true;
        this.submit();

        if (this.state !== 'update') {
            setTimeout(() => {
                this.show();
            }, 500);
        }
    }

    saveCharge() {
        this.isContinue = false;
        this.submit();
    }

    calculateTotalAmount() {
        let total = 0;
        if (this.form.value.vat >= 0) {
            total = this.qty.value * this.price.value * (1 + (this.vat.value / 100));
        } else {
            total = this.qty.value * this.price.value + Math.abs(this.vat.value);
        }
        this.amount.setValue(Number(total.toFixed(2)));
    }

    onChangeOBHPartnerCheckBox() {
        if (this.isOBH.value) {
            if (this.selectedCharge.type === 'OBH') {
                const partners: any[] = this.configPartner.dataSource || [];
                const partner: any = partners.filter((item: any) => item.id.trim() === this.selectedShipmentData.customerId.trim());

                this.selectedOBHData = partner[0];
                this.selectedOBHPartner = { field: 'id', value: partner[0].id };
                this.isDisabledOBHPartner = true;
            }
        } else {
            if (this.selectedCharge.type === 'OBH') {
                this.selectedOBHData = null;
                this.selectedOBHPartner = {};
                this.isDisabledOBHPartner = null;
            }
        }
    }

    resetOBHPartner() {
        this.selectedOBHData = null;
        this.selectedOBHPartner = {};
    }

    resetForm() {
        // this.form.reset();
        Object.keys(this.form.controls).forEach((name) => {
            if (name === 'currency') {
                return;
            }
            this.resetFormControl(this.form.controls[name]);
        });
        this.selectedCharge = {};
        this.selectedShipment = {};
        this.selectedOBHPartner = {};
        this.selectedPayer = {};

        this.isDisabledOBH = true;
        this.isDisabledOBHPartner = true;
        this.customNo.setValue(null);
        this.type.setValue(this.types[2]);
    }

    resetFormToContinue() {
        this.selectedCharge = {};
        this.selectedOBHPartner = {};
        this.selectedPayer = {};

        this.isDisabledOBH = true;
        this.isDisabledOBHPartner = true;
        this.customNo.setValue(null);
        this.type.setValue(this.types[2]);

        Object.keys(this.form.controls).forEach((controlName: string) => {
            const imutableControls: String[] = ['invoiceNo', 'serieNo', 'invoiceDate', 'currency', 'type'];
            if (imutableControls.includes(controlName)) {
                return;
            }
            this.resetFormControl(this.form.controls[controlName]);
        });

    }

    checkValidateSurcharge(body: any) {
        const bodyToValidate: IShipmentValidate = {
            surchargeID: this.action !== 'update' ? '00000000-0000-0000-0000-000000000000' : this.selectedSurcharge.id,
            chargeID: body.chargeId,
            typeCharge: body.type,
            hblid: body.hblid,
            partner: body.paymentObjectId || body.payerId,
            customNo: body.clearanceNo,
            invoiceNo: body.invoiceNo,
            contNo: body.contNo,
            notes: body.notes
        };

        this._accoutingRepo.checkDuplicateShipmentSettlement(bodyToValidate)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res.status) {
                        if (this.isContinue) {
                            this.resetFormToContinue();
                        } else {
                            this.resetForm();
                        }

                        this.hide();

                        if (this.action === 'update') {
                            this.onUpdateChange.emit(body);
                        } else {
                            body.id = SystemConstants.EMPTY_GUID; // * Update ID
                            let surcharges:CsShipmentSurcharge[]=[];
                            surcharges.push(body)
                            this.onRequest.emit(surcharges);
                            console.log(surcharges);
                            
                        }
                    } else {
                        this._toastService.warning(res.message, '', { enableHtml: true });
                    }
                }
            );
    }

    detectDuplicate(surchargeInit: Surcharge, data: Surcharge): boolean {
        if (this.isSameSipment(surchargeInit, data)) {
            if (this.isSamePartner(surchargeInit, data)) {
                return surchargeInit.invoiceNo === data.invoiceNo
                    && surchargeInit.contNo === data.contNo
                    && surchargeInit.clearanceNo === data.clearanceNo
                    && surchargeInit.chargeCode === data.chargeCode;
            } else {
                return false;
            }
        } return false;
    }

    isSameSipment(initShipment: any, currentShipment: any): boolean {
        if (initShipment.hblid === currentShipment.hblid) {
            return true;
        } return false;
    }

    isSamePartner(initPartner: any, currenctPartner: any) {
        return initPartner.payerId === currenctPartner.payerId && initPartner.paymentObjectId === currenctPartner.paymentObjectId;
    }

    resetFormControl(control: FormControl | AbstractControl) {
        if (!!control && control instanceof FormControl) {
            control.setValue(null);
            control.markAsUntouched({ onlySelf: true });
            control.markAsPristine({ onlySelf: true });
        }
    }

    closePopup() {
        this.hide();
        this.resetForm();
    }

    onClickOutsideChargeName() {
        this._isShowAutoComplete.next(false);
    }


}

interface IShipmentValidate {
    surchargeID: string;
    chargeID: string;
    typeCharge: string;
    hblid: string;
    partner: string;
    customNo: string;
    invoiceNo: string;
    contNo: string;
    notes: string;
}
