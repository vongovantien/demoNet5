export class ProofOfDelivery {
    deliveryPerson: string = null;
    deliveryDate: any = null;
    note: string = null;
    referenceNo: string = null;
    hblid: string = null;
    constructor(object: any = {}) {
        const self = this;
        for (const key of Object.keys(object)) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
