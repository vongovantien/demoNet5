export class EmailContent {
    from: string = '';
    to: string = '';
    cc: string = '';
    subject: string = '';
    body: string = '';
    attachFiles: any[] = [];

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}