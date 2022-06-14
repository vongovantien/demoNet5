export class Commodity {
    id: number = 0;
    commodityNameVn: string = '';
    commodityNameEn: string = '';
    commodityGroupId: number = 0;
    commodityGroupNameVn: string = '';
    commodityGroupNameEn: string = '';
    note: string = '';
    userCreated?: string = '';
    datetimeCreated?: Date = null;
    userModified?: string = '';
    datetimeModified?: Date = null;
    active: boolean = false;
    inactiveOn?: Date = null;
    code: String = '';
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}