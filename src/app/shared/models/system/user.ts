import { Employee } from "./employee";

export class User {
    id: string = '';
    username: string = '';
    userName: string = null;
    password: string = '';
    userGroupId: string = '';
    employeeId: string = '';
    workPlaceId: string = '';
    refuseEmail: string = '';
    ldapObjectGuid: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: any = true;
    inactiveOn: string = '';
    preferred_username: string = '';
    workingStatus: string = '';
    title: string = '';
    userType: string = '';
    SysEmployeeModel: Employee = null;
    employeeNameEn: string = '';
    employeeNameVn: string = '';

    userCreatedName: string = null;
    userModifiedName: string = null;


    constructor(data?: any) {
        let self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
