import { CsShipmentSurchargeDetail } from "./csShipmentSurchargeDetail.model";

export class ChargeCdNote {
    hwbno: string = "";
    hbltype: string = "";
    id: string = "";
    salemanId: string = "";
    listCharges: CsShipmentSurchargeDetail[] = new Array<CsShipmentSurchargeDetail>();
    isSelected: boolean = false;
    isDeleted: boolean = false;
    referenceNoHBL: string = "";
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}