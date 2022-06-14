import { PermissionShipment } from "@models";

export class PortIndex {
    id: string = null;
    code: string;
    nameEn: string;
    nameVn: string;
    countryID?: number;
    areaID?: string;
    countryName: string;
    areaName: string;
    modeOfTransport: string;
    placeType: number;
    active?: boolean;
    warehouseId: string;
    permission?: PermissionShipment;

    warehouseNameEn: string = null;
    warehouseNameVn: string = null;
    countryNameEN: string = null;
    userCreated: string = null;
    userModified: string = null;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}