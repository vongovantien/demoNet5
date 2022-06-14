import { CatChargeIncoterm } from "./charge-incoterm";
import { BaseModel } from "../base.model";


export class Incoterm extends BaseModel {
    code: string = null;
    nameEn: string = null;
    nameLocal: string = null;
    active: boolean = null;
    descriptionEn: string = null;
    descriptionLocal: string = null;
    service: string = null;
}

export class IncotermUpdateModel {
    incoterm: IncotermModel = null;
    sellings: CatChargeIncoterm[] = [];
    buyings: CatChargeIncoterm[] = [];

    constructor(object?: Object) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key)) {
                self[key] = object[key];
            }
        }
    }
}

export class IncotermModel extends Incoterm {

    userCreatedName: string = null;
    UserModifiedName: string = null;

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



