export class Employee {
    id: string = '';
    employeeNameEn: string = '';
    employeeNameVn: string = '';
    tel: string = '';
    email: string = '';
    title: string = '';
    staffCode: string = '';
    bankAccountNo: string = '';
    bankName: string = '';
    photo: string = '';
    personalId: string = '';
    constructor(data?: any) {
        let self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
