import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareFormSearchReportComponent } from './components/share-form-search-report/share-form-search-report.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ShareModulesModule } from '../share-modules/share-modules.module';
@NgModule({
    declarations: [ShareFormSearchReportComponent],
    imports: [ 
        CommonModule,
        NgxDaterangepickerMd,
        NgSelectModule,
        ModalModule,
        SharedModule,
        ShareModulesModule
        
     ],
    exports: [
        ShareFormSearchReportComponent
    ],
    providers: [],
})
export class ShareReportModule {

}
