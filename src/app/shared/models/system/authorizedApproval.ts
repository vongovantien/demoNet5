import { PermissionShipment } from "../document/permissionShipment";

import { SystemConstants } from "@constants";
export class AuthorizedApproval {
    id: string = SystemConstants.EMPTY_GUID;
    authorizer: string = '';
    authorizerName: string = '';
    commissioner: string = '';
    commissionerName: string = '';
    effectiveDate: string = '';
    expirationDate: string = '';
    type: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    inactiveOn: string = '';
    groupId: number = 0;
    departmentId: number = 0;
    officeId: string = '';
    companyId: string = '';
    nameUserCreated: string = '';
    nameUserModified: string = '';
    description: string = '';
    permission: PermissionShipment = new PermissionShipment();
    officeCommissioner: string = '';
    officeCommissionerName: string = '';
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }

}