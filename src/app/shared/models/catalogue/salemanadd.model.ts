export class SalemanAdd {
    id: string = '';
    saleManId: any = '';
    office: any = '';
    company: any = '';
    service: any = '';
    partnerId: any = '';
    createDate: string = '';
    status?: boolean = false;
    description: string = '';
    effectDate: any = '';
    statusString: string = '';
    userCreated: string = '';
    username: string = '';
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}