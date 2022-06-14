import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgSelectModule } from '@ng-select/ng-select';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ARHistoryPaymentFormSearchComponent } from './components/form-search/form-search-history-payment.component';
import { Routes, RouterModule } from '@angular/router';
import { ARHistoryPaymentComponent } from './history-payment.component';
import { ARHistoryPaymentListInvoiceComponent } from './components/list-invoice-payment/list-invoice-history-payment.component';
import { ARHistoryPaymentUpdateExtendDayPopupComponent } from './components/popup/update-extend-day/update-extend-day.popup';
import { ARHistoryPaymentImportComponent } from './import/history-import-payment.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { effects } from './store/effects';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

const routing: Routes = [
    {
        path: '', data: { name: '' }, children: [
            { path: '', component: ARHistoryPaymentComponent },
            {
                path: 'import', component: ARHistoryPaymentImportComponent, data: { name: "Import" }
            },
        ]
    }
];

@NgModule({
    declarations: [
        ARHistoryPaymentComponent,
        ARHistoryPaymentFormSearchComponent,
        ARHistoryPaymentListInvoiceComponent,
        ARHistoryPaymentUpdateExtendDayPopupComponent,
        ARHistoryPaymentImportComponent
    ],
    imports: [
        SharedModule,
        TabsModule.forRoot(),
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        NgxDaterangepickerMd,
        NgSelectModule,
        PerfectScrollbarModule,
        RouterModule.forChild(routing),
        StoreModule.forFeature('history-payment', reducers),
        EffectsModule.forFeature(effects),
        BsDropdownModule.forRoot(),
    ],
    exports: [],
    providers: [],
})
export class ARHistoryPaymentModule { }
