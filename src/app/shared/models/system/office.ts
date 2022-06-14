export class Office {
    id: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    branchNameVn: string = '';
    bankAccountName: string = '';
    branchNameEn: string = '';
    buid: string = '';
    addressVn: string = '';
    addressEn: string = '';
    tel: string = '';
    fax: string = '';
    email: string = '';
    taxcode: string = '';
    bankAccountVnd: string = '';
    bankAccountUsd: string = '';
    bankName: string = '';
    bankAddress: string = '';
    code: string = '';
    swiftCode: string = '';
    shortName: string = '';
    companyName: string = '';
    active: boolean = false;
    location: string = '';

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
