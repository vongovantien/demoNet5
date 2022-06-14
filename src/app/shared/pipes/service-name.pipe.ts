import { Pipe, PipeTransform } from '@angular/core';
import { ChargeConstants } from '@constants';
@Pipe({
    name: 'serviceName'
})

export class ServiceNamePipe implements PipeTransform {
    transform(value: string): any {
        if (!!value) {
            return this.getServiceName(value);
        }
        return '';
    }

    getServiceName(type: string) {
        return new Map([
            [ChargeConstants.AE_CODE, [ChargeConstants.AE_DES]],
            [ChargeConstants.AI_CODE, [ChargeConstants.AI_DES]],
            [ChargeConstants.SFE_CODE, [ChargeConstants.SFE_DES]],
            [ChargeConstants.SFI_CODE, [ChargeConstants.SFI_DES]],
            [ChargeConstants.SLE_CODE, [ChargeConstants.SLE_DES]],
            [ChargeConstants.SLI_CODE, [ChargeConstants.SLI_DES]],
            [ChargeConstants.CL_CODE, [ChargeConstants.CL_DES]],
            [ChargeConstants.IT_CODE, [ChargeConstants.IT_DES]],
            [ChargeConstants.SCE_CODE, [ChargeConstants.SCE_DES]],
            [ChargeConstants.SCI_CODE, [ChargeConstants.SCI_DES]],

        ]).get(type)[0];
    }
}
