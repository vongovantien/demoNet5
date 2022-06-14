export class Company {
    id: string = '';
    code: string = '';
    bunameVn: string = '';
    bunameEn: string = '';
    bunameAbbr: string = '';
    logoPath: string = '';
    logo: string = '';
    website: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    kbExchangeRate: number = null;
    sysBranch: any[] = [];
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
