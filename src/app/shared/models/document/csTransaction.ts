import { Container } from "src/app/shared/models/document/container.model";
import { CsTransactionDetail } from "src/app/shared/models/document/csTransactionDetail";
import { TransactionTypeEnum } from "../../enums/transaction-type.enum";
import { DIM } from "./dimension";
import { PermissionShipment } from "./permissionShipment";
import { BaseModel } from "../base.model";

export class CsTransaction extends BaseModel {
    id: string = "00000000-0000-0000-0000-000000000000";
    branchId: string = "00000000-0000-0000-0000-000000000000";
    transactionTypeEnum: TransactionTypeEnum;
    jobNo: any = null;
    mawb: string = null;
    typeOfService: string = null;
    etd: any = null;
    eta: any = null;
    ata: any = null;
    atd: any = null;
    incotermId: string = null;
    serviceDate: any = null;
    mbltype: string = null;
    coloaderId: string = null; // supplier
    coloaderName: string = null; //
    supplierName: string = null; //Used
    bookingNo: string = null;
    agentId: string = null; // agent
    agentName: string = null;
    pol: string = null;
    polName: string = null;
    pod: string = null;
    warehouseId: string = null;
    podName: string = null;
    deliveryPlace: string = null;
    paymentTerm: string = null;
    flightVesselName: string = null;
    voyNo: string = null;
    shipmentType: string = null;
    commodity: string = null;
    desOfGoods: string = null;
    packageContainer: string = '';
    pono: string = null;
    personIncharge: string = null;
    personInChargeName: string = null;
    netWeight: number = null;
    grossWeight: number = 0;
    chargeWeight: number = 0;
    cbm: number = 0;
    notes: string = null;
    transactionType: string = null;
    isLocked: boolean = false;
    lockedDate: string = null;
    userCreated: string = null;
    datetimeCreated: string = null;
    userModified: string = null;
    datetimeModified: string = null;
    active: boolean = true;
    inactiveOn: string = null;

    csMawbcontainers: Container[] = new Array<Container>();
    csTransactionDetails: CsTransactionDetail[] = new Array<CsTransactionDetail>();

    subColoader: string = null;
    hwbNo: string = null;
    customerId: string = null;
    customerName: string = null;
    notifyPartyId: string = null;
    saleManId: string = null;
    creatorName: string = null;
    sumCont: number = 0;
    sumPackage: number = 0;
    hblId: string = "00000000-0000-0000-0000-000000000000";
    packageQty: number = null;
    packageType: string = null;
    supp: string = null;

    // * AIR
    flightDate: any = null;
    hw: number = null;
    hwConstant: number = 6000;

    dimensionDetails: DIM[] = [];
    issuedBy: string = null;
    route: string = null;
    roundUpMethod: string = null;
    applyDim: string = null;

    permission: PermissionShipment = new PermissionShipment();

    userNameCreated: string = '';
    userNameModified: string = '';
    currentStatus: string = 'Processing';
    coloaderCode: string = null;
    polCode: string = null;
    podCode: string = null;
    warehousePOL: WarehouseData = null;
    warehousePOD: WarehouseData = null;
    polCountryCode: string = null;
    polCountryNameEn: string = null;
    polCountryNameVn: string = null;
    agentData: AgentData = null;
    creatorOffice: OfficeData = null;
    groupEmail: string = null;
    mawbShipper: string = null;
    airlineInfo: string = null;
    isHawb: boolean = false;
    polDescription: string = null;
    podDescription: string = null;

    replicatedId: string = null;
    isLinkFee: boolean = false;
    isLinkJob: boolean = false;
    serviceNo: string = null;

    constructor(object?: any) {
        super();
        const self = this;
        // tslint:disable-next-line: forin
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

class AgentData {
    nameEn: string;
    nameVn: string;
    tel: string;
    fax: string;
    address: string;
}

class OfficeData {
    nameEn: string;
    nameVn: string;
    location: string;
    addressEn: string;
    tel: string;
    fax: string;
    email: string;
}
class WarehouseData {
    nameEn: string;
    nameVn: string;
    nameAbbr: string;
}