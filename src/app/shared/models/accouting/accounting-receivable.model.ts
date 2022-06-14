export class TrialOfficialOtherModel {
    agreementId: string = null;
    partnerId: string = null;
    partnerCode: string = null;

    partnerNameAbbr: string = null;
    parentNameAbbr: string = null;

    agreementNo: string = null;
    agreementType: string = null;
    agreementStatus: string = null;

    expriedDate: Date = null;
    expriedDay: number = null;
    creditLimited: number = null;
    creditCurrency: string = null;

    debitAmount: number = null;
    obhAmount: number = null;
    debitRate: number = null;

    billingAmount: number = null;
    billingUnpaid: number = null;
    paidAmount: number = null;

    over1To15Day: number = null;
    over16To30Day: number = null;
    over30Day: number = null;

    obhBillingAmount: number = 0;
    obhUnPaidAmount: number = 0;
    obhPaidAmount: number = 0;
    agreementCurrency: string = null;

    agreementSalesmanName: string = null;
    agreementSalesmanId: string = null;
    isExpired: boolean = false;
    isOverLimit: boolean = false;
    isOverDue: boolean = false;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
export class GuaranteedModel {
    salesmanId: string = null;
    salesmanNameEn: string = null;
    salesmanFullName: string = null;
    totalCreditLimited: number = null;
    totalDebitAmount: number = null;
    totalDebitRate: number = null;
    totalBillingAmount: number = null;
    totalBillingUnpaid: number = null;
    totalPaidAmount: number = null;
    totalObhAmount: number = null;
    totalOver1To15Day: number = null;
    totalOver16To30Day: number = null;
    totalOver30Day: number = null;
    obhBillingAmount: number = 0;
    obhUnpaidAmount: number = 0;
    obhPaidAmount: number = 0;
    arPartners: TrialOfficialOtherModel[] = [];
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
export class AccReceivableDetailModel {
    agreementCurrency: string = null;
    agreementId: string = null;
    agreementNo: string = null;
    agreementSalesmanId: string = null;
    agreementSalesmanName: string = null;
    agreementStatus: string = null;
    agreementType: string = null;
    arCurrency: string = null;
    arServiceCode: string = null;
    arServiceName: string = null;
    billingAmount: number = 0;
    billingUnpaid: number = 0;
    creditAmount: number = 0;
    creditLimited: number = 0;
    creditRateLimit: number = 0;
    creditTerm: number = 0;
    cusAdvanceVnd: number = 0;
    cusAdvanceUsd: number = 0;
    debitAmount: number = 0;
    debitRate: number = 0;
    effectiveDate: Date = null;
    expriedDate: Date = null;
    expriedDay: number = 0;
    obhAmount: number = 0;
    obhBillingAmount: number = 0;
    obhUnPaidAmount: number = 0;
    obhPaidAmount: number = 0;
    officeId: string = null;
    over1To15Day: number = 0;
    over16To30Day: number = 0;
    over30Day: number = 0;
    paidAmount: number = 0;
    partnerCode: string = null;
    partnerId: string = null;
    partnerNameAbbr: string = null;
    partnerNameEn: string = null;
    partnerNameLocal: string = null;
    partnerStatus: string = null;
    saleCreditLimited: number = 0;
    saleDebitAmount: number = 0;
    saleDebitRate: number = 0;
    taxCode: string = null;
    isExpired: boolean = false;
    isOverLimit: boolean = false;
    isOverDue: boolean = false;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
export class AccReceivableOfficesDetailModel {
    accountReceivableGrpServices: AccReceivableServicesDetailModel[] = [];
    officeId: string = null;
    officeName: string = null;
    officeNameAbbr: string = null;
    totalBillingAmount: number = 0;
    totalBillingUnpaid: number = 0;
    totalDebitAmount: number = 0;
    totalObhAmount: number = 0;
    totalOver1To15Day: number = 0;
    totalOver15To30Day: number = 0;
    totalOver30Day: number = 0;
    totalPaidAmount: number = 0;
    currency: string = null;
    totalObhBillingAmount: number = 0;
    totalObhPaidAmount: number = 0;
    totalObhUnPaidAmount: number = 0;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
export class AccReceivableServicesDetailModel {
    billingAmount: number = 0;
    billingUnpaid: number = 0;
    debitAmount: number = 0;
    obhAmount: number = null;
    officeId: string = null;
    over1To15Day: number = 0;
    over16To30Day: number = 0;
    over30Day: number = 0;
    paidAmount: number = 0;
    serviceName: string = null;
    serviceCode: string = null;
    obhBillingAmount: number = 0;
    obhPaidAmount: number = 0;
    obhUnPaidAmount: number = 0;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}

export class AccReceivableDebitDetailModel {
    billingNo: string = null
    type: string = null
    invoiceNo: string = null
    totalAmountVND: number = 0;
    totalAmountUSD: number = 0;
    paidAmountVND: number = 0;
    paidAmountUSD: number = 0;
    unpaidAmountVND: number = 0;
    unpaidAmountUSD: number = 0;
    overdueDays: string = null;
    code: string = null;
    paymentStatus: string = null;
    paymentDueDate: Date = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}