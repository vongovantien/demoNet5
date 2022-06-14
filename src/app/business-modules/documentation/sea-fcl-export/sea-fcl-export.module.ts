import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { SeaFCLExportComponent } from './sea-fcl-export.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SeaFCLExportCreateJobComponent } from './create-job/create-job-fcl-export.component';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { SeaFCLExportDetailJobComponent } from './detail-job/detail-job-fcl-export.component';
import { SeaFCLExportLazyLoadModule } from './sea-fcl-export-lazy-load.module';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { SeaFclExportShippingInstructionComponent } from './detail-job/shipping-instruction/sea-fcl-export-shipping-instruction.component';
import { SeaFclExportManifestComponent } from './detail-job/manifest/sea-fcl-export-manifest.component';
import { ShareBusinessReAlertComponent } from '../../share-business/components/pre-alert/pre-alert.component';
import { ChargeConstants } from 'src/constants/charge.const';
import { DeactivateGuardService } from '@core';
import { ShareSeaServiceModule } from '../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', component: SeaFCLExportComponent, data: {
            name: "", title: 'eFMS Sea FCL Export'
        },
    },
    {
        path: 'new', component: SeaFCLExportCreateJobComponent,
        data: { name: "Create New Job" }
    },
    {
        path: ':jobId',
        data: { transactionType: CommonEnum.TransactionTypeEnum.SeaFCLExport, name: "Job Detail" },
        children: [
            {
                path: '', component: SeaFCLExportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
            },
            {
                path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-fcl-export-hbl.module').then(m => m.SeaFCLExportHBLModule),
                data: {
                    name: "House Bill",
                },
            },
            {
                path: 'manifest', component: SeaFclExportManifestComponent,
                data: { name: "Manifest", },
            },
            {
                path: 'si',
                data: { name: "Shipping Instructions", },
                children: [
                    {
                        path: '', component: SeaFclExportShippingInstructionComponent, data: { name: "" }
                    },
                    {
                        path: 'send-si', component: ShareBusinessReAlertComponent, data: {
                            name: "Send S.I", serviceId: ChargeConstants.SFE_CODE
                        }
                    },
                ]
            },
        ]
    },
];

const LIB = [
    NgxDaterangepickerMd.forRoot(),
    PerfectScrollbarModule,
    TabsModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
];

@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        ShareBussinessModule,
        ...LIB,
        ShareSeaServiceModule,
        SeaFCLExportLazyLoadModule // ?  Lazy loading module with  tab component (CD Note)

    ],
    exports: [],
    declarations: [
        SeaFCLExportComponent,
        SeaFCLExportCreateJobComponent,
        SeaFCLExportDetailJobComponent,
        SeaFclExportShippingInstructionComponent,
        SeaFclExportManifestComponent,
    ],
    providers: [],
})
export class SeaFCLExportModule { }
