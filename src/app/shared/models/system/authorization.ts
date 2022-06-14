import { PermissionShipment } from "../document/permissionShipment";

export class Authorization {
    id: number = 0;
    userId: string = '';
    assignTo: string = '';
    name: string = '';
    services: string = '';
    description: string = '';
    startDate: string = '';
    endDate: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    inactiveOn: string = '';
    servicesName: string = '';
    userNameAssignTo: string = '';
    userNameAssign: string = '';
    groupId: number = 0;
    departmentId: number = 0;
    officeId: string = '';
    companyId: string = '';
    permission: PermissionShipment = new PermissionShipment();

    userModifiedName?: string = null;
    userCreatedName?: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}