import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full'
    },
    {
        path: 'company', loadChildren: () => import('./company/company-information.module').then(m => m.CompanyInformationModule),
        data: { name: 'Company', title: 'eFMS Company' }
    },
    {
        path: 'department', loadChildren: () => import('./department/department.module').then(m => m.DepartmentModule),
        data: { name: 'Department', title: 'eFMS Department' }
    },
    {
        path: 'group', loadChildren: () => import('./group/group.module').then(m => m.GroupModule),
        data: { name: 'Group', title: 'eFMS Group' }
    },
    {
        path: 'permission', loadChildren: () => import('./permission/permission.module').then(m => m.PermissionModule),
        data: { name: 'Permission', title: 'eFMS Permission' }
    },
    {
        path: 'role',
        component: RoleComponent
    },
    {
        path: 'user-management', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
        data: { name: 'User Management', title: 'eFMS User' }
    },
    {
        path: 'office', loadChildren: () => import('./office/office.module').then(m => m.OfficeModule),
        data: { name: 'Office', title: 'eFMS Office' }
    },
    {
        path: 'authorization', loadChildren: () => import('./authorization/authorization.module').then(m => m.AuthorizationModule),
        data: { name: 'Authorization', title: 'eFMS Authorization' }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemRoutingModule { }
