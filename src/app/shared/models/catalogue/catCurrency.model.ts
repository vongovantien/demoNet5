export class Currency {
  id: string = '';
  currencyName: string = '';
  isDefault: boolean = true;
  userCreated: string = '';
  datetimeCreated: string = '';
  userModified: string;
  datetimeModified: string = '';
  active: boolean = true;
  inactiveOn: string = '';

  constructor(data?: any) {
    const self = this;
    for (const key in data) {
      if (self.hasOwnProperty(key)) {
        self[key] = data[key];
      }
    }
  }
}