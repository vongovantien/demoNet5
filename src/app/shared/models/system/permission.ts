import { BaseModel } from "../base.model";
import { Office } from "./office";

export class Permission extends BaseModel {
    name: string = 'OPS Permission HCm';
    roleId: number = 0;
    type: string = 'Standard';
    roleName: string = 'Operation';
    active: boolean = true;

    sysPermissionSampleGenerals: PermissionSampleGeneral[] = [];
    sysPermissionSampleSpecials: PermissionSampleSpecial[] = [];

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

export class PermissionSample {
    roleName: string;
    id: string = '';
    name: string = '';
    roleId: any = null;
    type: string = '';
    active: boolean = false;
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    userId: string = '';
    userTitle: string = '';
    officeName: string = '';
    permissionName: string = '';
    officeId: string = null;
    buid: string = null;
    permissionSampleId: string = null;
    sysPermissionSampleGenerals: PermissionSampleGeneral[] = new Array<PermissionSampleGeneral>();
    sysPermissionSampleSpecials: PermissionSampleSpecial[] = new Array<PermissionSampleSpecial>();
    isDup: boolean = false;
    userName: string = null;
    companyName: string = '';
    nameUserCreated: string = '';
    nameUserModified: string = '';
    //
    companyAbbrName: string = '';
    officeAbbrName: string = '';


    // custom
    offices: Office[] = [];
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];

                if (!!self.sysPermissionSampleGenerals) {
                    self.sysPermissionSampleGenerals = self.sysPermissionSampleGenerals.map(i => new PermissionSampleGeneral(i));
                }
                if (!!self.sysPermissionSampleSpecials) {
                    self.sysPermissionSampleSpecials = self.sysPermissionSampleSpecials.map(i => new PermissionSampleSpecial(i));

                }
            }
        }
    }
}


export class PermissionGeneral {
    permissionID: string = '';
    moduleName: string = '';
    moduleID: string = '';
    userPermissionId: string = '';
}

export class PermissionSampleGeneral extends PermissionGeneral {
    sysPermissionGenerals: PermissionGeneralItem[] = [];

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

export class PermissionGeneralItem {
    access: boolean;
    delete: string;
    detail: string;
    export: boolean;
    import: boolean;
    write: string;
    list: boolean;
    menuId: boolean;
    menuName: string;
    disabled: boolean;
}

export class PermissionSampleSpecial extends PermissionGeneral {
    sysPermissionSpecials: [] = [];

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
