export class CommodityGroup {
    id: number = 0;
    groupNameVn: string = '';
    groupNameEn: string = '';
    note: string = '';
    userCreated?: string = '';
    datetimeCreated?: Date = null;
    userModified?: string = '';
    datetimeModified?: Date = null;
    active: boolean = false;
    inactiveOn?: Date = null;
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}