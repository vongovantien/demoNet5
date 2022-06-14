export class Department {
    id: number = 0;
    code: string = '';
    deptName: string = '';
    deptNameEn: string = '';
    deptNameAbbr: string = '';
    branchId: string = '';
    officeName: string = '';
    companyName: string = '';
    companyId: string = null;
    deptType: string = '';
    email: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    inactiveOn: string = '';
    userNameCreated: string = '';
    userNameModified: string = '';
    signPath: string = '';
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}