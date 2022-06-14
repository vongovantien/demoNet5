import { NgModule } from '@angular/core';
import { JobManagementComponent } from './job-management.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { NgProgressModule } from '@ngx-progressbar/core';
import { JobManagementCreateJobComponent } from './create/create-job.component';
import { JobManagementFormSearchComponent } from './components/form-search-job/form-search-job.component';
import { JobManagementFormCreateComponent } from './components/form-create/form-create-job.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { JobManagementChargeImportComponent } from './job-management-import/job-charge-import.component';
import { LinkChargeJobRepPopupComponent } from './components/popup/link-charge-from-jobRep-popup/link-charge-from-job-rep.popup';
import { ModalModule } from 'ngx-bootstrap/modal';
import { JobManagementLinkFeeComponent } from '../job-management-link-fee/job-management-link-fee.component';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: JobManagementComponent
            },

            {
                path: "new",
                component: JobManagementCreateJobComponent,
                data: { name: "New", }
            },
            {
                path: 'import-charge', component: JobManagementChargeImportComponent, data: { name: "Import Logistics Charge" }
            },
            {
                path: "job-edit",
                loadChildren: () => import('./../job-edit/job-edit.module').then(m => m.JobEditModule),
                data: { name: 'Detail Job', tabSurcharge: 'BUY', allowLinkFee: true }
            },
            {
                path: "job-edit-link-fee",
                loadChildren: () => import('../job-edit/job-edit.module').then(m => m.JobEditModule),
                data: { name: 'Detail Job', tabSurcharge: 'SELL', allowLinkFee: true }
            },

        ]
    },


];

const LIB = [
    NgxDaterangepickerMd,
    NgSelectModule,
    NgProgressModule,
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule,
];

@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        ...LIB
    ],
    exports: [],
    declarations: [
        JobManagementChargeImportComponent,
        JobManagementComponent,
        JobManagementCreateJobComponent,
        JobManagementFormSearchComponent,
        JobManagementFormCreateComponent,
        JobManagementLinkFeeComponent,
        LinkChargeJobRepPopupComponent
    ],
    providers: [
    ],
})
export class JobManagementModule { }
