import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { AirImportComponent } from './air-import.component';
import { AirImportLazyLoadModule } from './air-import-lazy-load.module';
import { AirImportCreateJobComponent } from './create-job/create-job-air-import.component';
import { AirImportDetailJobComponent } from './detail-job/detail-job-air-import.component';
import { DeactivateGuardService } from '@core';
import { ShareAirServiceModule } from '../share-air/share-air-service.module';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Air Import' }, children: [
            {
                path: '', component: AirImportComponent
            },
            {
                path: 'new', component: AirImportCreateJobComponent,
                data: { name: "Create New Job" }
            },
            {
                path: ':jobId',
                data: { transactionType: CommonEnum.TransactionTypeEnum.AirImport, name: "Job Detail" },
                children: [
                    {
                        path: '', component: AirImportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
                    },
                    {
                        path: 'hbl', loadChildren: () => import('./detail-job/hbl/air-import-hbl.module').then(m => m.AirImportHBLModule),
                        data: {
                            name: "House Bill",
                        },
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
];

@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        ShareBussinessModule,
        AirImportLazyLoadModule,
        ShareAirServiceModule,
        ...LIB,
    ],
    exports: [],
    declarations: [
        AirImportComponent,
        AirImportCreateJobComponent,
        AirImportDetailJobComponent
    ],
    providers: [],
})
export class AirImportModule { }
