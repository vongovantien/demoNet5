export class UserGroup {
    id: number = 0;
    groupId: number = 0;
    userId: string = '';
    userCreated: string = '';
    datetimeCreated: Date = null;
    userModified: string = '';
    datetimeModified: Date = null;
    active: boolean;
    inactiveOn: Date = null;
    constructor(data?: any) {
        let self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
