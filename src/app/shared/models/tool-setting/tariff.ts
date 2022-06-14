import { PermissionShipment } from "../document/permissionShipment";

export class Tariff {
    id: string = '';
    tariffName: string = '';
    tariffType: any = null;
    effectiveDate: any = null;
    expiredDate: any = null;
    applyOfficeId: any = null;
    productService: any = null;
    cargoType: any = null;
    serviceMode: any = null;
    customerName: string = '';
    customerId: any = null;
    supplierName: string = '';
    supplierId: any = null;
    agentId: any = null;
    description: string = '';
    status: boolean = null;
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    groupId: number = 0;
    departmentId: number = 0;
    officeId: string = null;
    companyId: string = null;

    userCreatedName: string = null;
    userModifieddName: string = null;

    permission: PermissionShipment = new PermissionShipment();

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}

export class TariffAdd {
    setTariff: Tariff = new Tariff();
    setTariffDetails: TariffCharge[] = new Array<TariffCharge>();

    constructor(object?: any) {
        const self = this;
        // tslint:disable-next-line: forin
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
            if (!!self.setTariff) {
                self.setTariff = new Tariff(object.setTariff);
            }
            if (!!self.setTariffDetails) {
                self.setTariffDetails = object.setTariffDetails.map(i => new TariffCharge(i));
            }

        }
    }

}

export class TariffCharge {
    chargeName: string = '';
    chargeCode: string = '';
    commodityName: any = null;
    payerName: string = '';
    portName: string = '';
    warehouseName: string = '';
    id: string = '';
    tariffId: string = '';
    chargeId: string = '';
    useFor: any = null;
    route: string = null;
    commodityId: any = null;
    payerId: any = null;
    portId: any = null;
    warehouseId: any = null;
    type: string = null;
    rangeType: string = null;
    rangeFrom: number = 0;
    rangeTo: number = 0;
    unitPrice: number = 0;
    min: number = 0;
    max: number = 0;
    nextUnit: number = 0;
    nextUnitPrice: number = 0;
    unitId: number = null;
    currencyId: any = null;
    vatrate: number = 0;
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}

