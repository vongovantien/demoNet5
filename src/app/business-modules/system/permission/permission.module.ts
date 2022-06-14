import { NgModule } from '@angular/core';
import { PermissionComponent } from './permission.component';
import { Routes, RouterModule } from '@angular/router';
import { PermissionFormSearchComponent } from './components/form-search-permission/form-search-permission.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PermissionCreateComponent } from './add/add-permission.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PermissionDetailComponent } from './detail/detail-permission.component';
import { ShareSystemModule } from '../share-system.module';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: PermissionComponent
            },
            {
                path: 'new', component: PermissionCreateComponent, data: { name: "New" }
            },
            {
                path: ':id', component: PermissionDetailComponent, data: { name: "Detail" }
            }
        ]
    },
];

const COMPONENTS = [
    PermissionFormSearchComponent,
    // PermissionFormCreateComponent
];

@NgModule({
    declarations: [
        PermissionComponent,
        PermissionCreateComponent,
        PermissionDetailComponent,
        ...COMPONENTS
    ],
    imports: [
        SharedModule,
        TabsModule.forRoot(),
        PaginationModule.forRoot(),
        ShareSystemModule,
        RouterModule.forChild(routing)
    ],
    exports: [],
    providers: [],
})
export class PermissionModule { }

