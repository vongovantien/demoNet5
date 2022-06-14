export class Saleman {
    id: string = '';
    saleManId: any = '';
    office: any = '';
    company: string = '';
    service: any = '';
    partnerId: string = '';
    createDate: string = '';
    status?: boolean = false;
    description: string = '';
    effectDate: any = '';
    statusString: string = '';
    userCreated: string = '';
    serviceName: string = '';
    username: string = '';
    freightPayment: any = '';

    companyNameEn: string = null;
    companyNameVn: string = null;
    companyNameAbbr: string = null;
    officeNameEn: string = null;
    officeNameVn: string = null;
    officeNameAbbr: string = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}