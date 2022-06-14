import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SystemRepo } from '@repositories';
import { Observable } from 'rxjs';
import { Group } from '@models';
import { NgProgress } from '@ngx-progressbar/core';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ComboGridVirtualScrollComponent } from '@common';

@Component({
    selector: 'usermanagement-add-group-popup',
    templateUrl: './user-management-add-group.popup.html'
})

export class UserManagementAddGroupPopupComponent extends PopupBase implements OnInit {
    @ViewChild('combogridGroup') comboGridGroup: ComboGridVirtualScrollComponent;

    @Input() userId: string;
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();

    groups: Observable<Group[]>;
    selectedGroup: Group;
    selectedPosition: CommonInterface.INg2Select;

    positions: CommonInterface.INg2Select[] = [
        { id: 'Manager-Leader', text: 'Manager-Leader' },
        { id: 'Deputy', text: 'Deputy' },
        { id: 'Assistant', text: 'Assistant' },
        { id: 'Staff', text: 'Staff' },
    ];

    constructor(
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService

    ) {
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit() {
        this.groups = this._systemRepo.getListGroup();
    }

    onSelectGroup(group: Group) {
        this.selectedGroup = group;
    }

    onSaveGroup() {
        this.isSubmitted = true;
        if (!this.selectedPosition || !this.selectedGroup) {
            return;
        }
        const body = {
            userId: this.userId,
            groupId: this.selectedGroup.id,
            departmentId: this.selectedGroup.departmentId,
            officeId: this.selectedGroup.officeId,
            companyId: this.selectedGroup.companyId,
            position: this.selectedPosition,
            active: true
        };
        this._progressRef.start();
        this._systemRepo.addUserToGroupLevel([body])
            .pipe(finalize(() => {
                this._progressRef.complete();
            }))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onUpdate.emit();
                        this.hide();
                        this.resetForm();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    resetForm() {
        this.isSubmitted = false;
        this.selectedGroup = null;
        this.selectedPosition = null;
        this.comboGridGroup.setCurrentActiveItemId({ field: 'id', value: null });
    }
}
