import { Component } from '@angular/core';
import { PermissionCreateComponent } from '../add/add-permission.component';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { PermissionSample } from 'src/app/shared/models';

@Component({
    selector: 'app-detail-permission',
    templateUrl: './detail-permission.component.html',
    styleUrls: ['./../add/add-permission.component.scss']
})
export class PermissionDetailComponent extends PermissionCreateComponent {

    permissionId: string = '';
    constructor(
        protected _systemRepo: SystemRepo,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        private _activedRouter: ActivatedRoute,
        protected _router: Router,


    ) {
        super(_systemRepo, _progressService, _toastService, _router);
        this._progressRef = this._progressService.ref();
    }

    ngOnInit(): void {
        this.levelPermissions = [
            'Owner', 'Group', 'Department', 'Office', 'Company', 'All'
        ];
        this._activedRouter.params
            .pipe(
                tap((param: Params) => {
                    if (param.id) {
                        this.permissionId = param.id;
                    }
                }),
                switchMap(() => this._systemRepo.getPermissionSample(this.permissionId)
                    .pipe(catchError(this.catchError))
                )
            )
            .subscribe(
                (res: any) => {
                    this.permissionSample = new PermissionSample(res);
                }
            );
    }


    updatePermission(formDataCreate: { roleName: string; name: string; type: string; roleId: any; active: boolean }) {
        this.updatePermissionModel(formDataCreate);

    }

}
