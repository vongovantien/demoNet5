import { ReceiptInvoiceModel } from "./receipt.model";

export class AgencyReceiptModel {
    groupShipmentsAgency: any[] = [];
    invoices: ReceiptInvoiceModel[] = [];
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
            if (key === 'typeInvoice') {
                self['type'] = object[key];
            }
        }
    }
}
