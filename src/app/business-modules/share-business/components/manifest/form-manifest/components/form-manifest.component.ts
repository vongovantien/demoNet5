import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CsManifest } from 'src/app/shared/models/document/manifest.model';
import { FormValidators } from '@validators';
import { Store } from '@ngrx/store';
import * as fromShare from './../../../../../share-business/store';
import { GetCataloguePortAction, getCataloguePortState } from '@store';
import { CommonEnum } from '@enums';
import { PortIndex } from '@models';
import { AppForm } from 'src/app/app.form';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'form-manifest',
    templateUrl: './form-manifest.component.html'
})
export class ShareBusinessFormManifestComponent extends AppForm {
    @Input() type: CommonEnum.PORT_TYPE;
    @Input() isAir: boolean = false;

    formGroup: FormGroup;
    referenceNo: AbstractControl;
    supplier: AbstractControl;
    attention: AbstractControl;
    marksOfNationality: AbstractControl;
    vesselNo: AbstractControl;
    date: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;


    freightCharge: AbstractControl;
    consolidator: AbstractControl;
    deconsolidator: AbstractControl;
    weight: AbstractControl;
    volume: AbstractControl;
    agent: AbstractControl;
    shipperDescription: AbstractControl;

    freightCharges: Array<string> = ['Prepaid', 'Collect'];
    shipmentDetail: any = {}; // TODO model.

    manifest: CsManifest;
    jobId: string = '';
    defaultMarksOfNationality: string = '';

    ports: Observable<PortIndex[]>;

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    isImport: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _store: Store<fromShare.IShareBussinessState>,
        private _cd: ChangeDetectorRef


    ) {
        super();
    }

    ngOnInit() {
        switch (this.type) {
            case CommonEnum.PORT_TYPE.SEA:
                this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));
                break;
            case CommonEnum.PORT_TYPE.AIR:
                this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
                break;
        }
        this.ports = this._store.select(getCataloguePortState);
        this.initForm();
    }

    ngAfterViewInit() {
        this._cd.detectChanges();
    }

    getShipmentDetail() {
        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipmentDetail = res;
                        this.supplier.setValue(this.shipmentDetail.supplierName);

                        this.pol.setValue(this.shipmentDetail.pol);

                        this.pod.setValue(this.shipmentDetail.pod);

                        this.marksOfNationality.setValue(this.defaultMarksOfNationality);
                        if (!!this.shipmentDetail.paymentTerm) {
                            this.freightCharge.setValue(this.shipmentDetail.paymentTerm);
                        }

                        if (this.isAir) {
                            this.vesselNo.setValue(res.flightVesselName);
                        } else {
                            this.vesselNo.setValue(res.voyNo);
                        }

                        if (!this.isImport) {
                            this.date.setValue({ startDate: new Date(this.shipmentDetail.etd), endDate: new Date(this.shipmentDetail.etd) });
                        } else {
                            this.date.setValue({ startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) });
                        }

                        this.agent.setValue('TYPE NAME OF AGENT WHO ASSEMBLED THIS MANIFEST: INDO TRANS LOGISTICS CORPORATION \nSIGNATURE OF ASSEMBLING AGENT: PHONE# OF ASSEMBLING AGENT: (84 - 8) 3948 6888 \nRECEIVED BY CUSTOMS');

                        this.shipperDescription.setValue(this.shipmentDetail.mawbShipper === "" ? (this.shipmentDetail.creatorOffice.nameEn + '\n' + this.shipmentDetail.creatorOffice.addressEn) : this.shipmentDetail.mawbShipper);
                    }

                }
            );
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'PortOfLoading':
                this.pol.setValue(data.id);
                break;
            case 'PortOfDischarge':
                this.pod.setValue(data.id);
                break;
        }
    }

    updateDataToForm(res: CsManifest) {
        console.log(res);

        this.formGroup.setValue({
            referenceNo: !!res.refNo ? res.refNo : null,
            supplier: !!res.supplier ? res.supplier : null,
            attention: !!res.attention ? res.attention : null,
            marksOfNationality: !!res.masksOfRegistration ? res.masksOfRegistration : null,
            vesselNo: !!res.voyNo ? res.voyNo : null,
            date: !!res.invoiceDate ? { startDate: new Date(res.invoiceDate), endDate: new Date(res.invoiceDate) } : null,
            freightCharge: res.paymentTerm,
            consolidator: !!res.consolidator ? res.consolidator : null,
            deconsolidator: !!res.deConsolidator ? res.deConsolidator : null,
            weight: !!res.weight ? res.weight : null,
            volume: !!res.volume ? res.volume : null,
            agent: !!res.manifestIssuer ? res.manifestIssuer : null,
            pol: !!res.pol ? res.pol : null,
            pod: !!res.pod ? res.pod : null,
            shipperDescription: !!res.manifestShipper ? res.manifestShipper : null
        });

        console.log(this.formGroup.value);

    }

    initForm() {
        this.formGroup = this._fb.group({
            referenceNo: [],
            supplier: [null, Validators.required],
            attention: [],
            marksOfNationality: [null],
            vesselNo: [null, Validators.required],
            date: [null, Validators.required],
            freightCharge: [null, Validators.required],
            consolidator: [],
            deconsolidator: [],
            weight: [],
            volume: [],
            agent: [null, Validators.required],
            pol: [null, Validators.required],
            pod: [null, Validators.required],
            shipperDescription: []
        }, { validator: FormValidators.comparePort });
        this.referenceNo = this.formGroup.controls['referenceNo'];
        this.supplier = this.formGroup.controls['supplier'];
        this.attention = this.formGroup.controls['attention'];
        this.marksOfNationality = this.formGroup.controls['marksOfNationality'];
        this.vesselNo = this.formGroup.controls['vesselNo'];
        this.date = this.formGroup.controls['date'];
        this.freightCharge = this.formGroup.controls['freightCharge'];
        this.consolidator = this.formGroup.controls['consolidator'];
        this.deconsolidator = this.formGroup.controls['deconsolidator'];
        this.weight = this.formGroup.controls['weight'];
        this.volume = this.formGroup.controls['volume'];
        this.agent = this.formGroup.controls['agent'];
        this.pol = this.formGroup.controls['pol'];
        this.pod = this.formGroup.controls['pod'];
        this.shipperDescription = this.formGroup.controls['shipperDescription'];
    }
}
