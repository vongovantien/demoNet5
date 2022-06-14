import { SystemConstants } from "src/constants/system.const";
import { CsOtherCharge } from "./csOtherCharge";
import { DIM } from "./dimension";

export class AirwayBill {

    id: string = SystemConstants.EMPTY_GUID;
    jobId: string = SystemConstants.EMPTY_GUID;
    mblno1: string = null;
    mblno2: string = null;
    mblno3: string = null;
    shipperId: string = null;
    shipperDescription: string = null;
    consigneeId: string = null;
    consigneeDescription: string = null;
    forwardingAgentId: string = null;
    forwardingAgentDescription: string = null;
    eta: string = null;
    etd: string = null;
    flightDate: string = null;
    pickupPlace: string = null;
    pol: string = null;
    pod: string = null;
    firstCarrierBy: string = null;
    firstCarrierTo: string = null;
    transitPlaceTo1: string = null;
    transitPlaceBy1: string = null;
    transitPlaceTo2: string = null;
    transitPlaceBy2: string = null;
    flightNo: string = null;
    freightPayment: string = null;
    issuranceAmount: string = null;
    currencyId: string = null;
    chgs: string = null;
    wtorValpayment: string = null;
    otherPayment: string = null;
    dclrcus: string = null;
    dclrca: string = null;
    route: string = null;
    warehouseId: string = null;
    originBlnumber: string = null;
    handingInformation: string = null;
    notify: string = null;
    issuedPlace: string = null;
    issuedDate: string = null;
    grossWeight: number = null;
    rclass: string = null;
    rateCharge: number = null
    comItemNo: string = null;
    chargeWeight: number = null;
    min: boolean = false;
    total: number = null;
    seaAir: number = null;
    hw: number = null;
    cbm: number = null;
    volumeField: string = null;
    desOfGoods: string = null;
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
    shippingMark: string = null;
    issuedBy: string = null;
    currConvertRate: string = null;
    sci: string = null;
    ccchargeInDrc: string = null;
    packageQty: number = null;
    kgIb: string = null;

    dimensionDetails: DIM[] = [];
    otherCharges: CsOtherCharge[] = [];

    constructor(object?: any) {
        const self = this;
        // tslint:disable-next-line: forin
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }

            if (!!object.dimensionDetails && !!object.dimensionDetails.length) {
                self.dimensionDetails = object.dimensionDetails.map((i: DIM) => new DIM(i));
            }
            if (!!object.otherCharges && !!object.otherCharges.length) {
                self.otherCharges = object.otherCharges.map((i: CsOtherCharge) => new CsOtherCharge(i));
            }
        }
    }
}