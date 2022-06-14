import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { GeneralReportComponent } from './general-report.component';
import { ShareReportModule } from '../share-report.module';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: GeneralReportComponent
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
        BsDropdownModule.forRoot(),
        ShareReportModule
    ],
    exports: [],
    declarations: [
        GeneralReportComponent
    ],
    providers: [],
})
export class GeneralReportModule { }
