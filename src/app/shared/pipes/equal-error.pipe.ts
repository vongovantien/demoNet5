import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'equalError' })
export class EqualErrorPipe implements PipeTransform {
  transform(errors: any, error: any, args?: any): any {
    if (!errors) {
      return false;
    }
    if (!!Object.keys(errors) && Object.keys(errors).length > 0) {
      if (!!args) {
        return Object.keys(errors).includes(error);
      }
      return Object.keys(errors)[0] === error;
    }
    return false;
  }
}
