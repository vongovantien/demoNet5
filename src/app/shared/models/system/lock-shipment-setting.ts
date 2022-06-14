import { SystemConstants } from "@constants";

export class LockShipmentSetting {
    id: number = 0;
    officeId: string = null;
    serviceType: string = null;
    lockDate: number = null;
    lockAfterUnlocking: number = null;  // Từ ngày mở sau bao nhiêu ngày sẽ đóng
    isApply: boolean = false;
    userModified: string = null;
    userCreated: string = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
