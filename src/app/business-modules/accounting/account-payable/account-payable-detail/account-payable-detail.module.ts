import { NgModule } from '@angular/core';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccountPayableTabComponent } from './account-payable-detail.component';
import { reducers } from './store/reducers';
import { effects } from './store/effects';
import { FormSearchPayablePaymentComponent } from './component/form-search/form-search-payable-payment.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
// import { ListPayableDetailComponent } from './component/list-payable-detail/list-payable-detail.component';

const routing: Routes = [
    {
        path: "",
        data: { name: '' },
        children: [
            {
                path: '',
                component: AccountPayableTabComponent,
                data: { name: '' },
            },
        ]
    },

];

@NgModule({
    imports: [
        TabsModule.forRoot(),
        RouterModule.forChild(routing),
        SharedModule,
        NgSelectModule,
        NgxDaterangepickerMd,
        StoreModule.forFeature('account-payable', reducers),
        EffectsModule.forFeature(effects),
        CollapseModule.forRoot(),
        ModalModule
    ],
    exports: [

    ],
    declarations: [
        AccountPayableTabComponent,
        FormSearchPayablePaymentComponent,
    ],
    providers: [],

})
export class AccountPayableModule {

}
