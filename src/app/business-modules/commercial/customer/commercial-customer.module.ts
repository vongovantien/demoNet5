import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommercialCustomerComponent } from './commercial-customer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareCommercialModule } from '../share-commercial.module';
import { CommercialCreateComponent } from '../create/create-commercial.component';
import { CommercialDetailComponent } from '../detail/detail-commercial.component';
import { CustomerAgentImportComponent } from '../components/customer-agent-import/customer-agent-import.component';
import { ContractImportComponent } from '../components/contract/import/contract-import.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers';
import { ShareModulesModule } from '../../share-modules/share-modules.module';
import { EffectsModule } from '@ngrx/effects';
import { CustomerEffect } from './store/effect/customer.effect';
import { customerEffect } from './store/effect';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: CommercialCustomerComponent
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
                path: ':partnerId', component: CommercialDetailComponent, data: { name: 'View/Edit Customer' }
            },
            {
                path: 'new-sub/:partnerId', component: CommercialDetailComponent, data: { name: 'New SubCustomer', path: "partnerId", action: true }
            },
        ]
    }
];


@NgModule({
    declarations: [
        CommercialCustomerComponent
    ],
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        ShareCommercialModule,
        ShareModulesModule,
        StoreModule.forFeature('customer', reducers),
        EffectsModule.forFeature(customerEffect)
    ],
    exports: [],
    providers: [],
})
export class CommercialCustomerModule { }

