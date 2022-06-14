import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SystemRepo } from 'src/app/shared/repositories';
import { Role } from 'src/app/shared/models';

@Component({
    selector: 'form-search-permission',
    templateUrl: './form-search-permission.component.html',
})
export class PermissionFormSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<ISearchPermission | any> = new EventEmitter<ISearchPermission | any>();

    formSearch: FormGroup;
    roles: Role[] = new Array<Role>();
    statuss: CommonInterface.IValueDisplay[];

    constructor(
        protected _fb: FormBuilder,
        protected _systemRepo: SystemRepo
    ) {
        super();

        this.requestReset = this.resetFormSearch;
        this.requestSearch = this.submitSearch;


        this.statuss = [
            { displayName: 'Active', value: true },
            { displayName: 'Inactive', value: false }
        ];
    }

    ngOnInit(): void {
        this.initFormSearch();
        this.getSystemRole();
    }

    getSystemRole() {
        this._systemRepo.getSystemRole()
            .subscribe(
                (res: any[]) => {
                    this.roles = (res || []).map(role => new Role(role));
                }
            );
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            permissionName: [],
            role: [],
            status: [],
        });
    }


    submitSearch() {
        const body: ISearchPermission = {
            name: this.formSearch.value.permissionName,
            active: !!this.formSearch.value.status ? this.formSearch.value.status.value : null,
            roleId: !!this.formSearch.value.role ? this.formSearch.value.role.id : null,
        };

        this.onSearch.emit(body);
    }

    resetFormSearch() {
        this.formSearch.reset();
        this.onSearch.emit({});
    }
}

interface ISearchPermission {
    name: string;
    active: boolean;
    roleId: string;
}


