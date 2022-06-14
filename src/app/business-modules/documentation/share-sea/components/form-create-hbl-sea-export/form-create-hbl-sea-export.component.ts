import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { formatDate } from '@angular/common';

import { CatalogueRepo, DocumentationRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { User, CsTransactionDetail, CsTransaction, Customer, CountryModel, PortIndex, csBookingNote, Incoterm } from '@models';
import { JobConstants, ChargeConstants, SystemConstants } from '@constants';
import { AppComboGridComponent, InfoPopupComponent } from '@common';
import { InjectViewContainerRefDirective } from '@directives';
import { GetCatalogueAgentAction, getCatalogueAgentState, GetCataloguePortAction, getCataloguePortState, GetCatalogueCountryAction, getCatalogueCountryState, getCurrentUserState } from '@store';
import { FormValidators } from '@validators';

import { AppForm } from 'src/app/app.form';
import * as fromShareBussiness from './../../../../share-business/store';

import { Observable, of } from 'rxjs';
import { catchError, takeUntil, skip, finalize, tap, concatMap, startWith, filter, switchMap } from 'rxjs/operators';
import { DataService } from '@services';

import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-form-create-hbl-sea-export',
    templateUrl: './form-create-hbl-sea-export.component.html'
})
export class ShareSeaServiceFormCreateHouseBillSeaExportComponent extends AppForm implements OnInit {

    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;
    @ViewChild(InfoPopupComponent) infoPopup: InfoPopupComponent;

    @Input() isUpdate: boolean = false;
    @Input() set type(t: string) { this._type = t; }

    get type() { return this._type; }

    private _type: string = ChargeConstants.SFE_CODE; // SLE | SFE

    formCreate: FormGroup;
    customer: AbstractControl;
    saleMan: AbstractControl;
    shipper: AbstractControl;
    shipperDescription: AbstractControl;
    consignee: AbstractControl;
    notifyParty: AbstractControl;
    mawb: AbstractControl;
    hwbno: AbstractControl;
    consigneeDescription: AbstractControl;
    notifyPartyDescription: AbstractControl;
    hbltype: AbstractControl;
    oceanVoyNo: AbstractControl;
    country: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    polDescription: AbstractControl;
    podDescription: AbstractControl;
    // freightCharge: AbstractControl;
    goodsDelivery: AbstractControl;
    goodsDeliveryDescription: AbstractControl;
    forwardingAgent: AbstractControl;
    forwardingAgentDescription: AbstractControl;
    serviceType: AbstractControl;
    sailingDate: AbstractControl;
    closingDate: AbstractControl;
    freightPayment: AbstractControl;
    placeFreightPay: AbstractControl;
    originBlnumber: AbstractControl;
    moveType: AbstractControl;
    issueHbldate: AbstractControl;
    issueHblplace: AbstractControl;
    incotermId:AbstractControl;

    customers: Observable<Customer[]>;
    saleMans: User[];
    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    countries: Observable<CountryModel[]>;
    ports: Observable<PortIndex[]>;
    agents: Observable<Customer[]>;
    incoterms: Observable<Incoterm[]>;


    serviceTypes: string[] = JobConstants.COMMON_DATA.SERVICETYPES;
    ladingTypes: string[] = JobConstants.COMMON_DATA.BILLOFLADINGS;
    termTypes: string[] = JobConstants.COMMON_DATA.FREIGHTTERMS;
    typeOfMoves: string[] = JobConstants.COMMON_DATA.TYPEOFMOVES;
    originNumbers: CommonInterface.INg2Select[] = JobConstants.COMMON_DATA.BLNUMBERS;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    displayFieldsCountry: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_COUNTRY;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;

    shipmmentDetail: CsTransaction = new CsTransaction();
    isLoadingCustomer: boolean = false;
    isLoadingShipper: boolean = false;
    isLoadingConsignee: boolean = false;

    csBookingNotes: csBookingNote[] = [];
    customerName: string;
    shipperName: string;

    dateTimeCreated: string;
    dateTimeModified: string;
    userCreated: string;
    userModified: string;

