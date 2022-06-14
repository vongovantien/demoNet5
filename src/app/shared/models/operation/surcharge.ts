import { SystemConstants } from "@constants";
export class Surcharge {
    chargeId: string = '';
    chargeName: string = '';
    chargeCode: string = '';
    clearanceNo: string = '';
    contNo: string = '';
    currencyId: string = '';
    hbl: string = '';
    invoiceDate: any = null;
    invoiceNo: string = '';
    isFromShipment: boolean = false;
    jobId: string = '';
    mbl: string = '';
    notes: string = '';
    obhPartnerName: string = '';
    payer: string = '';
    quantity: number = 0;
    seriesNo: string = '';
    total: number = 0;
    typeCharge: string = '';
    unitId: number = 0;
    unitName: string = '';
    unitPrice: number = 0;
    vatrate: number = 0;
    settlementCode: string = '';
    id: string = SystemConstants.EMPTY_GUID;
    surchargeId: string = '';
    isSelected: boolean = false;
    hblid: string = '';
    type: string = '';
    typeOfFee: string = '';

    cdclosed: boolean = false;
    creditNo: string = '';
    debitNo: string = '';
    objectBePaid: string = '';
    paySoano: string = '';
    payerId: string = '';
    paymentObjectId: string = '';
    paymentRequestType: string = '';
    soaclosed: boolean = false;
    soano: string = '';
    voucherId: string = '';
    voucherIdre: string = '';

    jobNo: string = null;
    mblno: string = null;
    hblno: string = null;
    advanceNo: string = null;
    originAdvanceNo: string = '';
    chargeGroup: string = null;

    shipmentId: string = SystemConstants.EMPTY_GUID; // * Id trong OpsTransation,CsTransation.
    typeService: string = null; // * "DOC | OPS"

    netAmount: number = 0;
    finalExchangeRate: number = 0;
    amountVnd: number = 0;
    vatAmountVnd: number = 0;
    amountUSD: number = 0;
    vatAmountUSD: number = 0;
    totalAmountVnd: number = 0;
    picName: string = '';
    isLocked: boolean = false;
    kickBack: boolean = false;
    vatPartnerId: string = null;
    vatPartnerShortName: string = null;
    syncedFrom: string = null;
    syncedFromBy: string = null;
    paySyncedFrom: string = null;
    advanceNoFor: string = null;

    // * Custom
    obhId: string = null;
    isDuplicate: boolean = false;
    isChangeShipment: boolean = null;
    linkChargeId:string = null;
    hasNotSynce: boolean = true; // charge chưa synce
    hadIssued: boolean = false; // charge đã issued
    payeeIssued: boolean = false; // đầu payee đã được issued
    obhPartnerIssued: boolean = false; // đầu obh partner đã được issued

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}

