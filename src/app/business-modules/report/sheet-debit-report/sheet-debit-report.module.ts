import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SheetDebitReportComponent } from './sheet-debit-report.component';
import { ShareReportModule } from '../share-report.module';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: SheetDebitReportComponent
            }
        ]
    },
];
@NgModule({
    imports: [
        SharedModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        ShareReportModule
    ],
    exports: [],
    declarations: [
        SheetDebitReportComponent
    ],
    providers: [],
})
export class SheetDebitReportModule { }
