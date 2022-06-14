export class AccountingPayableModel {
    refId: string = null;
    referenceNo: string = null;
    voucherDate: Date = null;
    transactionType: string = null;
    invoiceNo: string = null;
    invoiceDate: Date = null;
    partnerId: string = null;
    partnerName: string = null;
    accountNo: string = null;
    billingNo: string = null;
    currency: string = null;
    bravoRefNo: string = null;
    notShowDetail: boolean = null;

    paymentAmount: number = 0;
    remainAmount: number = 0;
    totalAmount: number = 0;
    totalAmountVnd: number = 0;
    paymentAmountVnd: number = 0;
    remainAmountVnd: number = 0;
    
    paymentTerm: number = 0;
    paymentDueDate: string = null;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}