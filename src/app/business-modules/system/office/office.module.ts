import { NgModule } from '@angular/core';
import { OfficeComponent } from './office.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgProgressModule } from '@ngx-progressbar/core';
import { Routes, RouterModule } from '@angular/router';
import { OfficeAddNewComponent } from './addnew/office.addnew.component';
import { OfficeDetailsComponent } from './details/office-details.component';
import { OfficeFormSearchComponent } from './components/form-search-office/form-search-office.component';
import { OfficeFormAddComponent } from './components/form-add-office/form-add-office.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ShareSystemModule } from 'src/app/business-modules/system/share-system.module';
import { ShareSystemDetailPermissionComponent } from './../components/permission/permission-detail.component';
import { OfficeFormApproveSettingComponent } from './components/form-approve-setting/form-approve-setting-office.component';
import { NgSelectModule } from '@ng-select/ng-select';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: OfficeComponent
            },
            {
                path: 'addnew', component: OfficeAddNewComponent, data: { name: "New" }
            },
            {

                path: ':id', component: OfficeDetailsComponent, data: { name: "Edit" }
            },
            {
                path: ':id/:uid/:type', component: ShareSystemDetailPermissionComponent, data: { name: "UserPermission" }
            }
        ]
    },
];

@NgModule({
    imports: [
        SharedModule,
        NgProgressModule,
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
        ShareSystemModule,
        RouterModule.forChild(routing),
        NgSelectModule
    ],
    exports: [],
    declarations: [
        OfficeComponent,
        OfficeAddNewComponent,
        OfficeDetailsComponent,
        OfficeFormSearchComponent,
        OfficeFormAddComponent,
        OfficeFormApproveSettingComponent
    ],
    providers: [],
})
export class OfficeModule { }
