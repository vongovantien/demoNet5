import { BaseModel } from "../base.model";
import { SystemConstants } from "src/constants/system.const";

export class CsOtherCharge extends BaseModel {

    id: string = SystemConstants.EMPTY_GUID;
    jobId: string = SystemConstants.EMPTY_GUID;
    hblId: string = SystemConstants.EMPTY_GUID;
    chargeName: string = null;
    amount: number = null;
    dueTo: string = 'Carrier';
    quantity: number = null;
    rate: number = null;

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