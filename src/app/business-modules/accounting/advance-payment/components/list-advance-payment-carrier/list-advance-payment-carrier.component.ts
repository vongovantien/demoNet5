import { ChangeDetectorRef, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AppList } from '@app';
import { ComboGridVirtualScrollComponent } from '@common';
import { SystemConstants } from '@constants';
import { CommonEnum } from '@enums';
import { AdvancePaymentRequest, ChargeGroup, Currency, Surcharge, Unit } from '@models';
import { Store } from '@ngrx/store';
import { CatalogueRepo, DocumentationRepo, SystemRepo } from '@repositories';
import { DataService } from '@services';
import { GetCatalogueCurrencyAction, getCatalogueCurrencyState, GetCatalogueUnitAction, getCatalogueUnitState, IAppState } from '@store';
import { cloneDeep } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'list-advance-payment-carrier',
  templateUrl: './list-advance-payment-carrier.component.html',
  styleUrls: ['./list-advance-payment-carrier.component.scss']
})
export class ListAdvancePaymentCarrierComponent extends AppList implements OnInit {
  @ViewChildren('comboGridCharge') comboGridCharges: QueryList<ComboGridVirtualScrollComponent>;
  @Input() state: string = 'update';
  @Input() statusApproval: string = '';
  listAdvanceCarrier: any[] = [];
  listCharges: any[];
  types: CommonInterface.ICommonTitleValue[];
  configShipmentDisplayFields = [
    { field: 'jobNo', label: 'JobNo' },
    { field: 'mblNo', label: 'MBL No' },
    { field: 'hblNo', label: 'HBL No' },
    { field: 'customNo', label: 'Custom No' },
  ];

  configChargeDisplayFields = [
    { field: 'chargeNameEn', label: 'Name' },
    { field: 'unitPrice', label: 'Unit Price' },
    { field: 'unit', label: 'Unit' },
    { field: 'code', label: 'Code' },
  ];

  configShipment: CommonInterface.IComboGirdConfig = {
    placeholder: 'Please select',
    displayFields: [],
    dataSource: [],
    selectedDisplayFields: [],
  };
  initShipments: OperationInteface.IShipment[];
  listCurrency: Observable<Currency[]>;
  listChargeGroup: Observable<ChargeGroup[]>;
  
  currency: string = 'VND';
  isUpdate: boolean = false;
  isSubmitted: boolean = false;
  listUnits: Observable<Unit[]>;
  advForType: string = 'HBL';
  totalAmount: number = 0;
  advanceNo: string = '';
  serviceTypeId: string = null;
  payeeId: string = null;

  constructor(
    private _catalogueRepo: CatalogueRepo,
    private _documentationRepo: DocumentationRepo,
    private _systemRepo: SystemRepo,
    private _store: Store<IAppState>,
    private _toastService: ToastrService,
    private _cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.headers = [
      { title: 'Shipment info', field: '', sortable: true, width: 330 },
      { title: 'Discription', field: 'chargeNameEn', sortable: true, width: 250 },
      { title: 'Qty', field: 'quantity', sortable: true },
      { title: 'Unit', field: 'unitId', sortable: true },
      { title: 'Unit Price', field: 'unitPrice', sortable: true },
      { title: 'VAT', field: 'vatrate', sortable: true },
      { title: 'Total', field: 'amount', sortable: true },
      { title: 'Currency', field: 'currencyId', sortable: true },
      { title: 'Custom No', field: 'clearanceNo', sortable: true, required: false },
      { title: 'Type', field: 'type', sortable: true },
      { title: 'Note', field: 'requestNote', sortable: true },
      { title: 'Settle Status', field: 'statusPayment', sortable: true },
    ];

    this.types = [
      { title: 'Norm', value: 'Norm' },
      { title: 'Invoice', value: 'Invoice' },
      { title: 'Other', value: 'Other' },
    ];
    this._store.dispatch(new GetCatalogueUnitAction());
    this.getCharges();
    this.getUnits();
    this.getListShipment(this.advForType);
    this.getCurrency();
    this.getChargeGroup();
    this._cd.detectChanges();
  }

