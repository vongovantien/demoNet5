import { SystemConstants } from "src/constants/system.const";

export class csBookingNote {
    id: string = SystemConstants.EMPTY_GUID;
    jobId: string = null;
    from: string = null;
    telFrom: string = null;
    to: string = null;
    telTo: string = null;
    revision: string = null;
    bookingNo: string = null;
    shipperId: string = null;
    shipperDescription: string = null;
    consigneeId: string = null;
    consigneeDescription: string = null;
    dateOfStuffing: string = null;
    closingTime: string = null;
    placeOfStuffing: string = null;
    contact: string = null;
    etd: string = null;
    eta: string = null;
    pol: string = null;
    pod: string = null;
    vessel: string = null;
    voy: string = null;
    paymentTerm: string = null;
    freightRate: string = null;
    placeOfDelivery: string = null;
    noOfContainer: string = null;
    commodity: string = null;
    specialRequest: string = null;
    gw: string = null;
    cbm: string = null;
    serviceRequired: string = null;
    otherTerms: string = null;
    hblNo: string = null;
    noOfBl: string = null;
    pickupAt: string = null;
    dropoffAt: string = null;
    note: string = null;
    //
    packageQty: number = null;

    bookingDate: string = null;
    userCreated: string = null;
    createdDate: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    creatorName: string = null;
    modifiedName: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}