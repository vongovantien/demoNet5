import { SystemConstants } from "@constants";
import { PermissionShipment } from "../document/permissionShipment";
import { CommonEnum } from "@enums";

export class SetUnlockRequest {
    id: string = SystemConstants.EMPTY_GUID;
    subject: string = null;
    requester: string = null;
    unlockType: string = null;
    newServiceDate: string = null;
    generalReason: string = null;
    requestDate: string = null;
    requestUser: string = null;
    statusApproval: string = null;
    userCreated: string = null;
    datetimeCreated: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    groupId: number = 0;
    departmentId: number = 0;
    officeId: string = SystemConstants.EMPTY_GUID;
    companyId: string = SystemConstants.EMPTY_GUID;
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
export class SetUnlockRequestModel extends SetUnlockRequest {
    jobs: SetUnlockRequestJobModel[] = new Array<SetUnlockRequestJobModel>();
    requesterName: string = null;
    userNameCreated: string = null;
    userNameModified: string = null;
    isRequester: boolean = false;
    isManager: boolean = false;
    isApproved: boolean = false;
    isShowBtnDeny: boolean = false;
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

export class SetUnlockRequestJobModel {
    id: string = SystemConstants.EMPTY_GUID;
    unlockRequestId: string = SystemConstants.EMPTY_GUID;
    unlockName: string = null;
    reason: string = null;
    job: string = null;
    unlockType: string = null;
    userCreated: string = null;
    datetimeCreated: string = null;
    // * Custom
    isSelected: boolean = false;
    constructor(object?: object) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class UnlockJobCriteria {
    jobIds: string[] = [];
    mbls: string[] = [];
    customNos: string[] = [];
    advances: string[] = [];
    settlements: string[] = [];
    unlockTypeNum: CommonEnum.UnlockTypeEnum;
}

export class UnlockRequestCriteria {
    referenceNos: string[] = [];
    unlockTypeNum: CommonEnum.UnlockTypeEnum;
    requester: string = null;
    createdDate: string = null;
    statusApproval: string = null;
}

export class UnlockRequestResult extends SetUnlockRequest {
    requesterName: string = null;
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

export class SetUnlockRequestApprove {
    id: string = SystemConstants.EMPTY_GUID;
    unlockRequestId: string = SystemConstants.EMPTY_GUID;
    leader: string = null;
    leaderApr: string = null;
    leaderAprDate: string = null;
    manager: string = null;
    managerApr: string = null;
    managerAprDate: string = null;
    accountant: string = null;
    accountantApr: string = null;
    accountantAprDate: string = null;
    buhead: string = null;
    buheadApr: string = null;
    buheadAprDate: string = null;
    userCreated: string = null;
    datetimeCreated: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    comment: string = null;
    isDeny: boolean = false;
    levelApprove: string = null;
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class SetUnlockRequestApproveModel extends SetUnlockRequestApprove {
    leaderName: string = null;
    managerName: string = null;
    accountantName: string = null;
    buHeadName: string = null;
    isApproved: boolean = false;
    statusApproval: string = null;
    numOfDeny: Number = 0;
    isShowLeader: boolean = false;
    isShowManager: boolean = false;
    isShowAccountant: boolean = false;
    isShowBuHead: boolean = false;
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

export class DeniedUnlockRequestResult {
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
