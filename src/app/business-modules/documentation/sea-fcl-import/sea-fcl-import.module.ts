import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';

import { SharedModule } from 'src/app/shared/shared.module';
import { SeaFCLImportManagementComponent } from './sea-fcl-import-management.component';
import { SeaFCLImportCreateJobComponent } from './create-job/create-job-fcl-import.component';
import { SeaFCLImportDetailJobComponent } from './detail-job/detail-job-fcl-import.component';
import { SeaFCLImportLazyLoadModule } from './sea-fcl-import-lazy-load.module';
import { SeaFclImportManifestComponent } from './detail-job/manifest/sea-fcl-import-manifest.component';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { DeactivateGuardService } from '@core';
import { ShareSeaServiceModule } from '../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', component: SeaFCLImportManagementComponent, data: {
            name: "", title: 'eFMS Sea FCL Import'
        },
    },
    {
        path: 'new', component: SeaFCLImportCreateJobComponent,
        data: { name: "Create New Job" }
    },
    {
        path: ':jobId',
        data: { transactionType: CommonEnum.TransactionTypeEnum.SeaFCLImport, name: "Job Detail" },
        children: [
            {
                path: '', component: SeaFCLImportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
            },
            {
                path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-fcl-import-hbl.module').then(m => m.SeaFCLImportHBLModule),
                data: {
                    name: "House Bill",
                },
            },
            {
                path: 'manifest', component: SeaFclImportManifestComponent,
                data: { name: "Manifest", },
            },
        ]
    },
];


const LIB = [
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    NgxDaterangepickerMd.forRoot()
];


@NgModule({
    declarations: [
        SeaFCLImportManagementComponent,
        SeaFCLImportCreateJobComponent,
        SeaFCLImportDetailJobComponent,
        SeaFclImportManifestComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
        ...LIB,
        SeaFCLImportLazyLoadModule, // ?  Lazy loading module with  tab component (CD Note, Assignment).
        ShareBussinessModule,
        ShareSeaServiceModule

    ],
    exports: [],
    providers: [],
})
export class SeaFCLImportModule { }
