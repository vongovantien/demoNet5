import { ArrivalFreightCharge } from "./arrival-freight-charge";

export class HBLArrivalNote {
    hblid: string = null;
    arrivalNo: string = null;
    arrivalFirstNotice: any = null;
    arrivalSecondNotice: any = null;
    arrivalHeader: string = null;
    arrivalFooter: string = null;

    csArrivalFrieghtCharges: ArrivalFreightCharge[] = new Array<ArrivalFreightCharge>();

    constructor(object?: any) {
        const self = this;
        // tslint:disable-next-line: forin
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }

            if (!!self.csArrivalFrieghtCharges.length) {
                self.csArrivalFrieghtCharges = object.csArrivalFrieghtCharges.map((i: ArrivalFreightCharge) => new ArrivalFreightCharge(i));
            }
        }
    }
}
