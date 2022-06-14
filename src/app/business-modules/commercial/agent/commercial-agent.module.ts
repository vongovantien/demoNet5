import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommercialAgentComponent } from './commercial-agent.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommercialDetailComponent } from '../detail/detail-commercial.component';
import { CommercialCreateComponent } from '../create/create-commercial.component';
import { ShareCommercialModule } from '../share-commercial.module';
import { ContractImportComponent } from '../components/contract/import/contract-import.component';
import { CustomerAgentImportComponent } from '../components/customer-agent-import/customer-agent-import.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers';
import { ShareModulesModule } from '../../share-modules/share-modules.module';
import { EffectsModule } from '@ngrx/effects';
import { agentEffect } from './store/effect';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: CommercialAgentComponent
            },
            {
                path: 'new', component: CommercialCreateComponent, data: { name: 'New' }
            },
            {
                path: 'import', component: CustomerAgentImportComponent, data: { name: "Import", level: 3 }
            },
            {
                path: 'importContract', component: ContractImportComponent, data: { name: "Import Contract", level: 3 }
            },
            {
                path: ':partnerId', component: CommercialDetailComponent, data: { name: 'View/Edit Agent' }
            },
            {
                path: 'new-sub/:partnerId', component: CommercialDetailComponent, data: { name: 'New SubAgent', path: ':partnerId', action: true }
            },
        ]
    }
];


@NgModule({
    declarations: [
        CommercialAgentComponent,

    ],
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        ShareCommercialModule,
        ShareModulesModule,
        StoreModule.forFeature('agent', reducers),
        EffectsModule.forFeature(agentEffect),
    ],
    exports: [],
    providers: [],
})
export class CommercialAgentModule { }
