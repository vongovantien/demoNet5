import { SystemConstants } from "@constants";

export class FlowSetting {
    id: string = SystemConstants.EMPTY_GUID;
    officeId: string = null;
    type: string = null;
    flow: string = null;
    leader: string = "None";
    manager: string = "Approval";
    accountant: string = "Approval";
    bod: string = "Auto";
    creditLimit: boolean = false;
    overPaymentTerm: boolean = false;
    expiredAgreement: boolean = false;
    userCreated: string = null;
    userModified: string = null;
    datetimeCreated: string = null;
    datetimeModified: string = null;
    applyType: string = null;
    applyPartner: string = null;
    replicateOfficeId: string = null;
    replicatePrefix: string = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
