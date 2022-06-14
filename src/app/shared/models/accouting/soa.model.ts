export class SOA {
    creditAmount: number = 0;
    debitAmount: number = 0;
    partnerName: string = '';
    shipment: number = 0;
    totalAmount: number = 0;
    currency: string = '';
    datetimeCreated: string = '';
    datetimeModified: string = '';
    id: string = '';
    note: string = '';
    soaformDate: string = '';
    soano: string = '';
    soatoDate: string = '';
    status: string = '';
    surchargeIds: string = '';
    userCreated: string = '';
    userModified: string = '';
    userNameCreated: string = '';
    userNameModified: string = '';

    amountBalanceUSD: number = 0;
    amountCreditLocal: number = 0;
    amountCreditUSD: number = 0;
    amountDebitLocal: number = 0;
    amountDebitUSD: number = 0;
    chargeShipments: any[] = [];
    groupShipments: any[] = [];
    amountBalanceLocal: number = 0;
    servicesNameSoa: any[] = [];
    serviceTypeId: string = '';
    dateType: string = '';
    type: string = '';
    creatorShipment: string = '';
    obh: boolean = false;
    customer: string = '';
    commodityGroupId: any = null;
    paymentStatus: string = '';
    lastSyncDate: string = '';
    syncStatus: string = '';
    reasonReject: string = '';
    creditPayment: string = '';
    isExistChgCurrDiffLocalCurr: boolean = false;
    totalCharge: number = 0;
    staffType: string = '';
    excRateUsdToLocal: number = 0;
    salemanId: string = '';
    salemanName: string = '';
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}

export class SoaCharge {
    amountCreditLocal: number;
    amountCreditUSD: number;
    amountDebitLocal: number;
    amountDebitUSD: number;
    cdNote: string;
    chargeCode: string;
    chargeName: string;
    credit: number;
    creditDebitNo: string;
    currency: string;
    currencyToLocal: string;
    currencyToUSD: string;
    customNo: string;
    datetimeModifiedSurcharge: string;
    debit: string;
    hbl: string;
    invoiceNo: string;
    jobId: string;
    mbl: string;
    note: string;
    pic: string;
    quantity: number;
    serviceDate: string;
    soaNo: string;
    type: string;
    unit: string;
    unitPrice: number;

    // Custom
    isSelected: boolean;
}
