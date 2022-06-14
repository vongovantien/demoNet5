
export class CustomDeclaration {
    cargoType: any = null;
    cbm: number = 0;
    clearanceDate: string = '';
    clearanceNo: string = '';
    commodityCode: string = '';
    datetimeCreated: string = '';
    datetimeModified: string = '';
    documentType: string = '';
    exportCountryCode: string = '';
    firstClearanceNo: string = '';
    gateway: string = '';
    grossWeight: number = 0;
    hblid: string = '';
    id: number = - 1;
    idfromEcus: any = '';
    importCountryCode: string = '';
    jobNo: string = '';
    mblid: string = '';
    netWeight: number = 0;
    note: string = '';
    partnerTaxCode: string = '';
    pcs: number = 0;
    portCodeCk: string = '';
    portCodeNn: string = '';
    qtyCont: number = 0;
    route: string = '';
    serviceType: string = '';
    source: string = '';
    type: string = '';
    unitCode: string = '';
    userCreated: string = '';
    userModified: string = '';
    accountNo: string = '';

    isSelected: boolean = false;
    gatewayName: string = '';
    customerName: string = '';
    importCountryName: string = '';
    exportCountryName: string = '';
    convertTime: Date = null;
    groupId: number = null;
    departmentId: number = null;
    officeId: string = null;
    companyId: string = null;
    userCreatedName: string = null;
    userModifieddName: string = null;

    // custom
    isReplicate: boolean = false;
    customerId: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}
