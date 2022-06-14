import { SystemConstants } from "@constants";

export class CatChargeIncoterm {
    id: string = SystemConstants.EMPTY_GUID;
    incotermId: string = SystemConstants.EMPTY_GUID;
    chargeId: string = null;
    quantityType: string = null;
    unit: any = null;
    chargeTo: string = null;
    currency: string = null;
    feeType: string = null;
    type: string = null;

    // Custom
    isDuplicate: boolean = false;

    constructor(object: Object) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}

