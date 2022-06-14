export class EmailSetting {
    id?: number = 0;
    emailType: string = "";
    emailInfo: string = "";
    createDate?: string = "";
    modifiedDate?: string = "";
    deptId: number = 0;
    userCreated?: string="";
    userModified?: string="";
    userNameCreated?: string = '';
    userNameModified?: string = '';
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
