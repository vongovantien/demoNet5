import { Component, OnInit, Output, EventEmitter, QueryList, ViewChildren, ViewChild, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

import { CustomDeclaration, Surcharge, Partner, Unit } from '@models';
import { CatalogueRepo, DocumentationRepo, OperationRepo, AccountingRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { PopupBase } from '@app';
import { ComboGridVirtualScrollComponent } from '@common';
import { IAppState, GetCatalogueUnitAction, getCatalogueUnitState, getCurrentUserState } from '@store';
import { SystemConstants } from '@constants';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';

import cloneDeep from 'lodash/cloneDeep';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, takeUntil, filter, tap, startWith } from 'rxjs/operators';


@Component({
    selector: 'table-list-charge-popup',
    templateUrl: './table-list-charge.component.html',
    styleUrls: ['./table-list-charge.component.scss']
})

export class SettlementTableListChargePopupComponent extends PopupBase implements OnInit {
    @Output() onChange: EventEmitter<Surcharge[]> = new EventEmitter<Surcharge[]>();
    @Output() onUpdate: EventEmitter<Surcharge[]> = new EventEmitter<Surcharge[]>();
    @ViewChildren('comboGridCharge') comboGridCharges: QueryList<ComboGridVirtualScrollComponent>;
    @ViewChild('comboGridAdv') comboGridAdv: ComboGridVirtualScrollComponent;

    headers: CommonInterface.IHeaderTable[];
    headerPartner: CommonInterface.IHeaderTable[] = [];
    partnerType: CommonInterface.IValueDisplay[];

    listCharges: any[];
    listUnits: Observable<Unit[]>;
    shipments: OperationInteface.IShipment[];
    cds: CustomDeclaration[];
    advs: IAdvanceShipment[] = [];
    listPartner: Partner[] = [];
    listPartnerOBH: Partner[] = [];


    selectedShipment: OperationInteface.IShipment;
    selectedCD: CustomDeclaration;
    selectedAdvance: IAdvanceShipment;

    configChargeDisplayFields: CommonInterface.IComboGridDisplayField[];
    configShipmentDisplayFields: CommonInterface.IComboGridDisplayField[];
    configAdvanceDisplayFields: CommonInterface.IComboGridDisplayField[];
    configCustomDisplayFields: CommonInterface.IComboGridDisplayField[];

    formGroup: FormGroup;
    shipment: AbstractControl;
    customNo: AbstractControl;
    advanceNo: AbstractControl;

    serviceTypeId: string; // * service id for get charge catalogue.
    currencyId: string = 'VND'; // * Currency from form create.
    settlementCode: string = null; // * Settlement Code current if update, === null if create.

    charges: Surcharge[] = [];

    isUpdate: boolean = false;
    isSelected: boolean = true;

    initShipments: OperationInteface.IShipment[];
    initCDs: CustomDeclaration[] = [];


    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _documentRepo: DocumentationRepo,
        private _operationRepo: OperationRepo,
        private _accountingRepo: AccountingRepo,
        private _fb: FormBuilder,
        private _toastService: ToastrService,
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Name', field: 'chargeNameEn', sortable: true, required: true, width: 250 },
            { title: 'Payee', field: 'payerName', sortable: true, required: true, width: 250 },
            { title: 'Qty', field: 'quantity', sortable: true, required: true },
            { title: 'Unit', field: 'unitId', sortable: true, required: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true, required: true },
            { title: 'Currency', field: 'currencyId', sortable: true, required: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total Amount', field: 'amount', sortable: true },
            { title: 'OBH Partner', field: 'partnerName', sortable: true, required: false, width: 250 },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Serie No', field: 'serieNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'VAT Partner', field: 'vatPartnerId', sortable: true, width: 250 },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Cont No', field: 'contNo', sortable: true },
            { title: 'AdvanceNo', field: 'advanceno', sortable: true },
            { title: 'Synced From', field: 'syncedFrom', sortable: true },
        ];

        this.configChargeDisplayFields = [
            { field: 'chargeNameEn', label: 'Name' },
            { field: 'unitPrice', label: 'Unit Price' },
            { field: 'unit', label: 'Unit' },
            { field: 'code', label: 'Code' },
        ];

        this.configShipmentDisplayFields = [
            { field: 'jobId', label: 'JobID' },
            { field: 'mbl', label: 'MBL' },
            { field: 'hbl', label: 'HBL' },
        ];

        this.configAdvanceDisplayFields = [
            { field: 'advanceNo', label: 'Advance No' },
            { field: 'amount', label: 'Amount' },
            { field: 'requestCurrency', label: 'Currency' },
            { field: 'requestDate', label: 'Request Date' },
        ];

        this.configCustomDisplayFields = [
            { field: 'clearanceNo', label: 'Custom No' },
            { field: 'jobNo', label: 'JobID' },
        ];

        this.partnerType = [
            { displayName: 'Customer', value: CommonEnum.PartnerGroupEnum.CUSTOMER, fieldName: 'CUSTOMER' },
            { displayName: 'Carrier', value: CommonEnum.PartnerGroupEnum.CARRIER, fieldName: 'CARRIER' },
            { displayName: 'Agent', value: CommonEnum.PartnerGroupEnum.AGENT, fieldName: 'AGENT' },
        ];

        this.headerPartner = [
            { title: 'Name', field: 'partnerNameEn' },
            { title: 'Partner Code', field: 'taxCode' },
            { title: 'Name ABBR', field: 'shortName' },
        ];

        this._store.dispatch(new GetCatalogueUnitAction());

        this.getMasterCharges();
        this.getShipmentCommonData();
        this.getCustomDecleration();
        this.initForm();
        this.getPartner();
        this.getUnits();

        this._store.select(getCurrentUserState)
            .pipe(
                filter(c => !!c.userName),
                switchMap((currentUser: SystemInterface.IClaimUser | any) => {
                    if (!!currentUser.userName) {
                        return this._catalogueRepo.getPartnerByGroups(
                            [CommonEnum.PartnerGroupEnum.CUSTOMER, CommonEnum.PartnerGroupEnum.AGENT],
                            true,
                            null,
                            currentUser?.officeId
                        ).pipe(startWith([]))
                    }
                }),
                takeUntil(this.ngUnsubscribe),
            ).subscribe((partner: Partner[]) => {
                this.listPartnerOBH = partner;
            })
    }

    initForm() {
        this.formGroup = this._fb.group({
            shipment: [],
            customNo: [],
            advanceNo: []
        });

        this.shipment = this.formGroup.controls['shipment'];
        this.customNo = this.formGroup.controls['customNo'];
        this.advanceNo = this.formGroup.controls['advanceNo'];
    }

    getShipmentCommonData() {
        this._documentRepo.getShipmentAssginPIC().pipe(catchError(this.catchError))
            .subscribe(
                (res: OperationInteface.IShipment[]) => {
                    this.shipments = this.initShipments = res;
                }
            );
    }

    getCustomDecleration() {
        this._operationRepo.getListCustomNoAsignPIC()
            .pipe(
                catchError(this.catchError),
                map((response: any[]) => response.map((item: CustomDeclaration) => new CustomDeclaration(item))),
            )
            .subscribe(
                (res: any) => {
                    this.cds = this.initCDs = res || [];
                },
            );
    }

    getAdvances(jobNo: string, hblId: string, isUpdateFControl: boolean = true, settleCode: string = null) {
        this._accountingRepo.getAdvanceOfShipment(jobNo, hblId, settleCode)
            .pipe(
                catchError(this.catchError),
                map((res: IAdvanceShipment[]) => {
                    res.forEach((item: IAdvanceShipment) => {
                        item.requestDate = formatDate(item.requestDate, 'dd/MM/yyyy', 'en');
                    });
                    return res;
                })
            ).subscribe(
                (res: any[] = []) => {
                    this.advs = res;

                    // ? Have rewrite default value
                    if (!this.advanceNo.value && isUpdateFControl) {
                        const advance: IAdvanceShipment = this.advs.find(i => i.jobId === this.selectedShipment.jobId);
                        if (!!advance) {
                            this.advanceNo.setValue(advance.advanceNo);
                            this.selectedAdvance = advance;
                        } else {
                            this.selectedAdvance = null;
                        }
                    }
                    if (!this.advs) {
                        this.selectedAdvance = null;
                    }

                    if (!isUpdateFControl) {
                        this.comboGridAdv.displaySelectedStr = '';
                    }
                }
            );
    }

    getPartner() {
        const customersFromService = this._catalogueRepo.getCurrentCustomerSource();
        if (!!customersFromService.data.length) {
            this.listPartner = customersFromService.data;
            return;
        }
        this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL).subscribe(
            (data) => {
                this._catalogueRepo.customersSource$.next({ data }); // * Update service.
                this.listPartner = data;
            }
        );
    }

    getUnits() {
        this.listUnits = this._store.select(getCatalogueUnitState);
    }

    getMasterCharges(serviceTypeId: string = null, isChangeService: boolean = false) {
        forkJoin([
            this._catalogueRepo.getListCharge(null, null, { active: true, type: CommonEnum.CHARGE_TYPE.CREDIT, serviceTypeId: serviceTypeId }),
            this._catalogueRepo.getListCharge(null, null, { active: true, type: CommonEnum.CHARGE_TYPE.OBH, serviceTypeId: serviceTypeId }),
            this._catalogueRepo.getListCharge(null, null, { active: true, type: CommonEnum.CHARGE_TYPE.OTHER, serviceTypeId: serviceTypeId }),
        ]).pipe(
            map(([chargeCredit, chargeOBH, chargeOther]) => {
                return [...chargeCredit, ...chargeOBH, ...chargeOther];
            })
        ).subscribe(
            (res: any[]) => {
                this.listCharges = [...res];
                if (isChangeService) {
                    this.charges.forEach((charge: Surcharge) => {
                        if (charge.chargeId) {
                            charge.chargeId = null;
                            charge.id = SystemConstants.EMPTY_GUID;
                            charge.chargeName = null;
                            charge.isChangeShipment = true;
                        }
                    });

                    this.comboGridCharges.forEach(c => {
                        c.displaySelectedStr = '';
                    });
                }
            }
        );
    }

    onSelectShipmentData(data: OperationInteface.IShipment | IAdvanceShipment | any) {
        this.serviceTypeId = data.service;
        this.selectedShipment = data;

        this.resetAdvanceData();

        this.customNo.setValue(null);
        this.getAdvances(this.selectedShipment.jobId, this.selectedShipment.hblid, true, this.settlementCode);

        this.shipment.setValue(this.selectedShipment.hblid);

        const _customDeclarations = this.filterCDByShipment(data);

        if (_customDeclarations.length > 0) {
            this.selectedCD = _customDeclarations[0];
            this.customNo.setValue(_customDeclarations[0].clearanceNo);
        }
        let selectedCharges = this.charges.filter((chg: Surcharge) => chg.isSelected && !chg.hadIssued); // Update shipment for selected charges without issued
        let notSelectedCharges = this.charges.filter((chg: Surcharge) => selectedCharges.filter(x => x.id === chg.id).length === 0);
        if (!!selectedCharges.length) {
            if (this.utility.getServiceType(selectedCharges[0].jobId) !== this.utility.getServiceType(data.jobId)) {
                this.getMasterCharges(this.serviceTypeId, true);
            }
            if (selectedCharges[0].hblid !== data.hblid) {
                selectedCharges.forEach((charge: Surcharge) => {
                    charge.isChangeShipment = true;
                    charge.id = SystemConstants.EMPTY_GUID;
                });
            }
            for (const charge of selectedCharges) {
                charge.jobId = this.selectedShipment.jobId;
                charge.jobNo = this.selectedShipment.jobId;
                charge.mblno = this.selectedShipment.mbl;
                charge.mbl = this.selectedShipment.mbl;
                charge.hblno = this.selectedShipment.hbl;
                charge.hbl = this.selectedShipment.hbl;
                charge.hblid = this.selectedShipment.hblid;
                charge.advanceNo = charge.originAdvanceNo = this.advanceNo.value;
            }
            this.charges = [...selectedCharges, ...notSelectedCharges];
        }
    }

    onSelectClearanceData(data: OperationInteface.IShipment | IAdvanceShipment | any) {
        this.selectedCD = data;
        this.customNo.setValue(data.clearanceNo);

        this.resetAdvanceData();

        const _shipments = this.filterShipmentByCD(data);
        if (_shipments.length > 0) {
            this.shipment.setValue(_shipments[0].hblid);
            this.selectedShipment = _shipments[0];

            let selectedCharges = this.charges.filter((chg: Surcharge) => chg.isSelected && !chg.hadIssued); // Update clearance no for selected charges without issued
            let notSelectedCharges = this.charges.filter((chg: Surcharge) => selectedCharges.filter(x => x.id === chg.id).length === 0);
            if (!!selectedCharges.length) {
                if (this.utility.getServiceType(selectedCharges[0].jobId) !== this.utility.getServiceType((data as CustomDeclaration).jobNo)) {
                    this.getMasterCharges(this.serviceTypeId, true);
                }
                if (selectedCharges[0].hblid !== data.hblid) {
                    selectedCharges.forEach((charge: Surcharge) => {
                        charge.isChangeShipment = true;
                        charge.id = SystemConstants.EMPTY_GUID;
                    });
                }
                for (const charge of selectedCharges) {
                    charge.jobId = this.selectedShipment.jobId;
                    charge.jobNo = this.selectedShipment.jobId;
                    charge.mblno = this.selectedShipment.mbl;
                    charge.mbl = this.selectedShipment.mbl;
                    charge.hblno = this.selectedShipment.hbl;
                    charge.hbl = this.selectedShipment.hbl;
                    charge.hblid = this.selectedShipment.hblid;
                    charge.clearanceNo = data.clearanceNo;
                    charge.advanceNo = charge.originAdvanceNo = this.advanceNo.value;
                }
                
                this.charges = [...selectedCharges, ...notSelectedCharges]
            }

            this.getAdvances(data.jobNo, data.hblid, true, this.settlementCode);

        } else {
            this.selectedAdvance = null;
        }
    }

    onSelectDataFormInfo(data: OperationInteface.IShipment | IAdvanceShipment | any, type: string) {
        if (this.charges.length > 0 && this.charges.filter((chg: Surcharge) => chg.isSelected).length === 0){
            return;
        }
        this.isSubmitted = false;

        switch (type) {
            case 'shipment':
            case 'cd':
                if(this.charges.length > 0){
                let selectedCharges = this.charges.filter((chg: Surcharge) => chg.isSelected); // Update selected charges
                let notSelectedCharges = this.charges.filter((chg: Surcharge) => !chg.isSelected);
                selectedCharges.forEach((chg: Surcharge) => chg.invoiceDate = null);
                this._accountingRepo.checkAllowUpdateDirectCharges(selectedCharges)
                    .subscribe(
                        (res: any) => {
                            if (!!res.data) {
                                this._toastService.warning(res.message);
                                res.data.forEach(element => {
                                    selectedCharges.filter((chg: Surcharge)=> chg.id === element.id).map((chg: Surcharge)=> {
                                        chg.creditNo = element.creditNo;
                                        chg.debitNo = element.debitNo;
                                        chg.soano = element.soano;
                                        chg.paySoano = element.paySoano;
                                        chg.linkChargeId = element.linkChargeId;
                                        chg.voucherId = element.voucherId;
                                        chg.voucherIdre = element.voucherIdre;
                                        chg.syncedFrom = element.syncedFrom;
                                        chg.paySyncedFrom = element.syncedFrom;
                                    })
                                });
                                this.charges = [...selectedCharges, ...notSelectedCharges]
                                type === "shipment" ? this.onSelectShipmentData(data) : this.onSelectClearanceData(data);
                            } 
                            else {
                                type === "shipment" ? this.onSelectShipmentData(data) : this.onSelectClearanceData(data);
                            }
                        }
                    );
                }else{
                    type === "shipment" ? this.onSelectShipmentData(data) : this.onSelectClearanceData(data);
                }
                break;
            case 'advanceNo':
                if (!!this.charges.length) {

                    this.charges.forEach(element => {
                        if (element.advanceNo == this.advanceNo.value && element.isSelected) {
                            element.advanceNo = element.originAdvanceNo = data.advanceNo;
                        }
                    });
                }
                this.selectedAdvance = data;
                this.advanceNo.setValue(data.advanceNo);
                break;
            case 'vat-partner':

                break;
            default:
                break;
        }
    }

    onSelectUnit(unitId: number, charge: Surcharge) {
        this.listUnits.subscribe(
            (units: Unit[] = []) => {
                const selectedUnit: Unit = units.find(u => u.id === unitId);
                if (selectedUnit) {
                    charge.unitName = selectedUnit.unitNameEn;
                    charge.unitId = unitId;
                }
            });
    }

    checkExistCharge(chargeId: string, charges: Surcharge[] = []) {
        if (!charges.length) {
            return false;
        }
        return charges.some((charge: Surcharge) => (charge.chargeId === chargeId));
    }

    filterCDByShipment(shipment: OperationInteface.IShipment): CustomDeclaration[] {
        return this.initCDs.filter((item: CustomDeclaration) => {
            return (item.jobNo === shipment.jobId);
        });
    }

    filterShipmentByCD(cd: CustomDeclaration): OperationInteface.IShipment[] {
        return this.initShipments.filter((item: OperationInteface.IShipment) => {
            return (item.jobId === cd.jobNo);
        });
    }

    onSelectDataTableInfo(data: any, chargeItem: Surcharge, type: string) {
        this.isSubmitted = false;
        chargeItem.isDuplicate = false;

        switch (type) {
            case 'charge':
                chargeItem.chargeCode = data.code;
                chargeItem.chargeName = data.chargeNameEn;
                chargeItem.chargeId = data.id;
                chargeItem.type = this.updateChargeType(data.type);
                chargeItem.chargeGroup = data.chargeGroup;
                // * Unit, Unit Price had value
                if (!chargeItem.unitId || chargeItem.unitPrice == null) {
                    this.listUnits.pipe(
                        switchMap((units: Unit[]) => of(units.find(u => u.id === data.unitId))),
                    ).subscribe(
                        (unit: Unit) => {
                            chargeItem.unitId = unit.id;
                            chargeItem.unitPrice = data.unitPrice;
                            chargeItem.unitName = unit.unitNameEn;

                            this.calculateTotal(chargeItem.vatrate, chargeItem.quantity, chargeItem.unitPrice, chargeItem);
                        }
                    );
                }

                // * Detect charge type
                if ((data.type || '').toLowerCase() !== CommonEnum.CHARGE_TYPE.OBH.toLowerCase()) {
                    chargeItem.obhPartnerName = null;
                } else {
                    this.headers = [...this.headers];
                    this.headers[8].required = true;

                    // * Auto set cstomer for OBH Partner
                    this.onSelectPartnerType(this.partnerType[0], chargeItem, 'obh-type');
                }

                break;
            case 'payer':
                chargeItem.payer = data.shortName;
                chargeItem.objectBePaid = 'OTHER';
                chargeItem.paymentObjectId = data.id;
                chargeItem.payerId = null;
                // chargeItem.obhPartnerName = '';
                break;
            case 'obh':
                const transactionType: string = this.utility.getServiceType(chargeItem.jobId) === 'CL' ? 'CL' : 'DOC';
                this._documentRepo.validateCheckPointContractPartner(data.id, chargeItem.hblid, transactionType, this.settlementCode)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                chargeItem.obhPartnerName = data.shortName;
                                chargeItem.obhId = data.id;
                                chargeItem.objectBePaid = null;
                                chargeItem.payerId = chargeItem.paymentObjectId;

                            } else {
                                this._toastService.warning(res.message);
                                chargeItem.obhPartnerName = chargeItem.obhId = chargeItem.objectBePaid = chargeItem.payerId = null;
                            }
                        }
                    )
                break;
            default:
                break;
        }

        this.onChangeInvoiceNo(chargeItem, chargeItem.invoiceNo);
    }

    onSelectPartnerType(partnerType: CommonInterface.IValueDisplay, chargeItem: Surcharge, type: string, ) {
        let partner: Partner;
        switch (type) {
            case 'partner-type':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        partner = this.getPartnerById(this.selectedShipment.customerId);
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        partner = this.getPartnerById(this.selectedShipment.carrierId);
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        partner = this.getPartnerById(this.selectedShipment.agentId);
                        break;
                    default:
                        break;
                }
                if (!!partner) {
                    chargeItem.paymentObjectId = partner.id;
                    chargeItem.payer = partner.shortName;
                }
                this.onChangeInvoiceNo(chargeItem, chargeItem.invoiceNo);
                break;
            case 'obh-type':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        partner = this.getPartnerById(this.selectedShipment.customerId, 'OBH');

                        const transactionType: string = this.utility.getServiceType(this.selectedShipment.jobId) === 'CL' ? 'CL' : 'DOC';
                        this._documentRepo.validateCheckPointContractPartner(partner.id, this.selectedShipment.hblid, transactionType, this.settlementCode)
                            .subscribe(
                                (res: CommonInterface.IResult) => {
                                    if (res.status) {
                                        if (!!partner) {
                                            chargeItem.obhId = partner.id;
                                            chargeItem.obhPartnerName = partner.shortName;
                                        }
                                    } else {
                                        this._toastService.warning(res.message);
                                        chargeItem.obhId = chargeItem.obhPartnerName = null;
                                    }
                                }
                            )
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        partner = this.getPartnerById(this.selectedShipment.carrierId);
                        if (!!partner) {
                            chargeItem.obhId = partner.id;
                            chargeItem.obhPartnerName = partner.shortName;
                        }
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        partner = this.getPartnerById(this.selectedShipment.agentId);
                        if (!!partner) {
                            chargeItem.obhId = partner.id;
                            chargeItem.obhPartnerName = partner.shortName;
                        }
                        break;
                    default:
                        break;
                }
                break;
        }

    }

    addCharge() {
        this.isSubmitted = false;
        this.charges.push(new Surcharge({
            isSelected: true,
            currencyId: this.currencyId,
            id: SystemConstants.EMPTY_GUID,
            hblid: this.selectedShipment.hblid,
            isFromShipment: false,
            jobId: this.selectedShipment.jobId,
            mbl: this.selectedShipment.mbl,
            hbl: this.selectedShipment.hbl,
            settlementCode: this.settlementCode,
            invoiceDate: null,
            clearanceNo: !!this.selectedCD ? this.selectedCD.clearanceNo : null,
            chargeId: null,
            unitId: null,
            advanceNo: !!this.selectedAdvance ? this.selectedAdvance.advanceNo : null,
            originAdvanceNo: !!this.selectedAdvance ? this.selectedAdvance.advanceNo : null,
            jobNo: this.selectedShipment.jobId,
            mblno: this.selectedShipment.mbl,
            hblno: this.selectedShipment.hbl,
            quantity: 1
        }));
    }

    duplicateCharge(index: number) {
        this.isSubmitted = false;

        const newCharge = cloneDeep(this.charges[index]);

        newCharge.currencyId = this.currencyId;
        newCharge.id = SystemConstants.EMPTY_GUID;
        newCharge.hblid = this.selectedShipment.hblid;
        newCharge.isFromShipment = false;
        newCharge.jobId = this.selectedShipment.jobId;
        newCharge.mbl = this.selectedShipment.mbl;
        newCharge.hbl = this.selectedShipment.hbl;
        newCharge.advanceNo = newCharge.originAdvanceNo = !!this.advanceNo ? this.advanceNo.value : null;
        newCharge.clearanceNo = !!this.selectedCD ? this.selectedCD.clearanceNo : null;
        newCharge.settlementCode = this.settlementCode;
        newCharge.debitNo = null;
        newCharge.creditNo = null;
        newCharge.soano = null;
        newCharge.paySoano = null;
        newCharge.syncedFromBy = null;
        newCharge.syncedFrom = null;
        newCharge.paySyncedFrom = null;
        newCharge.hasNotSynce = true;
        newCharge.hadIssued = false;
        newCharge.payeeIssued = false;
        newCharge.obhPartnerIssued = false;
        if (!newCharge.invoiceDate || !newCharge.invoiceDate.startDate) {
            newCharge.invoiceDate = null;
        }

        this.charges.push(new Surcharge(newCharge));
        // this.charges = [...this.charges, new Surcharge(newCharge)];
    }

    deleteCharge(index: number) {
        this.isSubmitted = false;
        const chargeDelete = this.charges[index];
        if(chargeDelete.hadIssued){
            this._toastService.warning('Charge already issued CDNote/Soa/Voucher cannot be delete.');
            return;
        } else{
            this.charges.splice(index, 1);
        }
    }

    // isWhiteSpace(input: any) {
    //     if (input != null) {
    //         if (input.trim().length === 0) {
    //             return true;
    //         }
    //     }
    //     if (input === null) {
    //         return true;
    //     }
    //     return false;
    // }

    saveChargeList() {
        this.isSubmitted = true;

        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }

        // for (const charge of this.charges) {
        //     if(!this.isWhiteSpace(charge.invoiceNo )&& this.isWhiteSpace(charge.seriesNo)){
        //         this._toastService.warning("Series No Must be fill in");
        //         return;
        //     }
        //     if(this.isWhiteSpace(charge.invoiceNo) && !this.isWhiteSpace(charge.seriesNo)){
        //         this._toastService.warning("Invoice No Must be fill in");
        //         return;
        //     }
        // }
        //}
        // if(this.selectedShipment.service==='CL'){
        //     for (const charge of this.charges) {
        //         if(charge.type.toLowerCase()===CommonEnum.CHARGE_TYPE.OBH.toLowerCase()){
        //             if(!this.utility.isWhiteSpace(charge.invoiceNo )&& this.utility.isWhiteSpace(charge.seriesNo)){
        //                 this._toastService.warning("Series No Must be fill in");
        //                 return;
        //             }
        //             if(this.utility.isWhiteSpace(charge.invoiceNo) && !this.utility.isWhiteSpace(charge.seriesNo)){
        //                 this._toastService.warning("Invoice No Must be fill in");
        //                 return;
        //             }
        //         }
        //     }
        // }


        const error = this.checkValidate();
        if (error < 0) {
            if (error === -1) {
                return;
            }
            if (error === -2) {
                this._toastService.warning("Payee must be different with OBH Partner.");
                return;
            }
        }

        if (!this.checkDuplicate()) {
            this._toastService.warning("The Charge code and InvoiceNo is duplicated");
            return;
        }

        const listChargesToSave = cloneDeep(this.charges);

        const formData = this.formGroup.getRawValue();

        for (const charge of listChargesToSave) {
            const date = charge.invoiceDate;
            if (typeof date !== 'string') {
                if (!!date && !!date.startDate) {
                    charge.invoiceDate = new Date(date.startDate);
                } else if (Object.prototype.toString.call(date) === '[object Date]') {
                    charge.invoiceDate = new Date(date);
                }
                else {
                    charge.invoiceDate = null;
                }
            }
            if (charge.finalExchangeRate <= 0) {
                charge.finalExchangeRate = null;
            }

            if (charge.type === CommonEnum.CHARGE_TYPE.OBH) {
                // swap để map field cho chage obh
                charge.payerId = charge.paymentObjectId;
                charge.paymentObjectId = charge.obhId;
            }
            if (!charge.isSelected || charge.linkChargeId || charge.hadIssued) {continue;}
            // *start: cập nhật shipment charges
            charge.clearanceNo = formData.customNo;
            // charge.advanceNo = formData.advanceNo;
            charge.jobId = this.selectedShipment.jobId;
            charge.jobNo = this.selectedShipment.jobId;
            charge.mblno = this.selectedShipment.mbl;
            charge.mbl = this.selectedShipment.mbl;
            charge.hblno = this.selectedShipment.hbl;
            charge.hbl = this.selectedShipment.hbl;
            charge.hblid = this.selectedShipment.hblid;
            charge.advanceNo = charge.originAdvanceNo = this.advanceNo.value;
            // *end: cập nhật shipment charges
        }
        console.log('listChargesToSave', listChargesToSave);
        if (this.isUpdate) {
            this.onUpdate.emit(listChargesToSave);
        } else {
            this.onChange.emit(listChargesToSave);
        }
        this.hide();
    }

    calculateTotal(vat: number, quantity: number, unitPrice: number, chargeItem: Surcharge) {
        this.isSubmitted = false;
        if (chargeItem.currencyId === 'VND') {
            chargeItem.total = Math.round(this.utility.calculateTotalAmountWithVat(vat || 0, quantity, unitPrice));
        } else {
            chargeItem.total = (Math.round(this.utility.calculateTotalAmountWithVat(vat || 0, quantity, unitPrice) * 1000)) / 1000;
        }
    }

    getPartnerById(id: string, type: string = 'BUY') {
        if (type === 'OBH') {
            return this.listPartnerOBH.find((p: Partner) => p.id === id);
        }
        return this.listPartner.find((p: Partner) => p.id === id);
    }

    initTableListCharge() {
        this.charges = [];
    }

    checkValidate() {
        let errorCode: number = 1;
        for (const charge of this.charges) {
            if (
                !charge.paymentObjectId
                || !charge.chargeId
                || charge.quantity === null
                || !charge.unitId
                || charge.unitPrice === null
                || charge.quantity < 0
                // || charge.unitPrice < 0
                || charge.vatrate > 100
                || charge.type.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase() && !charge.obhId

            ) {
                errorCode = -1;
                break;
            }

            if (charge.type.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase() && charge.obhId === charge.paymentObjectId) {
                errorCode = -2;
                break;
            }
        }
        return errorCode;
    }

    checkDuplicate() {
        let valid: boolean = true;
        const chargeIdInvoiceGroup = this.charges.map(c => {
            if (!!c.invoiceNo) {
                if (!!c.notes) {
                    return c.chargeId + c.invoiceNo + c.notes;
                }
                return c.chargeId + c.invoiceNo;
            }
            return null;
        }).filter(x => Boolean(x));   // * charge + Invoice

        const hasDuplicate: boolean = new Set(chargeIdInvoiceGroup).size !== chargeIdInvoiceGroup.length;

        if (hasDuplicate) {
            const arrayDuplicates = [...new Set(this.utility.findDuplicates(chargeIdInvoiceGroup))];
            // const chargeMatchId: any[] = arrayDuplicates.map((c: string) => c.match(SystemConstants.CPATTERN.GUID));

            // const chargeIds: string[] = [].concat.apply([], chargeMatchId);
            let isDup: boolean = false;
            this.charges.forEach((c: Surcharge) => {
                isDup = !!c.notes ? arrayDuplicates.includes(c.chargeId + c.invoiceNo + c.notes) : arrayDuplicates.includes(c.chargeId + c.invoiceNo);

                c.isDuplicate = isDup;
            });
            valid = false;
        } else {
            valid = true;
            this.charges.forEach((c: Surcharge) => { c.isDuplicate = false });
        }

        return valid;
    }

    resetFormControl(control: FormControl | AbstractControl) {
        if (!!control && control instanceof FormControl) {
            control.setValue(null);
            control.markAsUntouched({ onlySelf: true });
            control.markAsPristine({ onlySelf: true });
        }
    }

    updateChargeType(type: string) {
        switch (type) {
            case CommonEnum.CHARGE_TYPE.CREDIT:
                return CommonEnum.SurchargeTypeEnum.BUYING_RATE;
            case CommonEnum.CHARGE_TYPE.DEBIT:
                return CommonEnum.SurchargeTypeEnum.SELLING_RATE;
            case CommonEnum.CHARGE_TYPE.OTHER:
                return CommonEnum.SurchargeTypeEnum.OTHER;
            default:
                return CommonEnum.SurchargeTypeEnum.OBH;
        }
    }

    removeAdvanceNo() {
        this.charges.forEach(element => {
            if (element.advanceNo == this.advanceNo.value && element.isSelected) {
                element.advanceNo = element.originAdvanceNo = null;
            }
        });
        this.resetFormControl(this.advanceNo);
        this.selectedAdvance = null;
    }

    resetAdvanceData() {
        this.advanceNo.reset();
        this.comboGridAdv.displaySelectedStr = '';
        this.advs.length = 0;
    }

    onChangeInvoiceNo(chargeItem: Surcharge, invNo: string) {
        if (invNo) {
            if (!!chargeItem.chargeId) {
                // switch (chargeItem.type) {
                //     case CommonEnum.SurchargeTypeEnum.OBH:
                //         chargeItem.vatPartnerId = chargeItem.obhId;
                //         break;
                //     case CommonEnum.SurchargeTypeEnum.BUYING_RATE:
                //         chargeItem.vatPartnerId = chargeItem.paymentObjectId;
                //         break;
                //     default:
                //         break;
                // }
                chargeItem.vatPartnerId = chargeItem.paymentObjectId;
            }
        }
    }

    checkUncheckAllCharge() {
        this.charges.forEach(c => c.isSelected = this.isSelected);
    }

    onChangeCheckBoxCharge() {
        this.isSelected = this.charges.every(c => c.isSelected);
    }
}

interface IAdvanceShipment {
    id: string;
    requestDate: string;
    jobId: string;
    hbl: string;
    mbl: string;
    amount: number;
    requestCurrency: string;
    advanceNo: string;
}


