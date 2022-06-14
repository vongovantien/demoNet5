import { SystemConstants } from "@constants";
import { PermissionShipment } from "../document/permissionShipment";
// tslint:disable: no-any

export class AccAccountingManagement {
    id: string = SystemConstants.EMPTY_GUID;
    partnerId: string = null;
    personalName: string = null;
    partnerAddress: string = null;
    description: string = null;
    voucherId: string = null;
    date: string = null;
    invoiceNoTempt: string = null;
    invoiceNoReal: string = null;
    serie: string = null;
    paymentMethod: string = null;
    voucherType: string = null;
    accountNo: string = null;
    totalAmount: number = 0;
    currency: string = null;
    status: string = null;
    attachDocInfo: string = null;
    type: string = null;
    groupId: number = 0;
    departmentId: number = 0;
    officeId: string = SystemConstants.EMPTY_GUID;
    companyId: string = SystemConstants.EMPTY_GUID;
    userCreated: string = null;
    datetimeCreated: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    serviceType: string = null;
    paymentStatus: string = null;
    paymentDueDate: string = null;
    totalExchangeRate: number = null;
    paymentTerm: number = null;
    lastSyncDate: string = null;
    syncStatus: string = null;
    referenceNo: string = null;
    reasonReject: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class ChargeOfAccountingManagementModel {
    surchargeId: string = SystemConstants.EMPTY_GUID;
    chargeId: string = SystemConstants.EMPTY_GUID;
    chargeCode: string = null;
    chargeName: string = null;
    jobNo: string = null;
    hbl: string = null;
    contraAccount: string = null;
    orgAmount: number = 0;
    vat: number = 0;
    orgVatAmount: number = 0;
    vatAccount: string = null;
    currency: string = null;
    exchangeDate: string = null;
    finalExchangeRate: number = 0;
    exchangeRate: number = 0;
    amountVnd: number = 0;
    vatAmountVnd: number = 0;
    vatPartnerId: string = null;
    vatPartnerCode: string = null;
    vatPartnerName: string = null;
    vatPartnerAddress: string = null;
    obhPartnerCode: string = null;
    obhPartner: string = null;
    invoiceNo: string = null;
    serie: string = null;
    invoiceDate: string = null;
    cdNoteNo: string = null;
    qty: number = 0;
    unitName: string = null;
    unitPrice: number = 0;
    mbl: string = null;
    soaNo: string = null;
    settlementCode: string = null;
    acctManagementId: string = SystemConstants.EMPTY_GUID;
    requesterId: string = null;
    // * Custom
    isSelected: boolean = false;
    isValidAmount: boolean = true;    // ? +- 1000
    isValidVatAmount: boolean = true; // ? +- 1000
    isSynced: boolean = false;
    syncedFromBy: string = null;
    chargeType: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class AccAccountingManagementModel extends AccAccountingManagement {
    charges: ChargeOfAccountingManagementModel[] = new Array<ChargeOfAccountingManagementModel>();

    userNameCreated: string = null;
    userNameModified: string = null;
    permission: PermissionShipment = new PermissionShipment();
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

export class PartnerOfAcctManagementResult {
    partnerId: string = null;
    partnerName: string = null;
    partnerAddress: string = null;
    settlementRequesterId: string = null;
    settlementRequester: string = null;
    inputRefNo: string = null;
    service: string = null;
    charges: ChargeOfAccountingManagementModel[] = new Array<ChargeOfAccountingManagementModel>();
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class PartnerOfAcctManagementCriteria {
    cdNotes: string[] = [];
    soaNos: string[] = [];
    jobNos: string[] = [];
    hbls: string[] = [];
    mbls: string[] = [];
    settlementCodes: string[] = [];
    constructor(object?: object) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class AccAccountingManagementResult extends AccAccountingManagement {
    partnerName: string = null;
    creatorName: string = null;

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

export class AccAccountingManagementCriteria {
    referenceNos: string[];
    partnerId: string;
    fromIssuedDate: string;
    toIssuedDate: string;
    creatorId: string;
    invoiceStatus: string;
    voucherType: string;
    typeOfAcctManagement: string;
}
