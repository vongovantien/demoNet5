import { Surcharge } from "@models";

export class AdvancePayment {
    id: string = '';
    customNo: string = '';
    advanceNo: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    requester: string = '';
    requesterName: string = '';
    department: string = '';
    paymentMethod: string = '';
    advanceCurrency: string = '';
    requestDate: string = '';
    deadlinePayment: string = '';
    statusApproval: string = '';
    statusApprovalName: string = '';
    advanceNote: string = '';
    advanceDatetimeModified: string = '';
    statusPayment: string = '';
    advanceStatusPayment: string = '';
    isSelected: boolean = true;
    advanceRequests: AdvancePaymentRequest[] = [];
    amount: number = 0;
    paymentMethodName: string = '';

    isChecked: boolean = false;
    voucherNo: string = '';
    voucherDate: string = '';
    paymentTerm: number = null;
    paymentTermDate: string = null;
    lastSyncDate: string = null;
    syncStatus: string = null;
    reasonReject: string = null;


    isRequester: boolean = false;
    isManager: boolean = false;
    isApproved: boolean = false;
    isShowBtnDeny: boolean = false;

    userCreatedName: string = null;
    userModifiedName: string = null;
    userNameCreated: string = null;
    userNameModified: string = null;

    bankAccountNo: string = null;
    bankName: string = null;
    bankAccountName: string = null;
    payee: string = null;
    payeeName: string = null;
    bankCode: string = null;
    departmentName: string = null;
    advanceFor: string = null;
    
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class AdvancePaymentRequest {
    id: string = "00000000-0000-0000-0000-000000000000";
    description: string = '';
    customNo: string = '';
    jobId: string = '';
    hbl: string = '';
    mbl: string = '';
    hblid: string = '00000000-0000-0000-0000-000000000000';
    amount: number = 0;
    requestCurrency: string = '';
    advanceType: string = '';
    advanceNo: string = '';
    requestNote: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    statusPayment: string = '';

    surcharge: Surcharge[] = [];
    
    isSelected?: boolean;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class DeniedInfoResult {
    no: string = null;
    nameAndTimeDeny: string = null;
    levelApprove: string = null;
    comment: string = null;
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

