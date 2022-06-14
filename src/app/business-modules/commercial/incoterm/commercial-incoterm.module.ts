import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';

import { CommercialIncotermComponent } from './commercial-incoterm.component';
import { CommercialCreateIncotermComponent } from './create/create-incoterm-commercial.component';
import { CommercialDetailIncotermComponent } from './detail/detail-incoterm-commercial.component';
import { CommercialFormIncotermComponent } from './components/form-incoterm/form-incoterm.component';
import { CommercialListChargeIncotermComponent } from './components/list-charge/list-charge-incoterm.component';
import { CommercialFormSearchIncotermComponent } from './components/form-search-incoterm/form-search-incoterm.component';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';


const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: CommercialIncotermComponent
            },
            {
                path: 'new', component: CommercialCreateIncotermComponent, data: { name: 'New' }
            },
            {
                path: ':incotermId', component: CommercialDetailIncotermComponent, data: { name: 'View/Edit Incoterm' }
            }
        ]
    }
];

@NgModule({
    declarations: [
        CommercialIncotermComponent,
        CommercialCreateIncotermComponent,
        CommercialDetailIncotermComponent,
        CommercialFormIncotermComponent,
        CommercialListChargeIncotermComponent,
        CommercialFormSearchIncotermComponent
    ],
    imports: [
        SharedModule,
        NgSelectModule,
        ReactiveFormsModule,
        TabsModule.forRoot(),
        RouterModule.forChild(routing),
        PaginationModule.forRoot(),
    ],
    exports: [],
    providers: [],
})
export class CommercialIncotermModule { }
