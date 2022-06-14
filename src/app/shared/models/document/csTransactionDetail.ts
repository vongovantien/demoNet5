import { NullLogger } from '@microsoft/signalr';
import { Container } from './container.model';
import { PermissionHouseBill } from './permissionHouseBill';

export class CsTransactionDetail {
  id: string = "00000000-0000-0000-0000-000000000000";
  jobId: string = "00000000-0000-0000-0000-000000000000";
  jobNo: string = null;//
  mawb: string = null;
  hwbno: string = null;
  hbltype: string = null;
  customerId: string = null;
  saleManId: string = null;
  shipperDescription: string = null;
  shipperId: string = null;
  consigneeDescription: string = null;
  consigneeId: string = null;
  notifyPartyDescription: string = null;
  notifyPartyId: string = null;
  alsoNotifyPartyDescription: string = null;
  alsoNotifyPartyId: string = null;
  customsBookingNo: string = null;
  localVoyNo: string = null;
  localVessel: string = null;
  oceanVoyNo: string = null;
  oceanVessel: string = null;
  originCountryId: number = 0;
  pickupPlace: string = null;
  etd: string = null;
  eta: string = null;
  pol: string = null;
  pod: string = null;
  polDescription: string = null;
  podDescription: string = null;
  deliveryPlace: string = null;
  finalDestinationPlace: string = null;
  coloaderId: string = null;
  freightPayment: string = null;
  placeFreightPay: string = null;
  closingDate: any = null;
  sailingDate: any = null;
  forwardingAgentDescription: string = null;
  forwardingAgentId: string = null;
  goodsDeliveryDescription: string = null;
  goodsDeliveryId: string = null;
  originBlnumber: number = 0;
  issueHblplace: string = null;
  issueHbldate: string = null;
  referenceNo: string = null;
  exportReferenceNo: string = null;
  moveType: string = null;
  purchaseOrderNo: string = null;
  serviceType: string = null;
  documentDate: string = null;
  documentNo: string = null;
  etawarehouse: string = null;
  warehouseNotice: string = null;
  shippingMark: string = null;
  remark: string = null;
  commodity: string = null;
  packageContainer: string = null;
  desOfGoods: string = null;
  netWeight: number = 0;
  grossWeight: number = 0;
  chargeWeight: number = 0;
  cbm: number = 0;
  active: Boolean = true;
  inactiveOn: string = null;
  inWord: string = null;
  onBoardStatus: string = null;
  manifestRefNo: string = null;
  userCreated: string = null;
  datetimeCreated: string = null;
  userModified: string = null;
  datetimeModified: string = null;
  csMawbcontainers: Container[] = [];
  userNameCreated: string = null;
  userNameModified: string = null;

  customerName: string = null;
  saleManName: string = null;
  customerNameVn: string = null;
  saleManNameVn: string = null;
  forwardingAgentName: string = null;
  notifyParty: string = null;
  polName: string = null;
  podName: string = null;
  contSealNo: string;
  containerNames: string = null;
  packageTypes: string = null;
  cw: number = 0;
  gw: number = 0;
  packages: string = null;
  containers: string = null;
  issueHblplaceAndDate: any = null;
  bookingNo: string = null;
  // * SEA FCL
  serviceDate: string = '';
  mbltype: string = '';
  shipmentType: string = '';
  flightVesselName: string = '';
  voyNo: string = '';
  pono: string = '';
  typeOfService: string = '';
  notes: string = '';
  shipperName: string = '';
  consigneeName: string = '';
  packageQty: number = null;
  packageType: string = null;
  transactionType: string = null;
  rateCharge: number = null;
  flexId: string = '';
  flightNoRowTwo: string = '';
  contactPerson: string = '';
  closingTime: string = '';
  incotermId: string = null;
  receivedBillTime: any = null;
  officeId: string = null;
  companyId: string = null;

  constructor(object?: any) {
    const self = this;
    for (const key in object) {
      if (self.hasOwnProperty(key.toString())) {
        self[key] = object[key];
      }
    }
  }
}