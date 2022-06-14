import { CommonEnum } from '@enums';
import { Pipe, PipeTransform } from '@angular/core';
import { AccountingConstants } from '@constants';

@Pipe({
    name: 'classStatusSync'
})

export class ClassStatusSyncPipe implements PipeTransform {
    transform(value: any): string {
        let status = ''
        switch (value) {
            case AccountingConstants.SYNC_STATUS.SYNCED:
                status = CommonEnum.ClassColor.SUCCESS;
                break;
            case AccountingConstants.SYNC_STATUS.REJECTED:
                status = CommonEnum.ClassColor.DANGER
                break;
            default:
                break;
        }

        return status;
    }
}