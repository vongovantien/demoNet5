export class CsShipmentSurcharge {
    id: string = "00000000-0000-0000-0000-000000000000";
    hblid: string = null;
    type: string = null;
    chargeId: string = null;
    chargeNameEn: string = null;
    quantity: number = 1;
    unitId: number = null;
    unitPrice: number = null;
    currencyId: string = null;
    includedVat: boolean = null;
    vatrate: number = null;
    total: number = 0;
    payerId: string = null;
    objectBePaid: string = null;
    paymentObjectId: string = null;
    kickBack: boolean = null;
    exchangeDate: any = null;
    notes: string = null;
    settlementCode: string = null;
    csidsettlement: string = null;
    csstatusSettlement: string = null;
    csdateSettlement: any = null;
    invoiceNo: string = null;
    invoiceDate: any = null;
    seriesNo: string = null;
    paymentRefNo: string = null;
    accountantId: string = null;
    accountantDate: any = null;
    accountantStatus: string = null;
    accountantNote: string = null;
    chiefAccountantId: string = null;
    chiefAccountantDate: any = null;
    chiefAccountantStatus: string = null;
    chiefAccountantNote: string = null;
    status: string = null;
    userCreated: string = null;
    datetimeCreated: any = null;
    userModified: string = null;
    datetimeModified: any = null;
    exchangeRate: number = null;
    chargeCode: string = null;
    unit: string = null;
    hwbno: string = null;
    soaadjustmentReason: string = null;
    soaadjustmentRequestedDate: any = null;
    soaadjustmentRequestor: string = null;
    soaclosed: boolean = null;
    cdno: string = null;
    soano: string = null;
    currency: string = null;
    nameEn: string = null;
    otherSoa: string = null;
    partnerName: string = null;
    partnerShortName: string = null;
    payerName: string = null;
    payerShortName: string = null;
    receiverName: string = null;
    receiverShortName: string = null;
    unlockedSoadirector: string = null;
    unlockedSoadirectorDate: any = null;
    unlockedSoadirectorStatus: string = null;
    unlockedSoasaleMan: string = null;
    unlockedSoasaleManDate: any = null;
    unlockedSoasaleManStatus: string = null;
    isFromShipment: boolean = true;
    isRemaining: boolean = null;
    isSelected: boolean = null;
    isDeleted: boolean = null;
    voucherId: string = null;
    voucherIddate: string = null;
    voucherIdre: string = null;
    voucherIdredate: string = null;
    finalExchangeRate: string = null;
    acctManagementId: string = null;
    syncedFrom: string = null;
    paySyncFrom: string = null;

    quantityType: any = null;
    creditNo: string = null;
    debitNo: string = null;
    jobNo: string = null;
    mblno: string = null;
    hblno: string = null;
    advanceNo: string = null;

    debitCharge: string = null;
    paySoano: string = null;
    unitCode: string = null;
    chargeGroup: string = null;
    vatPartnerId: string = null;
    vatPartnerShortName: string = null;
    officeId: string = null;
    transactionType: string = null;

    // * Custom
    duplicateCharge: boolean = false;
    duplicateInvoice: boolean = false;
    isShowPartnerHeader: boolean = false;
    linkFee: boolean = null;
    linkChargeId: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
