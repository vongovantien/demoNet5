import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routing: Routes = [
  {
      path: '', data: { name: "" }, children: [
          {
              path: '', component: DashboardComponent
          }
      ]
  },
];


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    RouterModule.forChild(routing),
    CommonModule,
    HighchartsChartModule,
    SharedModule
  ]
})
export class DashboardModule { }
