import { BaseModel } from "../base.model";
import { Container } from "./container.model";
import { CommonEnum } from "../../enums/common.enum";
import { SystemConstants } from "src/constants/system.const";

export class FCLImportAddModel extends BaseModel {
    transactionTypeEnum: CommonEnum.TransactionTypeEnum = 7;
    csMawbcontainers: Container[] = [];
    csTransactionDetails: any[] = [];
    id: string = '00000000-0000-0000-0000-000000000000';
    branchId: string = '00000000-0000-0000-0000-000000000000';
    jobNo: string = null;
    mawb: string = null;
    typeOfService: string = null;
    etd: string = null;
    eta: string = null;
    serviceDate: string = null;
    mbltype: string = null;
    coloaderId: string = null;
    subColoader: string = null;
    bookingNo: string = null;
    agentId: string = null;
    pol: string = null;
    pod: string = null;
    deliveryPlace: string = null;
    paymentTerm: string = null;
    flightVesselName: string = null;
    voyNo: string = null;
    shipmentType: string = null;
    commodity: string = null;
    desOfGoods: string = null;
    packageContainer: string = null;
    pono: string = null;
    personIncharge: string = null;
    netWeight: number = null;
    grossWeight: number = null;
    chargeWeight: number = null;
    cbm: number = null;
    notes: string = null;
    isLocked: boolean = false;
    active: boolean = true;
    inactiveOn: string = null;
    transactionType: string = '';

    modifiedDate: string = '';


    constructor(object?: any) {
        super();
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];

                self.personIncharge = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS)).id;
            }
        }
    }
};