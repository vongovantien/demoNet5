import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { DeactivateGuardService } from '@core';
import { CommonEnum } from '@enums';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { SeaLCLImportLazyLoadModule } from './sea-lcl-import-lazy-load.module';

import { SeaLCLImportComponent } from './sea-lcl-import.component';
import { SeaLCLImportCreateJobComponent } from './create-job/create-job-lcl-import.component';
import { SeaLCLImportDetailJobComponent } from './detail-job/detail-job-lcl-import.component';
import { ShareSeaServiceModule } from '../share-sea/share-sea-service.module';


const routing: Routes = [
    {
        path: '', component: SeaLCLImportComponent, data: {
            name: "", title: 'eFMS Sea LCL Import'
        },
    },
    {
        path: 'new', component: SeaLCLImportCreateJobComponent,
        data: { name: "Create New Job" }
    },
    {
        path: ':jobId',
        data: { transactionType: CommonEnum.TransactionTypeEnum.SeaLCLImport, name: "Job Detail" },
        children: [
            {
                path: '', component: SeaLCLImportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
            },
            {
                path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-lcl-import-hbl.module').then(m => m.SeaLCLImportHBLModule),
                data: {
                    name: "House Bill",
                },
            },
        ]
    },
];

const LIBS = [
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
        ShareBussinessModule,
        ...LIBS,
        ShareSeaServiceModule,
        SeaLCLImportLazyLoadModule, // ?  Lazy loading module with  tab component (CD Note).
    ],
    exports: [],
    declarations: [
        SeaLCLImportComponent,
        SeaLCLImportCreateJobComponent,
        SeaLCLImportDetailJobComponent,
    ],
    providers: [],
})
export class SeaLCLImportModule { }
