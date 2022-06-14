import { Charge } from './catCharge.model';
import { CatChargeDefaultAccount } from './catChargeDefaultAccount.model';
import { PermissionShipment } from '../document/permissionShipment';

export class CatChargeToAddOrUpdate {
    charge: Charge = new Charge();
    listChargeDefaultAccount: CatChargeDefaultAccount[] = [];
    permission: PermissionShipment = new PermissionShipment();
}
