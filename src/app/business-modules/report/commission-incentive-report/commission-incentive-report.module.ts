import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CommissionIncentiveReportComponent } from './commission-incentive-report.component';
import { ShareReportModule } from '../share-report.module';

const routing: Routes = [
  {
    path: '', data: { name: "" },
    children: [
      {
        path: '', component: CommissionIncentiveReportComponent
      }
    ]
  },
];

@NgModule({
  declarations: [
    CommissionIncentiveReportComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PaginationModule.forRoot(),
    RouterModule.forChild(routing),
    NgxDaterangepickerMd,
    ModalModule.forRoot(),
    ShareReportModule
  ],
  exports: [
  ]
})
export class CommissionIncentiveReportModule { }
