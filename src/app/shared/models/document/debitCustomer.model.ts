
export class DebitCustomer {
    refNo: string = null; //
    type: string = null;
    invoiceNo: string = null;
    invoiceDate: string = null;

    partnerId: string = null;
    partnerName: string = null;
    taxCode: string = null;
    amount: number = null;

    unpaidAmount: number = null;

    unpaidVnd: number = null;
    unpaidUsd: number = null;
    paymentTerm: string = null;
    dueDate: string = null;
    departmentId: number = null;
    departmentName: string = null;
    officeId: string = null;
    officeName: string = null;
    conpamnyId: string = null;
    isChecked: boolean = false;
    currencyId: string = null;
    paymentStatus: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }

}