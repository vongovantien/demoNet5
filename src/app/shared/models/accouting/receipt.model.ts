import { Controller, Key } from "@decorators";

export class ReceiptCreditDebitModel {
    id: string;
    refNo: string;
    type: string;
    invoiceNo: string;
    invoiceDate: Date;
    partnerId: string;
    partnerName: string;
    taxCode: string;
    amount: number;
    unpaidAmount: number;
    unpaidAmountVnd: number;
    unpaidAmountUsd: number;
    paymentTerm: number;
    dueDate: Date;
    paymentStatus: string;
    departmentId: string;
    departmentName: string;
    officeId: string;
    officeName: string;
    companyId: string;
    currencyId: string;
    jobNo: string;

    notes: string;
    paidAmountUsd: number;
    paidAmountVnd: number;
    balance: number;
    balanceUsd: number;
    balanceVnd: number;
    totalPaidVnd: number;
    totalPaidUsd: number;
    negative: boolean;
    creditNo: any; // * Số Credit dùng để cấn trừ trên hóa đơn
    creditAmountVnd: number;
    creditAmountUsd: number;
    exchangeRateBilling: number;
    voucherId: string = null;
    voucherIdre: string = null;
    paymentType: string = null;
    netOff: boolean = null;
    netOffVnd: number;
    netOffUsd: number;
}

export class ReceiptInvoiceModel extends ReceiptCreditDebitModel {

    // * custom
    isSelected: boolean = false;
    paymentId: string = null; //
    notes: string = null;
    paidAmountVnd: number = null;
    paidAmountUsd: number = null;
    remainUsd: number = null;
    remainVnd: number = null;
    typeInvoice: string = null;
    partnerId: string = null;
    groupShipmentsAgency: any[] = [];

    hblid?: string = null;
    jobId?: string;
    mbl?: string;
    hbl?: string;

    isChangeValue: boolean = false;
    creditNos: string[] = [];
    isValid: boolean = true;

    constructor(object?: any) {
        super();
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
            if (key === 'typeInvoice') {
                self['type'] = object[key];
            }
        }
    }

}
@Controller()
export class Receipt {
    @Key
    id: string = null;
    customerName: string = null;
    paymentRefNo: string = null;
    paidAmount: string = null;
    finalPaidAmount: number = 0;
    paymentDate: Date = null;
    status: string = null;
    type: string = null;
    currencyId: string = null;
    syncStatus: string = null;
    lastSyncDate: Date = null;
    description: string = null;
    userCreated: string = null;
    userModified: string = null;
    datetimeCreated: Date = null;
    datetimeModified: Date = null;
    fromDate: Date = null;
    toDate: Date = null;
    customerId: string = null;
    agreementId: string = null;
    reasonReject: string = null;
    referenceId: string = null; // * ID của receipt cha (trường hợp có receipt banking)
    paymentMethod: string = null;
    class: string = null;
    obhpartnerId: string = null;
    notifyDepartment: string = null;
    creditAmountVnd: number = 0;
    creditAmountUsd: number = 0;
    finalPaidAmountUsd: number = 0;
    finalPaidAmountVnd: number = 0;
    cusAdvanceAmount: number = 0;
    paidAmountUsd: number = 0;
    paidAmountVnd: number = 0;
    referenceNo: string = null;
    bankAccountNo: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class ReceiptModel extends Receipt {
    customerName: string = null;
    payments: ReceiptInvoiceModel[] = [];
    userNameCreated: string = null;
    userNameModified: string = null;
    subRejectReceipt: string = null;
    isReceiptBankFee: boolean = false;
    receiptInternalOfficeCode: string = null;
    obhPartnerName: string = null;

    constructor(object?: any) {
        super();
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

