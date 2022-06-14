import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { AccountingRepo, OperationRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { catchError, map } from 'rxjs/operators';
import { CustomDeclaration, AdvancePaymentRequest } from 'src/app/shared/models';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { InjectViewContainerRefDirective } from '@directives';
import { AdvancePaymentShipmentExistedPopupComponent } from '../shipment-existed/shipment-existed.popup';

@Component({
    selector: 'adv-payment-add-popup',
    templateUrl: './add-advance-payment-request.popup.html'
})

export class AdvancePaymentAddRequestPopupComponent extends PopupBase {

    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(InjectViewContainerRefDirective) confirmContainerRef: InjectViewContainerRefDirective;
    @ViewChild(AdvancePaymentShipmentExistedPopupComponent) confirmEsixedJobPopup: AdvancePaymentShipmentExistedPopupComponent;

    action: string = 'create';

    configShipment: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    selectedShipment: any = {};
    selectedShipmentData: any = null;

    types: CommonInterface.ICommonTitleValue[];
    selectedType: CommonInterface.ICommonTitleValue;

    customDeclarations: CustomDeclaration[];
    initCD: CustomDeclaration[];

    form: FormGroup;
    description: AbstractControl;
    amount: AbstractControl;
    currency: AbstractControl;
    type: AbstractControl;
    note: AbstractControl;
    customNo: AbstractControl;

    bodyConfirm: string = 'Do you want to exit ?';

    selectedRequest: AdvancePaymentRequest = new AdvancePaymentRequest(); // TODO detect form was changed when dupplicate
    isDupplicate: boolean = false;

    advanceNo: string = '';

    dataRequest: any = {};

    configCustomDisplayFields: CommonInterface.IComboGridDisplayField[];

    initShipments: OperationInteface.IShipment[];
    shipmentExisted: any[];
    constructor(
        private _fb: FormBuilder,
        private _accoutingRepo: AccountingRepo,
        private _operationRepo: OperationRepo,
        private _documentationRepo: DocumentationRepo,
    ) {
        super();
    }

    ngOnInit() {
        this.configCustomDisplayFields = [
            { field: 'clearanceNo', label: 'Custom No' },
            { field: 'jobNo', label: 'JobID' },
        ];

        this.initForm();
        this.initBasicData();
        this.getListShipment();
        this.getCustomNo();
    }

    initBasicData() {
        this.types = [
            { title: 'Norm', value: 'Norm' },
            { title: 'Invoice', value: 'Invoice' },
            { title: 'Other', value: 'Other' },
        ];

        this.type.setValue(this.types[2]);
    }

    initForm() {
        this.form = this._fb.group({
            'description': [, Validators.compose([
                // Validators.pattern(/^[\w '_"/*\\\.,-]*$/),
                Validators.required
            ])],
            'amount': [,
                Validators.compose([
                    Validators.required,
                ])
            ],
            'note': [],
            'customNo': [],
            'type': [],
            'currency': [],
        });

        this.description = this.form.controls['description'];
        this.amount = this.form.controls['amount'];
        this.note = this.form.controls['note'];
        this.customNo = this.form.controls['customNo'];
        this.type = this.form.controls['type'];
        this.currency = this.form.controls['currency'];
    }

    initFormUpdate(data: AdvancePaymentRequest) {
        this.form.setValue({
            description: data.description,
            amount: data.amount,
            note: data.requestNote,
            customNo: !!data.customNo ? (this.initCD.filter((item: CustomDeclaration) => item.clearanceNo === data.customNo).length ? this.initCD.filter((item: CustomDeclaration) => item.clearanceNo === data.customNo)[0] : null) : null,
            type: this.types.filter((type: any) => type.value.toLowerCase() === data.advanceType.toLowerCase())[0],
            currency: data.requestCurrency
        });

        this.selectedShipmentData = <OperationInteface.IShipment>{ hbl: data.hbl, jobId: data.jobId, mbl: data.mbl, hblid: data.hblid };
        this.selectedShipment = { field: 'jobId', value: data.jobId };

        this.advanceNo = data.advanceNo;

        // this.customDeclarations = [];
        this.customNo.setValue(null);

        if (!!data.customNo) {
            const _customDeclarations = this.filterCDByShipment(this.selectedShipmentData);
            if (this.customDeclarations.length > 0) {
                this.customNo.setValue(_customDeclarations[0].clearanceNo);
            }
        }
    }

    onSubmit(form: FormGroup) {
        const body: AdvancePaymentRequest = new AdvancePaymentRequest({
            customNo: this.customNo.value, // !!form.value.customNo ? form.value.customNo.clearanceNo : '',
            amount: form.value.amount,
            requestNote: form.value.note,
            hbl: this.selectedShipmentData.hbl,
            mbl: this.selectedShipmentData.mbl,
            jobId: this.selectedShipmentData.jobId,
            hblid: this.selectedShipmentData.hblid,
            advanceType: form.value.type.value,
            requestCurrency: form.value.currency,
            description: form.value.description,
            advanceNo: this.advanceNo,
            id: this.selectedRequest.id,
            userCreated: this.selectedRequest.userCreated,
            userModified: this.selectedRequest.userModified,
            statusPayment: this.selectedRequest.statusPayment,
            datetimeCreated: this.selectedRequest.datetimeCreated,
            datetimeModified: this.selectedRequest.datetimeModified
        });

        if (this.action === 'create') {
            this.checkRequestAdvancePayment(body);
        } else if (this.action === 'copy') {
            if (this.detectRequestChange(this.selectedRequest, body)) {
                this.isDupplicate = true;
                this.showPopupDynamicRender(ConfirmPopupComponent, this.confirmContainerRef.viewContainerRef, {
                    body: 'Data already exists, do you want to save or not ?',
                    title: 'Warning',
                    labelCancel: 'No'
                }, () => this.onSubmitDuplicatePopup())
            } else {
                this.isDupplicate = false;
                this.checkRequestAdvancePayment(body);
            }
        } else {
            this.checkRequestAdvancePayment(body);
        }
    }

    getListShipment() {
        this._documentationRepo.getShipmentAssginPIC()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: OperationInteface.IShipment) => {
                    this.configShipment.dataSource = this.initShipments = <any>res || [];

                    // * update config combogrid.
                    this.configShipment.displayFields = [
                        { field: 'jobId', label: 'Job No' },
                        { field: 'mbl', label: 'MBL' },
                        { field: 'hbl', label: 'HBL' },
                    ];
                    this.configShipment.selectedDisplayFields = ['jobId', `mbl`, 'hbl'];
                },
                (errors: any) => { },
                () => { }
            );
    }

    checkRequestAdvancePayment(advRequest: AdvancePaymentRequest) {
        this._accoutingRepo.checkShipmentsExistInAdvancePament(Object.assign({}, this.selectedShipmentData, { advanceNo: this.advanceNo }))
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!res.status) {
                        if (this.action === 'update') {
                            this.onUpdate.emit(advRequest);
                        } else {
                            this.onRequest.emit(advRequest);
                        }
                        this.hide();
                        this.resetForm();
                    } else {
                        this.dataRequest = advRequest;
                        if (!!res.data) {
                            this.shipmentExisted = [...res.data];
                            this.confirmEsixedJobPopup.show();
                        }
                    }
                },
            );
    }

    onSubmitShipmentExisted() {
        if (this.action === 'update') {
            this.onUpdate.emit(this.dataRequest);
        } else {
            //  * reset id, userCreate for create new object
            this.dataRequest.id = "00000000-0000-0000-0000-000000000000";
            this.dataRequest.userCreated = "";
            this.onRequest.emit(this.dataRequest);
        }
        this.resetForm();
        this.hide();
    }

    getCustomNo() {
        this._operationRepo.getListCustomNoAsignPIC()
            .pipe(
                catchError(this.catchError),
                map((response: any[]) => response.map((item: CustomDeclaration) => new CustomDeclaration(item))),
            )
            .subscribe(
                (res: any) => {
                    this.customDeclarations = this.initCD = res || [];
                },
            );
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'shipment':
                this.selectedShipment = { field: 'jobId', value: data.hbl };
                this.selectedShipmentData = data;

                // this.customDeclarations = [];
                this.customNo.setValue(null);

                const _customDeclarations = this.filterCDByShipment(this.selectedShipmentData);

                if (_customDeclarations.length > 0) {
                    this.customNo.setValue(_customDeclarations[0].clearanceNo);
                }
                break;
            case 'cd':
                this.customNo.setValue(data.clearanceNo);
                const _shipments = this.filterShipmentByCD(data);
                if (_shipments.length > 0) {
                    this.selectedShipment = { field: 'jobId', value: _shipments[0].jobId };
                    this.selectedShipmentData = _shipments[0];
                } else {
                    this.selectedShipment = {};
                    this.selectedShipmentData = null;
                }

                break;
            default:
                break;
        }

    }

    filterCDByShipment(shipment: OperationInteface.IShipment): CustomDeclaration[] {
        return (this.initCD || []).filter((item: CustomDeclaration) => {
            return (item.jobNo === shipment.jobId);
        });
    }

    filterShipmentByCD(cd: CustomDeclaration): OperationInteface.IShipment[] {
        return this.initShipments.filter((item: OperationInteface.IShipment) => {
            return (item.jobId === cd.jobNo);
        });
    }

    onCancel() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.confirmContainerRef.viewContainerRef, {
            body: 'Do you want to exit ?',
            labelCancel: 'No',
            title: 'Warning'
        }, () => this.onSubmitExitPopup())
    }

    resetForm() {
        this.description.setValue(null);
        this.note.setValue(null);
        this.amount.setValue(null);
        this.type.setValue(this.types[2]);
        this.customNo.setValue(null);

        this.description.markAsPristine({ onlySelf: true });
        this.description.markAsUntouched({ onlySelf: true });

        this.selectedShipment = {};
        this.selectedShipmentData = null;
    }

    onComfirmSaveDupplicateRequestAdvancePayment(form: FormGroup) {
        const body: AdvancePaymentRequest = new AdvancePaymentRequest({
            customNo: this.customNo.value, // !!form.value.customNo ? form.value.customNo.clearanceNo : '',
            amount: form.value.amount,
            requestNote: form.value.note,
            hbl: this.selectedShipmentData.hbl,
            mbl: this.selectedShipmentData.mbl,
            jobId: this.selectedShipmentData.jobId,
            hblid: this.selectedShipmentData.hblid,
            advanceType: form.value.type.value,
            requestCurrency: form.value.currency,
            description: form.value.description,
            advanceNo: this.advanceNo,
            statusPayment: this.selectedRequest.statusPayment,
        });
        this.onRequest.emit(body);
        // * create new request in dupplicating

    }

    onSubmitExitPopup() {
        this.hide();
        this.resetForm();
    }

    onSubmitDuplicatePopup() {
        this.hide();
        if (this.isDupplicate) {
            this.onComfirmSaveDupplicateRequestAdvancePayment(this.form);
        }
        this.resetForm();
    }

    detectRequestChange(requestInit: AdvancePaymentRequest, data: AdvancePaymentRequest): boolean {
        return (
            requestInit.description === data.description
            && requestInit.amount === data.amount
            && requestInit.requestNote === data.requestNote
            && requestInit.jobId === data.jobId
            && requestInit.advanceType === data.advanceType
            && requestInit.customNo === data.customNo
        );
    }

    clearData(key: string) {
        switch (key) {
            case 'shipment':
                this.selectedShipmentData = null;
                break;
            case 'cd':
                this.customNo.setValue(null);
                break;
            default:
                break;
        }
    }
}
