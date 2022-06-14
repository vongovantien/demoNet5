import { PermissionShipment } from "../document/permissionShipment";

export class CustomClearance {
    constructor() { }
    id: number = 0;
    idfromEcus: number;
    jobNo: string;
    clearanceNo: string = null;
    firstClearanceNo: string;
    partnerTaxCode: string;
    clearanceDate: any;
    mblid: string;
    hblid: string;
    portCodeCk: string;
    portCodeNn: string;
    unitCode: string;
    qtyCont: number;
    serviceType: string;
    gateway: string;
    type: string;
    route: string;
    documentType: string;
    exportCountryCode: string;
    importCountryCode: string;
    commodityCode: string;
    grossWeight: number;
    netWeight: number;
    cbm: number;
    pcs: number;
    source: string;
    note: string;
    userCreated: string;
    userModified: string;
    userModifieddName: string;
    userCreatedName: string;
    datetimeCreated: Date = null;
    datetimeModified: null;
    customerName: null;
    importCountryName: string;
    exportCountryName: string;
    gatewayName: string;
    cargoType: string;
    convertTime: Date = null;
    shipper: string;
    consignee: string;
    accountNo: string;

    permission: PermissionShipment = new PermissionShipment();

    isReplicate: boolean;
    customerId: string
}