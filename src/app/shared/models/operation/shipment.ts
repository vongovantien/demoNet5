import { CustomDeclaration } from "./custom-declaration";

export class Shipment {
    agentId: string = '';
    agentName: string = '';
    billingOpsId: string = '';
    createdDate: string = '';
    curentStageCode: string = '';
    currentStageId: any = '';
    currentStatus: string = '';
    customerId: string = '';
    fieldOpsId: string = '';
    finishDate: string = '';
    flightVessel: string = '';
    hblid: string = '';
    hwbno: string = '';
    id: string = '';
    invoiceNo: string = '';
    jobNo: string = '';
    mblno: string = '';
    datetimeModified: string = '';
    packageTypeId: string = '';
    pod: string = '';
    podName: string = '';
    pol: string = '';
    polName: string = '';
    productService: string = '';
    purchaseOrderNo: string = '';
    salemanId: string = '';
    serviceDate: string = '';
    serviceMode: string = '';
    shipmentMode: string = '';
    sumCbm: number = 0;
    sumChargeWeight: 0
    sumContainers: number = 0;
    sumGrossWeight: number = 0;
    sumNetWeight: number = 0;
    sumPackages: number = 0;
    supplierId: string = '';
    supplierName: string = '';
    userCreated: string = '';
    userModified: string = '';
    warehouseId: string = '';

    customClearances: CustomDeclaration[] = []; // * custom
    clearanceNo: string = '';
    customerName: string = '';
    isLocked: boolean = false;

    replicatedId: string = null;
    userCreatedName: string = null;
    userCreatedLinkJob: string = null;

    isSelected: boolean = false;
    isLinkJob: boolean = false;
    isLinkFee: boolean = false;

    linkSource: string = null;
    replicateJobNo: string = null;
    serviceNo: string = '';
    userCreatedNameLinkJob: string = null;

    groupName: string = null;
    departmentName: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
};
