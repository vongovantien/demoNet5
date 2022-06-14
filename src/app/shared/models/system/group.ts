export class Group {
    id: number = 0;
    code: string = '';
    nameEn: string = '';
    nameVn: string = '';
    departmentId: number = 0;
    companyId: string = null;
    officeId: string = null;
    parentId: number = 0;
    managerId: string = '';
    shortName: string = '';
    userCreated: string = '';
    datetimeCreated: Date = null;
    userModified: string = '';
    datetimeModified: Date = null;
    active: boolean = true;
    inactiveOn: Date = null;
    departmentName: string = '';
    companyName: string = '';
    officeName: string = '';
    nameUserCreated: string = '';
    nameUserModified: string = '';

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
