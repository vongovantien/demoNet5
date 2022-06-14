import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Params } from '@angular/router';

import { AppForm } from '@app';
import { Customer, PortIndex, User, csBookingNote, CsTransaction, Incoterm } from '@models';
import { DocumentationRepo, SystemRepo, CatalogueRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { FormValidators } from '@validators';
import { JobConstants, SystemConstants, ChargeConstants } from '@constants';
import { AppComboGridComponent } from '@common';
import { InjectViewContainerRefDirective } from '@directives';
import { DataService } from '@services';

import { takeUntil, skip, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import * as fromShare from './../../../../share-business/store';
import { GetCatalogueAgentAction, GetCatalogueCarrierAction, getCatalogueCarrierState, getCatalogueAgentState, GetCataloguePortAction, getCataloguePortState, } from '@store';
@Component({
    selector: 'app-form-create-sea-export',
    templateUrl: './form-create-sea-export.component.html'
})

export class ShareSeaServiceFormCreateSeaExportComponent extends AppForm implements OnInit {

    @ViewChild(InjectViewContainerRefDirective) private bookingNoteContainerRef: InjectViewContainerRefDirective;
    @Input() set type(t: string) { this._type = t; }

    get type() { return this._type; }

    private _type: string = ChargeConstants.SLI_CODE;

    formGroup: FormGroup;
    etd: AbstractControl;
    eta: AbstractControl;
    ata: AbstractControl;
    atd: AbstractControl;

    mawb: AbstractControl;
    mbltype: AbstractControl;
    shipmentType: AbstractControl;
    typeOfService: AbstractControl;
    personalIncharge: AbstractControl;
    term: AbstractControl;
    incotermId: AbstractControl;
    serviceDate: AbstractControl;

    coloader: AbstractControl; // Supplier/Vendor(Coloader).
    supplierName: string = null;

    pol: AbstractControl;
    pod: AbstractControl;
    polDescription: AbstractControl;
    podDescription: AbstractControl;

    agent: AbstractControl;
    agentName: string = null;

    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    listUsers: Observable<User[]>;
    csBookingNotes: csBookingNote[] = [];
    incoterms: Observable<Incoterm[]>;


    displayFieldsSupplier: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name Abbr' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    displayFieldBookingNote: CommonInterface.IComboGridDisplayField[] = [
        { field: 'bookingNo', label: 'Booking No' },
    ];

    serviceTypes: string[] = JobConstants.COMMON_DATA.SERVICETYPES;
    ladingTypes: string[] = JobConstants.COMMON_DATA.BILLOFLADINGS;
    shipmentTypes: string[] = JobConstants.COMMON_DATA.SHIPMENTTYPES;
    termTypes: string[] = JobConstants.COMMON_DATA.FREIGHTTERMS;

    userLogged: User;

    constructor(
        private _documentRepo: DocumentationRepo,
        private _fb: FormBuilder,
        private _store: Store<fromShare.IShareBussinessState>,
        private _route: ActivatedRoute,
        private _systemRepo: SystemRepo,
        private _dataService: DataService,
        private _catalogueRepo: CatalogueRepo

    ) {
        super();
    }

    ngOnInit() {
        this.initForm();

        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueCarrierAction(CommonEnum.PartnerGroupEnum.CARRIER));
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));

        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.ports = this._store.select(getCataloguePortState).pipe(shareReplay());
        this.listUsers = this._systemRepo.getListSystemUser();
        this.incoterms = this._catalogueRepo.getIncoterm({ service: [this.type] });

        this.getUserLogged();

        if (this.type === ChargeConstants.SLE_CODE) {
            this.getBookingNotes();
        }

        // * Subscribe state to update form.
        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), skip(1))
            .subscribe(
                (res: CsTransaction) => {
                    if (!!res) {
                        try {
                            this._route.queryParams.subscribe((param: Params) => {
                                if (param.action === 'copy') {
                                    res.jobNo = null;
                                    res.etd = null;
                                    res.mawb = null;
                                    res.eta = null;
                                    res.serviceDate = null;
                                    res.atd = null;
                                    res.ata = null;
                                    res.serviceDate = null;
                                    res.ata = null;
                                }
                            });
                            this.supplierName = res.supplierName;
                            this.agentName = res.agentName;
                            this.formGroup.patchValue({
                                jobID: res.jobNo,
                                etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null,
                                eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null,
                                serviceDate: !!res.serviceDate ? { startDate: new Date(res.serviceDate), endDate: new Date(res.serviceDate) } : null,
                                ata: !!res.ata ? { startDate: new Date(res.ata), endDate: new Date(res.ata) } : null,
                                atd: !!res.atd ? { startDate: new Date(res.atd), endDate: new Date(res.atd) } : null,

                                mbltype: res.mbltype,
                                typeOfService: res.typeOfService,
                                term: res.paymentTerm,
                                shipmentType: res.shipmentType,
                                incotermId: res.incotermId,

                                coloader: res.coloaderId,
                                bookingNo: res.bookingNo,
                                pol: res.pol,
                                pod: res.pod,
                                agent: res.agentId,
                                flightVesselName: res.flightVesselName,
                                voyNo: res.voyNo,
                                mawb: res.mawb,

                                personalIncharge: res.personIncharge,
                                notes: res.notes,
                                pono: res.pono,
                                podDescription: !!res.podDescription ? res.podDescription : res.podName,
                                polDescription: !!res.polDescription ? res.polDescription : res.polName,


                            });

                            this.currentFormValue = this.formGroup.getRawValue(); // For CanDeactivate.
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            );
    }

    initForm() {
        this.formGroup = this._fb.group({
            jobID: [{ value: null, disabled: true }], // * disabled

            etd: [null, Validators.required], // * Date
            eta: [], // * Date
            ata: [],
            atd: [],

            serviceDate: [null, Validators.required],

            mawb: ['', Validators.compose([
                FormValidators.validateSpecialChar
            ])],
            voyNo: [],
            flightVesselName: [],
            pono: [],
            notes: [],
            term: [this.termTypes[1]],
            bookingNo: [],
            polDescription: [null, Validators.required],
            podDescription: [],

            coloader: [null, Validators.required],
            pol: [null, Validators.required],
            pod: [],
            agent: [],

            mbltype: [null, Validators.required], // * select
            shipmentType: [this.shipmentTypes[0], Validators.required], // * select
            typeOfService: [null, Validators.required], // * select
            personalIncharge: [],  // * select
            incotermId: [null, Validators.required]
        }, { validator: [FormValidators.comparePort, FormValidators.compareETA_ETD] });

        this.etd = this.formGroup.controls["etd"];
        this.eta = this.formGroup.controls["eta"];
        this.mawb = this.formGroup.controls["mawb"];
        this.mbltype = this.formGroup.controls["mbltype"];
        this.shipmentType = this.formGroup.controls["shipmentType"];
        this.typeOfService = this.formGroup.controls["typeOfService"];
        this.term = this.formGroup.controls["term"];
        this.personalIncharge = this.formGroup.controls["personalIncharge"];
        this.serviceDate = this.formGroup.controls["serviceDate"];


        this.coloader = this.formGroup.controls["coloader"];
        this.pol = this.formGroup.controls["pol"];
        this.pod = this.formGroup.controls["pod"];
        this.agent = this.formGroup.controls["agent"];

        this.polDescription = this.formGroup.controls['polDescription'];
        this.podDescription = this.formGroup.controls['podDescription'];
        this.ata = this.formGroup.controls['ata'];
        this.atd = this.formGroup.controls['atd'];
        this.incotermId = this.formGroup.controls['incotermId'];
        this.formGroup.controls['etd'].valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((value: { startDate: any, endDate: any }) => {
                if (!!value.startDate) {

                    this.isSubmitted = false;
                    // this.resetFormControl(this.formGroup.controls["eta"]);
                    // * serviceDate hadn't value

                    if (!this.formGroup.controls["serviceDate"].value || !this.formGroup.controls["serviceDate"].value.startDate) {
                        this.formGroup.controls["serviceDate"].setValue(value);
                    }
                } else {
                    this.formGroup.controls["serviceDate"].setValue(null);
                }
            });

    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.personalIncharge.setValue(this.userLogged.id);
        this.personalIncharge.disable();
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'supplier':
                this.supplierName = data.shortName;
                this.coloader.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                this.polDescription.setValue((data as PortIndex).nameEn);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                this.podDescription.setValue((data as PortIndex).nameEn);
                break;
            case 'agent':
                this.agentName = data.shortName;
                this.agent.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getBookingNotes() {
        this._documentRepo.getBookingNoteSeaLCLExport().subscribe(
            (res: csBookingNote[]) => {
                this.csBookingNotes = res;
            }
        );
    }

    showBookingNote() {
        this.componentRef = this.renderDynamicComponent(AppComboGridComponent, this.bookingNoteContainerRef.viewContainerRef);

        if (!!this.componentRef) {
            this.componentRef.instance.headers = <CommonInterface.IHeaderTable[]>[{ title: 'Booking Note', field: 'bookingNo' }];
            this.componentRef.instance.data = this.csBookingNotes;
            this.componentRef.instance.fields = ['bookingNo'];

            // * Listen Event.
            this.subscription = ((this.componentRef.instance) as AppComboGridComponent<csBookingNote>).onClick.subscribe(
                (bookingNote: csBookingNote) => {

                    const formData: ISyncBookingNoteFormData = {
                        bookingNo: bookingNote.bookingNo,
                        eta: !!bookingNote.eta ? { startDate: new Date(bookingNote.eta), endDate: new Date(bookingNote.eta) } : null,
                        etd: !!bookingNote.etd ? { startDate: new Date(bookingNote.etd), endDate: new Date(bookingNote.etd) } : null,
                        pol: bookingNote.pol,
                        pod: bookingNote.pod,
                        term: bookingNote.paymentTerm,
                        flightVesselName: bookingNote.vessel,
                        voyNo: bookingNote.voy
                    };

                    this.formGroup.patchValue(formData);

                    // * FIRE DATA FOR SHIPMENT GOOD SUMMARY LCL.
                    this._dataService.$data.next({ cbm: bookingNote.cbm, gw: bookingNote.gw, commodity: bookingNote.commodity });

                    this.subscription.unsubscribe();
                    this.bookingNoteContainerRef.viewContainerRef.clear();
                });

            ((this.componentRef.instance) as AppComboGridComponent<csBookingNote>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        this.bookingNoteContainerRef.viewContainerRef.clear();
                    }
                );
        }
    }
}

interface ISyncBookingNoteFormData {
    bookingNo: string;
    eta: any;
    etd: any;
    pol: string;
    pod: string;
    term: string;
    flightVesselName: string;
    voyNo: string;
}



