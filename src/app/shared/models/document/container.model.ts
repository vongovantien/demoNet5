import { random } from "lodash";

export class Container {
  id: string = "00000000-0000-0000-0000-000000000000";
  mblid: string = "00000000-0000-0000-0000-000000000000";
  hblid: string = null;
  containerTypeId: number = null;
  quantity: number = 1;
  containerNo: string = null;
  sealNo: string = null;
  markNo: string = null;
  unitOfMeasureId: any = null;
  unitOfMeasureName: string = null;
  commodityId: number = null;
  packageTypeId: number = null;
  packageQuantity: number = null;
  description: string = '';
  gw: number = 0;
  nw: number = 0;
  chargeAbleWeight: number = 0;
  cbm: number = 0;
  partof: boolean = null;
  ownerId: string = null;
  offHireDepot: string = null;
  offHireRefNo: string = null;
  userModified: string = null;
  datetimeModified: Date = null;
  allowEdit: boolean = false;
  containerTypeName: string = null;
  commodityName: string = null;
  packageTypeName: string;

  // * Custom
  isPartOfContainer: boolean = false; // để generate vào inWord HBL hàng FCL.
  duplicate: boolean = false;
  key: number = Math.random();

  constructor(object?: any) {
    const self = this;
    for (const key in object) {
      if (self.hasOwnProperty(key.toString())) {
        self[key] = object[key];
      }
    }
  }
}