import { NgModule } from '@angular/core';
import { TariffComponent } from './tariff.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { TariffFormSearchComponent } from './components/form-search-tariff/form-search-tariff.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TariffAddComponent } from './add/add-tariff.component';
import { TariffFormAddComponent } from './components/form-add-tariff/form-add-tariff.component';
import { TariffListChargeComponent } from './components/list-charge-tariff/list-charge-tariff.component';
import { TariffChargePopupComponent } from './components/popup/tariff-charge/tariff-charge.popup';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxCurrencyModule } from 'ngx-currency';
import { TariffDetailComponent } from './detail/detail-tariff.component';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: TariffComponent
            },
            {
                path: 'new', component: TariffAddComponent, data: { name: "New" }
            },
            {
                path: ':id', component: TariffDetailComponent, data: { name: "Detail" }
            },
        ]
    },
];

const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: false,
    allowZero: true,
    decimal: ".",
    precision: 0,
    prefix: "",
    suffix: "",
    thousands: ",",
    nullable: true
};

const COMPONENTS = [
    TariffFormSearchComponent,
    TariffFormAddComponent,
    TariffListChargeComponent,
    TariffChargePopupComponent,
];

@NgModule({
    declarations: [
        TariffComponent,
        TariffAddComponent,
        TariffDetailComponent,
        ...COMPONENTS
    ],
    imports: [
        SharedModule,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        NgxDaterangepickerMd.forRoot(),
        RouterModule.forChild(routing),
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),

    ],
    exports: [],
    providers: [],
})
export class TariffModule { }
