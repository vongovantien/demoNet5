export class CDNoteViewModel {
    id: string = "00000000-0000-0000-0000-000000000000";
    jobId: string = "00000000-0000-0000-0000-000000000000";
    partnerId: string = '';
    partnerName: string = '';
    referenceNo: string = '';
    jobNo: string = '';
    hblNo: string = '';
    total: number = 0;
    currency: string = '';
    issuedDate: Date = null;
    creator: string = '';
    status: string = '';
    isSelected: boolean = false;
    syncStatus: string = '';
    lastSyncDate: string = '';
    voucherId: string = '';
    datetimeModified: Date = null;
    voucherIddate: Date = null;
    paymentStatus: string = '';
    billingType: string = '';
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class CombineBillingCriteria {
    cdNoteCode: string = '';
    partnerId: string = '';
    partnerName: string = '';
    currencyCombine: string = '';
    constructor(object?: object) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
