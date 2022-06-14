import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CommonEnum } from '@enums';
import { DeactivateGuardService } from '@core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ChargeConstants } from '@constants';

import { SeaLCLExportLazyLoadModule } from './sea-lcl-export-lazy-load.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { SeaLCLExportComponent } from './sea-lcl-export.component';

import { SeaLCLExportCreateJobComponent } from './create-job/create-job-lcl-export.component';
import { SeaLCLExportDetailJobComponent } from './detail-job/detail-job-lcl-export.component';
import { SeaLclExportManifestComponent } from './detail-job/manifest/sea-lcl-export-manifest.component';
import { SeaLclExportShippingInstructionComponent } from './detail-job/shipping-instruction/sea-lcl-export-shipping-instruction.component';
import { ShareBusinessReAlertComponent } from '../../share-business/components/pre-alert/pre-alert.component';
import { ShareSeaServiceModule } from '../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Sea LCL Export' }, children: [
            {
                path: '', component: SeaLCLExportComponent
            },
            {
                path: 'booking-note', loadChildren: () => import('./booking-note/sea-lcl-export-booking-note.module').then(m => m.SeaLCLExportBookingNoteModule),
                data: {
                    name: "Booking Note",
                },
            }
        ]
    },
    {
        path: 'new', component: SeaLCLExportCreateJobComponent,
        data: { name: "Create New Job" }
    },
    {
        path: ':jobId',
        data: { transactionType: CommonEnum.TransactionTypeEnum.SeaLCLExport, name: "Job Detail" },
        children: [
            {
                path: '', component: SeaLCLExportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
            },
            {
                path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-lcl-export-hbl.module').then(m => m.SeaLCLExportHBLModule),
                data: {
                    name: "House Bill",
                },
            },
            {
                path: 'manifest', component: SeaLclExportManifestComponent,
                data: { name: "Manifest", },
            },
            {
                path: 'si',
                data: { name: "Shipping Instructions", },
                children: [
                    {
                        path: '', component: SeaLclExportShippingInstructionComponent, data: { name: "" }
                    },
                    {
                        path: 'send-si', component: ShareBusinessReAlertComponent, data: {
                            name: "Send S.I", serviceId: ChargeConstants.SLE_CODE
                        }
                    },
                ]
            },

        ]
    },


];

const LIBS = [
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    PerfectScrollbarModule,
    NgxDaterangepickerMd.forRoot(),
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
        ShareBussinessModule,
        SeaLCLExportLazyLoadModule,
        ShareSeaServiceModule,
        ...LIBS,
    ],
    exports: [],
    declarations: [
        SeaLCLExportComponent,
        SeaLCLExportCreateJobComponent,
        SeaLCLExportDetailJobComponent,
        SeaLclExportManifestComponent,
        SeaLclExportShippingInstructionComponent,
    ],
    providers: [],
})
export class SeaLCLExportModule { }
