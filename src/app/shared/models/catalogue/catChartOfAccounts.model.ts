
export class ChartOfAccounts {
    id: string = '';
    accountCode: string = '';
    accountNameEn: string = '';
    accountNameLocal: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}

