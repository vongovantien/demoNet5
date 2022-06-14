import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'specialPermission' })
export class SpecialPermissionPipe implements PipeTransform {
    transform(speciaPermission: SystemInterface.ISpecialAction[], actionKey: string): boolean {
        if (!!speciaPermission && !!speciaPermission.length) {
            const action: SystemInterface.ISpecialAction = speciaPermission.find(p => p.action === actionKey);
            if (!!action) {
                return action.isAllow;
            }
            return false;
        }
        return false;
    }
}


