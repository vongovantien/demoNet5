export class AdjustModel {
    code: string = '';
    partnerName: string = '';
    exchangeRate: number=0;
    totalCharge: number=0;
    totalShipment: number=0;
    totalUSD: number=0;
    totalVND: number=0;
    listChargeGrp: any[] = [];
    jodId: string = '';
    action: string = '';
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}

