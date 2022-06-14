export class SettlementPayment {
    amount: number = 0;
    chargeCurrency: string = '';
    datetimeCreated: string = '';
    datetimeModified: string = '';
    id: string = '';
    note: string = '';
    paymentMethod: string = '';
    paymentMethodName: string = '';
    requestDate: string = '';
    requester: string = '';
    requesterName: string = '';
    settlementCurrency: string = '';
    settlementNo: string = '';
    statusApproval: string = '';
    statusApprovalName: string = '';
    userCreated: string = '';
    userModified: string = '';
    userNameCreated: string = '';
    userNameModified: string = '';
    isSelected: boolean = false;
    settleRequests: SettleRequestsPayment[] = [];


    isRequester: boolean = false;
    isManager: boolean = false;
    isApproved: boolean = false;
    isShowBtnDeny: boolean = false;

    voucherNo: string = null;
    voucherDate: string = null;

    lastSyncDate: string = null;
    syncStatus: string = null;
    reasonReject: string = null;
    payee: string = null;
    payeeName: string = null;
    settlementType: string = null;
    bankName: string = null;
    bankAccountName: string = null;
    bankAccountNo: string = null;
    advanceAmount: number = null;
    balanceAmount: number = null;
    departmentName: string = null;
    bankCode: string = null;
    dueDate: string = '';

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }



}

export class SettleRequestsPayment {
    id: string = "00000000-0000-0000-0000-000000000000";
    jobId: string = '';
    hbl: string = '';
    mbl: string = '';
    amount: number = 0;
    settlementCurrency: string = '';
    isLocked: boolean;

}
