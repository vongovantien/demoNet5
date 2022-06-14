export class SOASearchCharge {
    currencyLocal: string = '';
    currency: string = '';
    customerID: string = '';
    dateType: string = '';
    fromDate: string = '';
    toDate: string = '';
    type: string = '';
    isOBH: boolean = false;
    strCreators: string = '';
    strCharges: string = '';
    note: string = '';
    serviceTypeId: any = '';
    chargeShipments: any[] = [];
    inSoa: boolean = false;
    commodityGroupId: any = null;
    strServices: string = '';
    jobIds: any[] = [];
    hbls: any[] = [];
    mbls: any[] = [];
    customNo?: string[] = [];
    staffType: string = '';
    customerShipmentId: string = '';
    salemanId: string = '';

    // * Custom
    airlineCode?: string = '';  // * để lọc phí theo job có 3 ký tự đầu MAWB.

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}