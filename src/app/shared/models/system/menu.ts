import { BaseModel } from "../base.model";

export class Menu extends BaseModel {
    parentId: string = null;
    name: string = null;
    description: string = null;
    assemplyName: string = null;
    icon: string = null;
    sequence: string = null;
    arguments: string = null;
    route: string = null;
    displayChild: boolean = false;
    display: boolean = false;
    orderNumber: string = null;
    subMenus: Menu[] = new Array<Menu>();

    constructor(data?: any) {
        super();
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
