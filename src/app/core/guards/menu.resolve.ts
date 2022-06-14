import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SystemRepo } from '@repositories';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { IAppState } from '../../store/reducers';
import { MenuUpdatePermissionAction } from '../../store/actions';

@Injectable()
export class MenuResolveGuard implements Resolve<any> {
    specialUrls = ["profile"];

    constructor(
        private _systemRepo: SystemRepo,
        private _store: Store<IAppState>
    ) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<SystemInterface.IUserPermission> | Promise<any> | any {
        const pathArray = state.url.split("/").filter(i => Boolean(i));
        if (this.specialUrls.includes(pathArray[1])) {
            return of(true);
        }
        if (!!pathArray[2]) {
            return this._systemRepo.getUserPermissionByMenu(pathArray[2])
                .pipe()
                .subscribe(
                    (res: SystemInterface.IUserPermission) => {
                        this._store.dispatch(new MenuUpdatePermissionAction(res));

                        if (!!res && !res.access) {
                            window.location.href = '#/403';

                        }
                        if (pathArray[3] === 'new') {
                            if (!res.allowAdd) {
                                window.location.href = '#/403';
                            }
                        }
                        if (pathArray[3] === 'import') {
                            if (!res.import) {
                                window.location.href = '#/403';

                            }
                        }
                    },
                    (err: HttpErrorResponse | number | any) => {
                        switch (err.status) {
                            case 403:
                                window.location.href = '#/403';
                                break;
                            default:
                                // this._router.navigate(["/login"]);
                                break;
                        }
                    }
                );
        }
    }


}