    hblId: string = '';

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _fb: FormBuilder,
        private _documentRepo: DocumentationRepo,
        private _store: Store<fromShareBussiness.IShareBussinessState>,
        private _dataService: DataService,
        private _toast: ToastrService
    ) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.incoterms = this._catalogueRepo.getIncoterm({ service: [this.type] });
        if (this.type === ChargeConstants.SLE_CODE) {
            this.getCSBookingNotes();
        }

        this.isLoadingCustomer = true;
        this.isLoadingShipper = true;
        this.isLoadingConsignee = true;

        // this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER).pipe(
        //     finalize(() => {
        //         this.isLoadingCustomer = false;
        //     })
        // );

        this.customers = this._store.select(getCurrentUserState)
            .pipe(
                filter(c => !!c.userName),
                tap((c) => this.currentUser = c),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getPartnerByGroups(
                            [CommonEnum.PartnerGroupEnum.CUSTOMER],
                            true,
                            this._type,
                            currentUser?.officeId
                        ).pipe(startWith([]))
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            ) as any;
        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]).pipe(
            finalize(() => {
                this.isLoadingShipper = false;
            })
        );
        this.consignees = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CONSIGNEE).pipe(
            finalize(() => {
                this.isLoadingConsignee = false;
            })
        );

        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCataloguePortAction());
        this._store.dispatch(new GetCatalogueCountryAction());

        this.agents = this._store.select(getCatalogueAgentState);
        this.ports = this._store.select(getCataloguePortState);
        this.countries = this._store.select(getCatalogueCountryState);

        if (this.isUpdate) {
            this._store.select(fromShareBussiness.getDetailHBlState)
                .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1))
                .subscribe(
                    (res: CsTransactionDetail) => {
                        if (!!res) {
                            this.shipmmentDetail.id = res.jobId;
                            this.dateTimeCreated = res.datetimeCreated;
                            this.dateTimeModified = res.datetimeModified;
                            this.userCreated = res.userNameCreated;
                            this.userModified = res.userNameModified;
                            this.hblId = res.id;
                            this.updateFormValue(res);
                        }
                    }
                );
        } else {
            this.getShipmentDetailAndUpdateDefault();
        }

    }

    getShipmentDetailAndUpdateDefault() {
        // * get detail shipment from store.
        this._store.select(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1),
                tap((shipment: CsTransaction) => {
                    // * set default value for controls from shipment detail.
                    if (shipment && shipment.id !== SystemConstants.EMPTY_GUID) {
                        this.shipmmentDetail = new CsTransaction(shipment);
                        this.formCreate.patchValue({
                            bookingNo: this.shipmmentDetail.bookingNo,
                            mawb: this.shipmmentDetail.mawb,
                            oceanVoyNo: (!!this.shipmmentDetail.flightVesselName ? this.shipmmentDetail.flightVesselName : '') + ' - ' + (!!this.shipmmentDetail.voyNo ? this.shipmmentDetail.voyNo : ''),
                            pod: this.shipmmentDetail.pod,
                            pol: this.shipmmentDetail.pol,
                            serviceType: !!this.shipmmentDetail.typeOfService ? this.shipmmentDetail.typeOfService : null,
                            issueHbldate: !!this.shipmmentDetail.etd ? { startDate: new Date(this.shipmmentDetail.etd), endDate: new Date(this.shipmmentDetail.etd) } : null,
                            sailingDate: !!this.shipmmentDetail.etd ? { startDate: new Date(this.shipmmentDetail.etd), endDate: new Date(this.shipmmentDetail.etd) } : null,
                            issueHblplace: !!this.shipmmentDetail.creatorOffice ? this.shipmmentDetail.creatorOffice.location : null,
                            onBoardStatus: this.setDefaultOnboard(this.shipmmentDetail.polName, this.shipmmentDetail.polCountryNameEn, this.shipmmentDetail.etd),
                            forwardingAgentDescription: this.setDefaultForwardingAgent(this.shipmmentDetail),
                            goodsDeliveryDescription: this.setDefaultAgentData(this.shipmmentDetail),
                            moveType: (this.shipmmentDetail.transactionType === ChargeConstants.SFE_CODE) ? 'FCL/FCL-CY/CY' : 'LCL/LCL-CY/CY',
                            originBlnumber: this.setDefaultOriginBLNumber(this.shipmmentDetail),
                            placeDelivery: this.shipmmentDetail.podName,
                            placeReceipt: this.shipmmentDetail.polName,
                            podDescription: !!this.shipmmentDetail.podDescription ? this.shipmmentDetail.podDescription : this.shipmmentDetail.podName,
                            polDescription: !!this.shipmmentDetail.polDescription ? this.shipmmentDetail.polDescription : this.shipmmentDetail.polName,

                            incotermId: this.shipmmentDetail.incotermId
                        });

                        if (!!this.shipmmentDetail.bookingNo) {
                            this._documentRepo.getBookingNoteSeaLCLExport().subscribe(
                                (res: csBookingNote[]) => {
                                    this.csBookingNotes = res;
                                    if (!!this.csBookingNotes.length) {
                                        const currentBookingNo: csBookingNote = this.csBookingNotes.find(b => b.bookingNo === this.shipmmentDetail.bookingNo);
                                        if (currentBookingNo) {
                                            this.shipper.setValue(currentBookingNo.shipperId);
                                            this.shipperDescription.setValue(currentBookingNo.shipperDescription);
                                            this.consignee.setValue(currentBookingNo.consigneeId);
                                            this.consigneeDescription.setValue(currentBookingNo.consigneeDescription);
                                        }
                                    }
                                }
                            );

                        }
                    }
                }),
                concatMap((res: CsTransaction) => {
                    if (!!res.podCode) {
                        return this._documentRepo.generateHBLSeaExport(res.podCode);
                    } else { return of(""); }
                }))
            .pipe(tap((hblNo: string) => {
                this.hwbno.setValue(hblNo);
            }))
            .subscribe(
                (hblNo: any) => { }
            );
    }

    setDefaultOriginBLNumber(shipment: CsTransaction) {
        if (!!shipment.transactionType) {
            if (shipment.transactionType === ChargeConstants.SFE_CODE || shipment.transactionType === ChargeConstants.SCE_CODE) {
                return this.originNumbers[3].id;
            }
            if (shipment.transactionType === ChargeConstants.SLE_CODE || shipment.transactionType === ChargeConstants.SCI_CODE) {
                if (shipment.mbltype === 'Original') {
                    return this.originNumbers[3].id;
                } else {
                    return this.originNumbers[1].id;
                }
            }
        } else {
            return null;
        }
    }

    setDefaultAgentData(shipment: CsTransaction) {
        if (!!shipment.agentData) {
            return this.getDescription(shipment.agentData.nameEn, shipment.agentData.address, shipment.agentData.tel, shipment.agentData.fax);
        }
        return null;
    }

    setDefaultOnboard(polName: string, country: string, etd: string) {
        if (etd) {
            return `SHIPPED ON BOARD \n${polName}, ${country} \n${formatDate(etd, 'mediumDate', 'en')}`;
        }
        return `SHIPPED ON BOARD \n${polName}, ${country}`;
    }

    setDefaultForwardingAgent(shipment: CsTransaction) {
        if (!!shipment.creatorOffice) {
            return `${this.getDescription(shipment.creatorOffice.nameEn, shipment.creatorOffice.addressEn, shipment.creatorOffice.tel, shipment.creatorOffice.fax)}\n${!!shipment.groupEmail ? 'Email: ' + shipment.groupEmail : ''}`;
        }
    }

    initForm() {
        this.formCreate = this._fb.group({
            // * Combogrid
            customer: [null, Validators.required],
            saleMan: [null, Validators.required],
            shipper: [null, Validators.required],
            consignee: [null],
            notifyParty: [],
            country: [],
            pol: [null, Validators.required],
            pod: [null, Validators.required],
            polDescription: [null, Validators.required],
            podDescription: [null, Validators.required],
            forwardingAgent: [],
            goodsDelivery: [],

            // * Select
            hbltype: [null, Validators.required],
            serviceType: [],
            freightPayment: [null, Validators.required],
            originBlnumber: [this.originNumbers[1].id],

            // * date
            sailingDate: [null, Validators.required],
            closingDate: [],
            issueHbldate: [],

            // * Input
            mawb: [null, Validators.compose([
                FormValidators.validateSpecialChar
            ])],
            hwbno: [null, Validators.compose([
                Validators.required,
                FormValidators.validateSpecialChar
            ])],
            localVoyNo: [],
            finalDestinationPlace: [],
            oceanVoyNo: [null, Validators.required],
            shipperDescription: [],
            consigneeDescription: [null, this.type === ChargeConstants.SFE_CODE ? Validators.required : null],
            notifyPartyDescription: ['SAME AS CONSIGNEE'],
            bookingNo: [],
            goodsDeliveryDescription: [],
            forwardingAgentDescription: [],
            placeFreightPay: [null, Validators.required],
            issueHblplace: [],
            referenceNo: [],
            exportReferenceNo: [],
            moveType: [],
            purchaseOrderNo: [],
            placeReceipt: [],
            placeDelivery: [],
            shippingMark: [],
            inWord: [],
            onBoardStatus: [],
            incotermId: [null, Validators.required]

        },
            { validator: FormValidators.comparePort }
        );
        this.mawb = this.formCreate.controls["mawb"];
        this.hwbno = this.formCreate.controls["hwbno"];
        this.customer = this.formCreate.controls["customer"];
        this.saleMan = this.formCreate.controls["saleMan"];
        this.shipper = this.formCreate.controls["shipper"];
        this.shipperDescription = this.formCreate.controls["shipperDescription"];
        this.consignee = this.formCreate.controls["consignee"];
        this.notifyParty = this.formCreate.controls["notifyParty"];
        this.consigneeDescription = this.formCreate.controls["consigneeDescription"];
        this.notifyPartyDescription = this.formCreate.controls["notifyPartyDescription"];
        this.hbltype = this.formCreate.controls["hbltype"];
        this.oceanVoyNo = this.formCreate.controls["oceanVoyNo"];
        this.country = this.formCreate.controls["country"];
        this.pol = this.formCreate.controls["pol"];
        this.pod = this.formCreate.controls["pod"];
        this.forwardingAgent = this.formCreate.controls["forwardingAgent"];
        this.forwardingAgentDescription = this.formCreate.controls["forwardingAgentDescription"];
        this.goodsDeliveryDescription = this.formCreate.controls["goodsDeliveryDescription"];
        this.goodsDelivery = this.formCreate.controls["goodsDelivery"];
        this.serviceType = this.formCreate.controls["serviceType"];
        this.sailingDate = this.formCreate.controls["sailingDate"];
        this.closingDate = this.formCreate.controls["closingDate"];
        this.freightPayment = this.formCreate.controls["freightPayment"];
        this.placeFreightPay = this.formCreate.controls["placeFreightPay"];
        this.originBlnumber = this.formCreate.controls["originBlnumber"];
        this.moveType = this.formCreate.controls["moveType"];
        this.issueHbldate = this.formCreate.controls["issueHbldate"];
        this.issueHblplace = this.formCreate.controls["issueHblplace"];
        this.polDescription = this.formCreate.controls["polDescription"];
        this.podDescription = this.formCreate.controls["podDescription"];
        this.incotermId = this.formCreate.controls["incotermId"];
        this.hwbno.valueChanges
            .pipe(startWith(this.hwbno.value), takeUntil(this.ngUnsubscribe))
            .subscribe((hwbno: string) => {
                this._dataService.setData('formHBLData', { hblNo: hwbno, etd: '', eta: '' });
            });
    }

    updateFormValue(data: CsTransactionDetail) {
        this.customerName = data.customerName;
        this.shipperName = data.shipperName;

        const formValue = {
            closingDate: !!data.closingDate ? { startDate: new Date(data.closingDate), endDate: new Date(data.closingDate) } : null,
            sailingDate: !!data.sailingDate ? { startDate: new Date(data.sailingDate), endDate: new Date(data.sailingDate) } : null,
            issueHbldate: !!data.issueHbldate ? { startDate: new Date(data.issueHbldate), endDate: new Date(data.issueHbldate) } : null,

            customer: data.customerId,
            saleMan: data.saleManId,
            shipper: data.shipperId,
            consignee: data.consigneeId,
            notifyParty: data.notifyPartyId,
            bookingNo: data.customsBookingNo,
            country: data.originCountryId,
            placeReceipt: data.pickupPlace,
            placeDelivery: data.deliveryPlace,
            forwardingAgent: data.forwardingAgentId,
            goodsDelivery: data.goodsDeliveryId,
            podDescription: !!data.podDescription ? data.podDescription : data.podName,
            polDescription: !!data.polDescription ? data.polDescription : data.polName
        };

        this.formCreate.patchValue(_merge(_cloneDeep(data), formValue));

        this._catalogueRepo.getListSalemanByPartner(data.customerId, this.type)
            .subscribe((salesmans: any) => {
                this.saleMans = salesmans;
            });
    }

    getDescription(fullName: string, address: string, tel: string, fax: string) {
        let strDescription: string = '';
        if (!!fullName) {
            strDescription += fullName;
        }
        if (!!address) {
            strDescription = strDescription + "\n" + address;
        }
        if (!!tel) {
            strDescription = strDescription + "\nTel: " + tel;
        }
        if (!!fax) {
            strDescription = strDescription + "\nFax: " + fax;
        }
        return strDescription;
    }

    onUpdateDataToImport(data: CsTransactionDetail) {
        this.formCreate.patchValue({
            mawb: data.mawb,
            consigneeDescription: data.consigneeDescription,
            shipperDescription: data.shipperDescription,
            customer: data.customerId,
            consignee: data.consigneeId,
            saleMan: data.saleManId,
            shipper: data.shipperId,
            notifyParty: data.notifyParty,
            localVoyNo: data.localVoyNo,
            oceanVoyNo: data.oceanVoyNo,
            country: data.originCountryId,
            pickupPlace: data.pickupPlace,
            pol: data.pol,
            pod: data.pod,
            placeDelivery: data.deliveryPlace,
            finalDestinationPlace: data.finalDestinationPlace,
            forwardingAgent: data.forwardingAgentId,
            forwardingAgentDescription: data.forwardingAgentDescription,
            goodsDelivery: data.goodsDeliveryId,
            goodsDeliveryDescription: data.goodsDeliveryDescription,
            purchaseOrderNo: data.purchaseOrderNo,
            shippingMark: data.shippingMark,
            inWord: data.inWord,
            onBoardStatus: data.onBoardStatus,
            originBlnumber: data.originBlnumber,
            freightPayment: data.freightPayment,
            moveType: data.moveType,
            serviceType: data.serviceType,
            hbltype: data.hbltype,
            polDescription: data.polDescription,
            podDescription: data.podDescription,
        });

        this.ports.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            (ports: PortIndex[]) => {
                let portIndex = ports.filter((x: PortIndex) => x.id === data.pol)[0];
                this.onSelectDataFormInfo(portIndex, 'pol');
                portIndex = ports.filter((x: PortIndex) => x.id === data.pod)[0];
                this.onSelectDataFormInfo(portIndex, 'pod');
            }
        )
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this._toast.clear();

                this.customer.setValue(data.id);
                this.customerName = data.shortName;

                if (!this.shipper.value) {
                    this.shipper.setValue(data.id);
                    this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }
                this._catalogueRepo.getListSalemanByPartner(data.id, this.type)
                    .subscribe((res: any) => {
                        if (!!res) {
                            this.saleMans = res || [];
                            if (!!this.saleMans.length) {
                                this.saleMan.setValue(res[0].id);
                            } else {
                                this.saleMan.setValue(null);
                                this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                                    body: `<strong>${data.shortName}</strong> not have any agreement for service in this office <br/> please check again!`
                                })
                            }
                        } else {
                            this.saleMans = [];
                            this.saleMan.setValue(null);
                        }
                    });
                break;
            case 'shipper':
                this.shipperName = data.shortName;
                this.shipper.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'consignee':
                this.consignee.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'notify':
                this.notifyParty.setValue(data.id);
                this.notifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'country':
                this.country.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                this.polDescription.setValue((data as PortIndex).nameEn);

                // * CHANGE POL update onBoard Status
                this.formCreate.controls['onBoardStatus'].setValue(this.setDefaultOnboard((data as PortIndex).nameEn, (data as PortIndex).countryNameEN, this.shipmmentDetail.etd));
                break;
            case 'pod':
                this.pod.setValue(data.id);
                this.podDescription.setValue((data as PortIndex).nameEn);
                break;
            case 'forwarding':
                this.forwardingAgent.setValue(data.id);
                this.forwardingAgentDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'deliveryGood':
                this.goodsDelivery.setValue(data.id);
                this.goodsDeliveryDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'agent':
                this.forwardingAgent.setValue(data.id);
                break;
            case 'freightPayment':
                if (!!data) {
                    if (data === 'Collect') {
                        this.placeFreightPay.setValue('Destination');
                    } else {
                        this.placeFreightPay.setValue('Origin');
                    }
                }
                break;
            case 'sale':
                this.saleMan.setValue(data.id);
                break;
            default:
                break;
        }
    }

    onSelectHblType(data: string) {
        if (!!data && data === 'Original') {
            this.originBlnumber.setValue(this.originNumbers[3].id);
        }
    }

    getCSBookingNotes() {
        this._documentRepo.getBookingNoteSeaLCLExport().subscribe(
            (res: csBookingNote[]) => {
                this.csBookingNotes = res;
            }
        );
    }

    showBookingNote() {
        this.componentRef = this.renderDynamicComponent(AppComboGridComponent, this.viewContainerRef.viewContainerRef);


        if (!!this.componentRef) {
            this.componentRef.instance.headers = <CommonInterface.IHeaderTable[]>[{ title: 'Booking Note', field: 'bookingNo' }];
            this.componentRef.instance.data = this.csBookingNotes;
            this.componentRef.instance.fields = ['bookingNo'];

            // * Listen Event.
            this.subscription = ((this.componentRef.instance) as AppComboGridComponent<csBookingNote>).onClick.subscribe(
                (bookingNote: csBookingNote) => {
                    this.updateDataFromBookingNo(bookingNote);
                    this.subscription.unsubscribe();
                    this.viewContainerRef.viewContainerRef.clear();
                });

            ((this.componentRef.instance) as AppComboGridComponent<csBookingNote>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        this.viewContainerRef.viewContainerRef.clear();
                    }
                );
        }
    }

    updateDataFromBookingNo(bookingNote: csBookingNote) {
        const formData: IBookingNoteSyncFormHBL = {
            bookingNo: bookingNote.bookingNo,
            shipper: bookingNote.shipperId,
            consignee: bookingNote.consigneeId,
            placeDelivery: bookingNote.placeOfDelivery,
            shipperDescription: bookingNote.shipperDescription,
            consigneeDescription: bookingNote.consigneeDescription
        };
        this.formCreate.patchValue(formData);

    }

    updateOnboardStatus() {
        if (!!this.issueHbldate.value && !!this.formCreate.controls['onBoardStatus'].value) {
            let onBoardStatus = this.formCreate.controls['onBoardStatus'].value.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim());
            if (onBoardStatus.length > 1) {
                onBoardStatus = onBoardStatus[1].split(',').map(item => item.trim());
                this.formCreate.controls['onBoardStatus'].setValue(this.setDefaultOnboard(onBoardStatus[0], onBoardStatus[1], this.issueHbldate.value.startDate));
            }
        }
    }
}

interface IBookingNoteSyncFormHBL {
    shipper: string;
    consignee: string;
    bookingNo: string;
    placeDelivery: string;
    shipperDescription: string;
    consigneeDescription: string;
}
