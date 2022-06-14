import { CsShipmentSurcharge } from "./csShipmentSurcharge";

export class CsShipmentSurchargeDetail  extends CsShipmentSurcharge{
    partnerName: string = "";
    nameEn: string  = "";
    receiverName: string  = "";
    chargeNameEn: string  = "";
    payerName: string  = "";
    unit: string = "";
    currency: string  = "";
    chargeCode: string  = "";
    exchangeRate: number = 0;
    exchangeRateUSDToVND: number = 0;
    rateToUSD: number = 0;
    hwbno: string = "";
    partnerShortName: string = "";
    receiverShortName: string  = "";
    payerShortName: string = "";
    credit: number = null;
    debit: number = null;
    canEdit: boolean = true;
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