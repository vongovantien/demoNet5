import { NgModule } from '@angular/core';
import { DesignModulesRoutingModule } from './design-modules-routing.module';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';
import { SharedModule } from '../shared/shared.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  // wheelPropagation: true
};
@NgModule({
  imports: [
    DesignModulesRoutingModule,
    SharedModule,
    NgxDaterangepickerMd,
    NgSelectModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    FormComponent,
    TableComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
})
export class DesignModulesModule { }