  // Get charges with services access
  getCharges() {
    this._systemRepo.getListServiceByPermision()
      .pipe(catchError(this.catchError))
      .subscribe(
        (res: any) => {
          if (!!res) {
            let serviceList: string[] = [];
            res.forEach(element => {
              serviceList.push(element.value)
            });
            this._catalogueRepo.getListChareByServiceAccess(serviceList, CommonEnum.CHARGE_TYPE.CREDIT)
              .pipe(
              ).subscribe(
                (res: any[]) => {
                  this.listCharges = [...res];
                }
              );
          }
        },
      );

  }
  getUnits() {
    this.listUnits = this._store.select(getCatalogueUnitState);
  }

  getCurrency() {
    this._store.dispatch(new GetCatalogueCurrencyAction());
    this.listCurrency = this._store.select(getCatalogueCurrencyState);
  }

  onSelectUnit(unitId: number, charge: any) {
    this.listUnits.subscribe(
      (units: Unit[] = []) => {
        const selectedUnit: Unit = units.find(u => u.id === unitId);
        if (selectedUnit) {
          charge.unitId = unitId;
        }
      });
  }

  getListShipment(type: string) {
    this._documentationRepo.getShipmentAssginPICCarrier(type)
      .pipe(catchError(this.catchError))
      .subscribe(
        (res: OperationInteface.IShipment) => {
          this.advForType = type;
          this.configShipment.dataSource = [...this.configShipment.dataSource, ...<any>res || []];
          this.configDisplayShipment(type);
        },
        (errors: any) => { },
        () => { }
      );
  }

  configDisplayShipment(type: string) {
    // * update config combogrid.
    if (type === 'HBL') {
      this.configShipment.displayFields = [
        { field: 'jobId', label: 'Job No' },
        { field: 'mbl', label: 'MBL' },
        { field: 'hbl', label: 'HBL' },
        { field: 'customNo', label: 'Custom No' },
      ];
      this.configShipment.selectedDisplayFields = ['jobId', `mbl`, 'hbl'];
    }
    if (type === 'MBL') {
      this.configShipment.displayFields = [
        { field: 'jobId', label: 'Job No' },
        { field: 'mbl', label: 'MBL' },
        { field: '', label: 'HBL' },
        { field: 'customNo', label: 'Custom No' },
      ];
      this.configShipment.selectedDisplayFields = ['jobId', `mbl`];
    }
  }

  duplicateShipment(index: number) {
    this.isSubmitted = false;
    const newShipment = cloneDeep(this.listAdvanceCarrier[index]);
    newShipment.id = SystemConstants.EMPTY_GUID;
    this.listAdvanceCarrier.push(newShipment);
  }

  deleteShipment(index: number) {
    this.isSubmitted = false;
    this.listAdvanceCarrier.splice(index, 1);
  }

  calculateTotal(vat: number, quantity: number, unitPrice: number, charge: any) {
    this.isSubmitted = false;
    if (this.currency === 'VND') {
      charge.total = Math.round(this.utility.calculateTotalAmountWithVat(vat || 0, quantity, unitPrice));
    } else {
      charge.total = (Math.round(this.utility.calculateTotalAmountWithVat(vat || 0, quantity, unitPrice) * 1000)) / 1000;
    }
  }

  calculateTotalAmount() {
    try {
      this.totalAmount = 0;
      this.listAdvanceCarrier.forEach(x => {
        this.totalAmount += x.total;
      });
      return this.totalAmount;
    } catch (error) {
      this._toastService.error(error + '', 'Không lấy được amount');
    }
  }

  getChargeGroup() {
    this.listChargeGroup = this._catalogueRepo.getChargeGroup().pipe(shareReplay());
  }

  onSelectDataTableInfo(data: any, adv: any, type: string) {
    this.isSubmitted = false;
    adv.isDuplicate = false;
    switch (type) {
      case 'shipment':
        adv.jobId = data.jobId;
        adv.mbl = data.mbl;
        adv.hbl = data.hbl;
        adv.hblid = data.hblid;
        adv.clearanceNo = data.customNo;
        adv.customNo = data.customNo;
        break;

      case 'charge':
        adv.chargeCode = data.code;
        adv.chargeId = data.id;
        adv.chargeGroup = data.chargeGroup;
        adv.type = this.updateChargeType(data.type);
        let charges = [];
        this.listChargeGroup.subscribe((res: ChargeGroup[]) => {
          if (!!res) {
            charges = res;
            const chargeGrp = (charges || []).find(x => x.id === adv.chargeGroup);
            if (chargeGrp && chargeGrp.name === 'Com') {
              adv.kickBack = true;
            } else {
              adv.kickBack = false;
            }
          }
        });
        // * Unit, Unit Price had value
        if (!adv.unitId || adv.unitPrice == null) {
          this.listUnits.pipe(
            switchMap((units: Unit[]) => of(units.find(u => u.id === data.unitId))),
          ).subscribe(
            (unit: Unit) => {
              adv.unitId = unit.id;
              adv.unitPrice = data.unitPrice;

              this.calculateTotal(adv.vatrate, adv.quantity, adv.unitPrice, adv);
            }
          );
        }
        break;
    }
  }

