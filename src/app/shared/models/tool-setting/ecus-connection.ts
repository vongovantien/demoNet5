import { PermissionShipment } from "../document/permissionShipment";

export class EcusConnection {
    id: number = 0;
    name: string = null;
    userId: string = null;
    username: string = null;
    serverName: string = null;
    dbusername: string = null;
    dbpassword: string = null;
    dbname: string = null;
    note: string = null;
    active: boolean = true;
    inactiveOn: string = null;
    userCreated: string = null;
    datetimeCreated: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    userModifiedName: string = null;
    userCreatedName: string = null;
    fullname: string = null;

    permission: PermissionShipment = new PermissionShipment();

    companyId: string = null;
    officeId: string = null;
    departmentId: number = null;
    groupId: number = null;


    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}
