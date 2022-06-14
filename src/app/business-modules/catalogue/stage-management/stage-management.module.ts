import { NgModule } from '@angular/core';

import { StageManagementComponent } from './stage-management.component';
import { RouterModule, Routes } from '@angular/router';
import { StageImportComponent } from '../stage-import/stage-import.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgProgressModule } from '@ngx-progressbar/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { StageManagementAddPopupComponent } from './components/form-create/form-create-stage-management.popup';
import { NgSelectModule } from '@ng-select/ng-select';


const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Stage' },
        children: [
            {
                path: '', component: StageManagementComponent
            },
            {
                path: 'stage-import', component: StageImportComponent, data: { name: "Import" }
            },
        ]
    },
];

@NgModule({
    imports: [
        SharedModule,
        ModalModule.forRoot(),
        NgSelectModule,
        NgProgressModule,
        RouterModule.forChild(routing),
        PaginationModule.forRoot(),
    ],
    exports: [],
    declarations: [
        StageManagementComponent,
        StageImportComponent,
        StageManagementAddPopupComponent
    ],
    providers: [],
})
export class
    StateManagementModule { }