  updateChargeType(type: string) {
    switch (type) {
      case CommonEnum.CHARGE_TYPE.CREDIT:
        return CommonEnum.SurchargeTypeEnum.BUYING_RATE;
      case CommonEnum.CHARGE_TYPE.DEBIT:
        return CommonEnum.SurchargeTypeEnum.SELLING_RATE;
      default:
        return CommonEnum.SurchargeTypeEnum.OBH;
    }
  }

  getListAdvRequest() {
    let listRequest: AdvancePaymentRequest[] = [];
    this.listAdvanceCarrier.forEach((item: any) => {
      let advRequest = new AdvancePaymentRequest(item);
      advRequest.id = SystemConstants.EMPTY_GUID;
      advRequest.advanceNo = this.advanceNo;
      advRequest.customNo = item.clearanceNo;
      let charge = new Surcharge(item);
      charge.paymentObjectId = this.payeeId;
      if (!listRequest.length || listRequest.filter(x => x.hblid === advRequest.hblid && x.customNo === advRequest.customNo && x.advanceType === advRequest.advanceType).length === 0) {
        listRequest = [...listRequest, advRequest];

      }
      listRequest.filter(x => x.hblid === advRequest.hblid && x.customNo === advRequest.customNo && x.advanceType === advRequest.advanceType)[0].surcharge.push(charge);
    })
    return listRequest;
  }

  addShipment() {
    this.isSubmitted = false;
    this.listAdvanceCarrier.push({
      id: SystemConstants.EMPTY_GUID,
      chargeId: null,
      chargeCode: null,
      chargeGroup: null,
      kickBack: false,
      jobId: null,
      mbl: null,
      hbl: null,
      requestCurrency: this.currency,
      currencyId: this.currency,
      hblid: null,
      settlementCode: null,
      clearanceNo: null,
      unitId: null,
      unitPrice: null,
      vatrate: null,
      total: 0,
      advanceNo: null,
      originAdvanceNo: null,
      quantity: 1,
      advanceType: this.types[2].value,
      notes: null,
      type: null,
      amount: 0,
      statusPayment: null
    });
  }

  setListAdvRequest(listRequest: AdvancePaymentRequest[]) {
    this.listAdvanceCarrier = [];
    listRequest.forEach((item: AdvancePaymentRequest) => {
      item.surcharge.forEach((it: Surcharge) => this.listAdvanceCarrier.push({
        id: it.id,
        chargeId: it.chargeId,
        // chargeCode: null,
        chargeGroup: it.chargeGroup,
        kickBack: it.kickBack,
        jobId: it.jobId,
        mbl: it.mbl,
        hbl: it.hbl,
        requestCurrency: this.currency,
        currencyId: it.currencyId,
        hblid: it.hblid,
        settlementCode: it.settlementCode,
        clearanceNo: it.clearanceNo,
        unitId: it.unitId,
        unitPrice: it.unitPrice,
        vatrate: it.vatrate,
        total: it.total,
        advanceNo: it.advanceNo,
        originAdvanceNo: it.advanceNo,
        quantity: it.quantity,
        advanceType: item.advanceType,
        notes: it.notes,
        type: it.type,
        amount: item.amount,
        statusPayment: item.statusPayment
      }))
    })
  }

  checkValidate() {
    for (const charge of this.listAdvanceCarrier) {
      if (
        !charge.hblid
        || !charge.chargeId
        || charge.quantity === null
        || !charge.unitId
        || charge.unitPrice === null
        || charge.quantity < 0
        || charge.vatrate > 100
      ) {
        return false;
      }
    }
    return true;
  }
}
