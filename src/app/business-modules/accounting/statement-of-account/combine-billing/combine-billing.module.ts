import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgModule } from "@angular/core";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { CombineBillingComponent } from "./combine-billing.component";
import { FormSearchCombineBillingComponent } from "./components/form-search-combine-billing/form-search-combine-billing.component";
import { DetailCombineBillingComponent } from "./detail/detail-combine-billing.component";
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CombineBillingEffect } from './store/effects/combine-billing.effect';
import { ShareModulesModule } from 'src/app/business-modules/share-modules/share-modules.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgProgressModule } from '@ngx-progressbar/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ShareAccountingModule } from '../../share-accouting.module';
import { reducers } from './store/reducers';
import { CreateCombineBillingComponent } from './create/create-combine-billing.component';
import { FormGetBillingListComponent } from './components/form-get-billing-list/form-get-billing-list.component';
import { CombineBillingListComponent } from './components/combine-billing-list/combine-billing-list.component';


const routing: Routes = [
    {
        path: '', data: { name: '' }, children: [
            { path: '', component: CombineBillingComponent },
            {
                path: "new", component: CreateCombineBillingComponent,
                data: { name: "New", path: "New" }
            },
            {
                path: "detail/:id", component: DetailCombineBillingComponent,
                data: { name: 'Detail' }
            },
        ],
        
    }
];

@NgModule({
    declarations: [
        CombineBillingComponent,
        FormSearchCombineBillingComponent,
        DetailCombineBillingComponent,
        CreateCombineBillingComponent,
        CombineBillingListComponent,
        FormGetBillingListComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
        TabsModule.forRoot(),
        NgSelectModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        StoreModule.forFeature('combine-billing', reducers),
        EffectsModule.forFeature([CombineBillingEffect]),
    ],
    exports: [],
    providers: [

    ],
})
export class CombineBillingModule {
    static routing = routing;
}