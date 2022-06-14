import { NgModule } from '@angular/core';
import { CommercialCreateComponent } from './create/create-commercial.component';
import { CommonComponentModule } from 'src/app/shared/common/common.module';
import { CommercialFormCreateComponent } from './components/form-create/form-create-commercial.component';
import { DirectiveModule } from 'src/app/shared/directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommercialDetailComponent } from './detail/detail-commercial.component';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { ShareModulesModule } from '../share-modules/share-modules.module';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { CustomerAgentImportComponent } from './components/customer-agent-import/customer-agent-import.component';
import { ContractImportComponent } from './components/contract/import/contract-import.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    declarations: [
        CommercialCreateComponent,
        CommercialFormCreateComponent,
        CommercialDetailComponent,
        CustomerAgentImportComponent,
        ContractImportComponent,

    ],
    imports: [
        CommonModule,
        FormsModule,
        CommonComponentModule,
        DirectiveModule,
        ReactiveFormsModule,
        PipeModule,
        ShareModulesModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        NgSelectModule,
        TabsModule.forRoot(),
    ],
    exports: [
        CommercialCreateComponent,
        CommercialFormCreateComponent,
        CommercialDetailComponent,
    ],
    providers: [],
})
export class ShareCommercialModule { }
