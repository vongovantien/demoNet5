export class Role {
    id: number = 0;
    code: string = '';
    name: string = '';
    description: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';;
    active: boolean = true;
    inactiveOn: any = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
