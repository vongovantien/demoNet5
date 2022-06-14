import { CsTransactionDetail } from "./csTransactionDetail";
import { Container } from "./container.model";

export class CsManifest {
  jobId: string = "00000000-0000-0000-0000-000000000000";
  refNo: string = null;
  supplier: string = null;
  attention: string = null;
  masksOfRegistration: string = null;
  voyNo: String = null;
  pol: string = null;
  pod: string = null;
  invoiceDate: Date = null;
  consolidator: string = null;
  deConsolidator: string = null;
  weight: number = null;
  volume: number = null;
  paymentTerm: string = null;
  manifestIssuer: string = null;
  userCreated: string = null;
  createdDate: Date = null;
  userModified: string = null;
  modifiedDate: Date = null;
  active: boolean = true;
  inactiveOn: Date = null;
  csTransactionDetails: CsTransactionDetail[] = null;
  polName: string = null;
  podName: string = null;
  csMawbcontainers: Container[] = null;
  manifestShipper: string = null;
}
