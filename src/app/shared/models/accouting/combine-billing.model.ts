export class CombineBilling{
    id: string = '00000000-0000-0000-0000-000000000000';
    combineBillingNo: string = '';
    partnerId: string = null;
    type: string = '';
    totalAmountVnd: number = 0;
    totalAmountUsd: number = 0;
    description: string = '';
    issuedDateFrom: string = null;
    issuedDateTo: string = null;
    serviceDateFrom: string = null;
    serviceDateTo: string = null;
    services: string = '';
    userCreated: string = '';
    datetimeCreated: Date = null;
    userModified: string = '';
    datetimeModified: Date = null;
    userCreatedName: string = '';
    userModifiedName: string = '';
    shipments: any[] = [];
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}