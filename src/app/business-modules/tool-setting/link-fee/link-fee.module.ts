import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormRuleComponent } from './components/form-rule/form-rule.component';
import { LinkFeeComponent } from './link-fee.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FormSearchRuleComponent } from './components/form-search-rule/form-search-rule.component';
import { LinkFeeImportComponent } from './link-fee-import/link-fee-import.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: LinkFeeComponent
            },
            { path: 'import', component: LinkFeeImportComponent, data: { name: "Import", level: 3 } },
        ]
    },
];

@NgModule({
    declarations: [
        FormRuleComponent,
        LinkFeeComponent,
        FormSearchRuleComponent,
        LinkFeeImportComponent,
    ],
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        NgSelectModule,
        PaginationModule.forRoot(),
        ModalModule,
        NgxDaterangepickerMd.forRoot(),
        CollapseModule.forRoot(),
    ],
    exports: [],
    providers: [],
})
export class LinkFeeModule { }
