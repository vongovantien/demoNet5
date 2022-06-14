import { BaseModel } from "../base.model";
import { DIM } from "./dimension";
import { PermissionHouseBill } from "./permissionHouseBill";
import { CsOtherCharge } from "./csOtherCharge";

export class HouseBill extends BaseModel {
    id: string = '00000000-0000-0000-0000-000000000000';
    active: boolean = null;
    alsoNotifyPartyDescription: string = null;
    alsoNotifyPartyId: string = null;
    arrivalFirstNotice: string = null;
    arrivalFooter: string = null;
    arrivalHeader: string = null;
    arrivalNo: string = null;
    arrivalSecondNotice: string = null;
    cbm: number = null;
    chargeWeight: number = null;
    closingDate: string = null;
    coloaderId: string = null;
    commodity: string = null;
    consigneeDescription: string = null;
    consigneeId: string = null;
    consigneeName: string = null;
    contSealNo: string = null;
    containerNames: string = null;
    containers: string = null;
    csMawbcontainers: [];
    customerId: string = null;
    customerName: string = null;
    customerNameVn: string = null;
    customsBookingNo: string = null;
    cw: number = null;
    datetimeCreated: string = null;
    datetimeModified: string = null;
    deliveryOrderNo: string = null;
    deliveryOrderPrintedDate: string = null;
    deliveryPlace: string = null;
    desOfGoods: string = null;
    documentDate: string = null;
    documentNo: string = null;
    dofooter: string = null;
    dosentTo1: string = null;
    dosentTo2: string = null;
    eta: string = null;
    etawarehouse: string = null;
    etd: string = null;
    exportReferenceNo: string = null;
    finalDestinationPlace: string = null;
    forwardingAgentDescription: string = null;
    forwardingAgentId: string = null;
    forwardingAgentName: string = null;
    freightPayment: string = null;
    goodsDeliveryDescription: string = null;
    goodsDeliveryId: string = null;
    grossWeight: number = null;
    gw: number = null; // Can be deleted.
    hbltype: string = null;
    // * Add Field Shipment Type
    shipmentType: string = null;
    hwbno: string = null;
    inWord: string = null;
    inactiveOn: string = null;
    issueHbldate: string = null;
    jobId: string = null;
    localVessel: string = null;
    localVoyNo: string = null;
    manifestRefNo: string = null;
    mawb: string = null;
    moveType: string = null;
    netWeight: number = null;
    notifyParty: string = null;
    notifyPartyDescription: string = null;
    notifyPartyId: string = null;
    oceanVessel: string = null;
    oceanVoyNo: string = null;
    onBoardStatus: string = null;
    originBlnumber: number = null;
    originCountryId: string = null;
    packageContainer: string = null;
    packageTypes: any = null;
    packageType: number = null;
    packages: string = null;
    pickupPlace: string = null;
    placeFreightPay: string = null;
    pod: string = null;
    podName: string = null;
    pol: string = null;
    polName: string = null;
    purchaseOrderNo: string = null;
    referenceNo: string = null;
    remark: string = null;
    sailingDate: string = null;
    saleManId: string = null;
    saleManName: string = null;
    saleManNameVn: string = null;
    serviceType: string = null;
    shipmentEta: string = null;
    shipperDescription: string = null;
    shipperId: string = null;
    shipperName: string = null;
    shippingMark: string = null;
    subAbbr: string = null;
    warehouseNotice: string = null;
    packageQty: number = null;
    warehouseId: string = null;
    // * AIR
    flightNo: string = null;
    issuranceAmount: string = null;
    chgs: string = null;
    dclrca: string = null;
    dclrcus: string = null;
    handingInformation: string = null;
    notify: string = null;
    currencyId: string = null;
    wtorValpayment: string = null;
    otherPayment: string = null;
    flightDate: string = null;
    otherCharge: string = null;
    wtpp: string = null;
    valpp: string = null;
    taxpp: string = null;
    dueAgentPp: string = null;
    dueCarrierPp: string = null;
    totalPp: string = null;
    wtcll: string = null;
    valcll: string = null;
    taxcll: string = null;
    dueAgentCll: string = null;
    dueCarrierCll: string = null;
    totalCll: string = null;
    issuedBy: string = null;
    sci: string = null;
    currConvertRate: string = null;
    ccchargeInDrc: string = null;
    attachList: string = null;
    dimensionDetails: DIM[] = [];
    hw: number = null;
    firstCarrierBy: string = null;
    firstCarrierTo: string = null;
    transitPlaceTo1: string = null;
    transitPlaceTo2: string = null;
    transitPlaceBy1: string = null;
    transitPlaceBy2: string = null;
    issueHblplace: string = null;
    hwConstant: number = null;
    total: string = null;
    seaAir: number = null;
    rateCharge: number = null;
    min: boolean = false;
    kgIb: number = null;
    rclass: number = null;
    comItemNo: number = null;
    arrivalDate: string = null;
    route: string = null;
    flightNoOrigin: string = null;
    flightDateOrigin: string = null;
    finalPOD: string = null;
    poInvoiceNo: string = null;
    parentId: string = null;
    permission: PermissionHouseBill = new PermissionHouseBill();
    transactionType: string = null;
    otherCharges: CsOtherCharge[] = [];
    asArranged: boolean = false;
    deliveryPerson: string = null;
    deliveryDate: any = null;
    note: string = null;
    referenceNoProof = null;
    incotermId: string = null;
    userNameCreated: string = null;
    userNameModified: string = null;
    wareHouseAnDate:any = null;

    constructor(object?: any) {
        super();
        const self = this;
        // tslint:disable-next-line: forin
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
            if (self.dimensionDetails !== null) {
                if (!!self.dimensionDetails.length) {
                    self.dimensionDetails = object.dimensionDetails.map((i: DIM) => new DIM(i));
                }
            }



        }
    }
}