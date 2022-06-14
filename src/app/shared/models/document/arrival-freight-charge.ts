import { BaseModel } from "../base.model";

export class ArrivalFreightCharge extends BaseModel {
    id: string = "00000000-0000-0000-0000-000000000000";
    chargeName: string = null;
    unitName: string = null;
    currencyName: string = null;
    hblid: string = null;
    description: string = null;
    chargeId: string = null;
    unitId: number = null;
    currencyId: string = null;
    notes: string = null;
    quantityType: string = null;

    vatrate: number = null;
    total: number = null;
    exchangeRate: number = null;
    quantity: number = null;
    unitPrice: number = null;

    isShow: boolean = true;
    isFull: boolean = true;
    isTick: boolean = true;

    // Custom.
    isShowCharge: boolean = false;


    constructor(object?: any) {
        super();
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}