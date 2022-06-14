import { BaseModel } from "../base.model";
import { SystemConstants } from "src/constants/system.const";
export class CatPartnerCharge extends BaseModel {
    id: string = SystemConstants.EMPTY_GUID;
    partnerId: string = null;
    chargeId: string = null;
    quantity: number = null;
    quantityType: string = null;
    unitId: string = null;
    unitPrice: number = null;
    currencyId: string = null;
    vatrate: number = null;

    constructor(data?: any) {
        super();
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
