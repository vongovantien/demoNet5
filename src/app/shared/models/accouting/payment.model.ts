export class PaymentModel {
    id: string = '00000000-0000-0000-0000-000000000000';
    refId: string = '';
    refNo: string = null;
    paymentNo: string = '';
    paymentAmount: number = 0;
    balance: number = 0;
    currencyId: string = '';
    paidDate: Date = null;
    paymentType: string = '';
    type: string = '';
    userCreated: string = '';
    datetimeCreated: Date = null;
    userModified: string = '';
    datetimeModified: Date = null;
    groupId: number = null;
    departmentId: number = null;
    officeId: string = '';
    companyId: string = '';
    userModifiedName: string = '';
    paymentMethod: string = null;
    exchangeRate: number = null;
    receiptId: string = null;
    receiptNo: string = null;
    note: string = null;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}