export class DeliveryOrder {
    hblid: string = null;
    deliveryOrderNo: string = '';
    transactionType: number = null;
    userDefault: string = null;
    doheader1: string = null;
    doheader2: string = null;
    dofooter: string = null;
    subAbbr: string = null;
    deliveryOrderPrintedDate: any = null;

    constructor(object: any = {}) {
        const self = this;
        for (const key of Object.keys(object)) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
