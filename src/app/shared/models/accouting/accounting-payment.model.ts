export class AccountingPaymentModel {
    refId: string = null;
    refNo: string = null;
    type: string = null;
    invoiceNoReal: string = null;
    soaNo: string = null;
    partnerId: string = null;
    partnerName: string = null;
    amount: number = 0;
    totalAmountVnd: number = 0;
    totalAmountUsd: number = 0;
    currency: string = null;
    issuedDate: Date = null;
    serie: string = null;
    unpaidAmount: number = null;
    unpaidAmountVnd: number = 0;
    unpaidAmountUsd: number = 0;
    paidAmount: number = null;
    paidAmountVnd: number = 0;
    paidAmountUsd: number = 0;
    dueDate: Date = null;
    overdueDays: number = 0;
    status: string = null;
    extendDays: number = 0;
    extendNote: string = null;
    receiptId: string = null;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}