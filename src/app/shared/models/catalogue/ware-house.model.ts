import { BaseModel } from "../base.model";
import { PermissionShipment } from "../document/permissionShipment";

export class Warehouse extends BaseModel {
    id: string = "00000000-0000-0000-0000-000000000000";
    code: string = null;
    nameEn: string = null;
    nameVn: string = null;
    countryId?: number = null;
    districtId?: string = null;
    provinceId?: string = null;
    countryName: string = null;
    provinceName: string = null;
    districtName: string = null;
    flightVesselNo: string = null;
    address: string = null;
    placeType: number = null;
    active?: boolean = null;
    displayName: string = null;

    constructor(data?: any) {
        super();
        const self = this;
        for (const key in data) {

            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
                if (!!data.permission) {
                    self.permission = new PermissionShipment(data.permission);
                }
            }
        }
    }
}
