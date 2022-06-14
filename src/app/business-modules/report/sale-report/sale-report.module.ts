import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SaleReportComponent } from './sale-report.component';
import { ShareReportModule } from '../share-report.module';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: SaleReportComponent
            }
        ]
    },
];

@NgModule({
    imports: [
        SharedModule,
        ShareBussinessModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        ShareReportModule,
    ],
    exports: [],
    declarations: [
        SaleReportComponent,
    ],
    providers: [],
})
export class SaleReportModule { }
