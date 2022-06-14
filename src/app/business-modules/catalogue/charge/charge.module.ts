import { NgModule } from '@angular/core';

import { ChargeComponent } from './charge.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { StoreModule } from '@ngrx/store';

import { ChargeImportComponent } from './charge-import/charge-import.component';
import { ChargeImportAccountVoucherComponent } from './charge-import-account-voucher/charge-import-account-voucher.component';
import { FormSearchChargeComponent } from './components/form-search-charge/form-search-charge.component';
import { AddChargeComponent } from './add-charge/add-charge.component';
import { DetailChargeComponent } from './detail-charge/detail-charge.component';
import { FormAddChargeComponent } from './components/form-add-charge/form-add-charge.component';
import { VoucherListComponent } from './components/voucher-list/voucher-list.component';
import { GenerateSellingChargePopupComponent } from './components/popup/generate-selling-charge/generate-selling-charge.popup';
import { reducers } from './store';
import { NgSelectModule } from '@ng-select/ng-select';
import { EffectsModule } from '@ngrx/effects';
import { chargeEffect } from './store/effect';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Charge' },
        children: [
            {
                path: '', component: ChargeComponent
            },
            {
                path: 'addnew', component: AddChargeComponent, data: { name: "New" }
            },
            {

                path: 'import', component: ChargeImportComponent, data: { name: "Import" }
            },
            {

                path: 'import-account-voucher', component: ChargeImportAccountVoucherComponent, data: { name: "Import Account Voucher" }
            },
            {

                path: ':id', component: DetailChargeComponent, data: { name: "Detail" }
            },
        ]
    },



];
@NgModule({
    imports: [
        NgSelectModule,
        NgProgressModule,
        SharedModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        StoreModule.forFeature('charge', reducers),
        ModalModule.forRoot(),
        EffectsModule.forFeature(chargeEffect),
    ],
    exports: [],
    declarations: [
        ChargeComponent,
        ChargeImportComponent,
        ChargeImportAccountVoucherComponent,
        FormSearchChargeComponent,
        AddChargeComponent,
        DetailChargeComponent,
        FormAddChargeComponent,
        VoucherListComponent,
        GenerateSellingChargePopupComponent
    ],
    providers: [],
})
export class ChargeModule { }
