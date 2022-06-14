
export class PermissionHouseBill {
    allowUpdate: boolean = false;
    allowDelete: boolean = false;
    allowAddCharge: boolean = true;
    allowUpdateCharge: boolean = true;
    allowLock: boolean = false;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}