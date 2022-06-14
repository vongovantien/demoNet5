import { CsTransactionDetail } from "./csTransactionDetail";

export class CsShippingInstruction {
  jobId: string = "00000000-0000-0000-0000-000000000000";
  refNo: string = null;
  bookingNo: string = null;
  invoiceDate: Date = null;
  issuedUser: string = null;
  supplier: string = null;
  invoiceNoticeRecevier: string = null;
  shipper: string = null;
  consigneeId: string = null;
  consigneeDescription: string = null;
  cargoNoticeRecevier: string = null;
  actualShipperId: string = null;
  actualShipperDescription: string = null;
  actualConsigneeId: string = null;
  actualConsigneeDescription: string = null;
  paymenType: string = null;
  remark: string = null;
  routeInfo: string = null;
  pol: string = null;
  loadingDate: Date = null;
  pod: string = null;
  poDelivery: string = null;
  voyNo: string = null;
  containerSealNo: string = null;
  goodsDescription: string = null;
  containerNote: string = null;
  packagesNote: string = null;
  grossWeight: number = null;
  volume: number = null;
  issuedUserName: string = null;
  supplierName: string = null;
  consigneeName: string = null;
  actualShipperName: string = null;
  actualConsigneeName: string = null;
  polName: string = null;
  podName: string = null;
  userCreated: string = null;
  createdDate: Date = null;
  userModified: string = null;
  modifiedDate: Date = null;
  active: boolean = true;
  inactiveOn: Date = null;
  csTransactionDetails: CsTransactionDetail[] = null;
  // csMawbcontainers: Container[] = [];

  constructor(object?: any) {
    const self = this;
    for (const key in object) {
      if (self.hasOwnProperty(key.toString())) {
        self[key] = object[key];
      }
    }
  }
}
