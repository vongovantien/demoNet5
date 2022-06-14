import { CommonEnum } from '@enums';
import { Pipe, PipeTransform } from '@angular/core';
import { AccountingConstants } from '@constants';

@Pipe({
    name: 'classStatusApproval'
})

export class ClassStatusApprovalPipe implements PipeTransform {
    transform(value: any): string {
        let status = ''
        switch (value) {
            case AccountingConstants.STATUS_APPROVAL.NEW:
            case AccountingConstants.STATUS_APPROVAL.DENIED:
                status = CommonEnum.ClassColor.DANGER;
                break;
            case AccountingConstants.STATUS_APPROVAL.ACCOUNTANT_MANAGER_APPROVED:
            case AccountingConstants.STATUS_APPROVAL.DEPARTMENT_MANAGER_APPROVED:
            case AccountingConstants.STATUS_APPROVAL.LEADER_APPROVED:
            case AccountingConstants.STATUS_APPROVAL.REQUEST_APPROVAL:
                status = CommonEnum.ClassColor.PRIMARY
                break;
            case AccountingConstants.STATUS_APPROVAL.DONE:
                status = CommonEnum.ClassColor.SUCCESS
                break;
            default:
                break;
        }

        return status;
    }
}