import { NgModule } from '@angular/core';
import { UserManagementComponent } from './user-management.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgProgressModule } from '@ngx-progressbar/core';
import { Routes, RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UserFormSearchComponent } from './components/form-search-user/form-search-user.component';
import { UserAddNewComponent } from './addnew/user.addnew.component';
import { FormAddUserComponent } from './components/form-add-user/form-add-user.component';
import { UserDetailsComponent } from './details/user-details.component';
import { UserManagementImportComponent } from './import/user-management-import.component';
import { AddRoleUserComponent } from './components/add-role-user/add-role-user.component';
import { ShareSystemDetailPermissionComponent } from './../components/permission/permission-detail.component';
import { ShareSystemModule } from '../share-system.module';
import { UserManagementAddGroupPopupComponent } from './components/popup/add-group/user-management-add-group.popup';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: UserManagementComponent
            },
            {
                path: 'import', component: UserManagementImportComponent, data: { name: "Import" }
            },
            {
                path: 'new', component: UserAddNewComponent, data: { name: "Create User" }
            },
            {
                path: ':id', component: UserDetailsComponent, data: { name: "Edit User" }
            },
            {
                path: ':id/permission/:permissionId/:type', component: ShareSystemDetailPermissionComponent, data: { name: "UserPermission" }
            },
        ]
    },
];

@NgModule({
    imports: [
        SharedModule,
        NgProgressModule,
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
        RouterModule.forChild(routing),
        ShareSystemModule,
        ModalModule
    ],
    exports: [],
    declarations: [
        UserManagementComponent,
        UserFormSearchComponent,
        FormAddUserComponent,
        UserAddNewComponent,
        UserDetailsComponent,
        UserManagementImportComponent,
        AddRoleUserComponent,
        UserManagementAddGroupPopupComponent,
    ],
    providers: [],
})
export class UserManagementModule { }
