import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AccordionModule, } from 'ngx-bootstrap/accordion';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { SettlementPaymentComponent } from './settlement-payment.component';
import { SettlementFormSearchComponent } from './components/form-search-settlement/form-search-settlement.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettlementPaymentAddNewComponent } from './add/add-settlement-payment.component';
import { SettlementFormCreateComponent } from './components/form-create-settlement/form-create-settlement.component';
import { SettlementListChargeComponent } from './components/list-charge-settlement/list-charge-settlement.component';
import { SettlementPaymentManagementPopupComponent } from './components/popup/payment-management/payment-management.popup';
import { SettlementExistingChargePopupComponent } from './components/popup/existing-charge/existing-charge.popup';
import { SettlementFormChargePopupComponent } from './components/popup/form-charge/form-charge.popup';
import { SettlementShipmentItemComponent } from './components/shipment-item/shipment-item.component';
import { SettlementTableSurchargeComponent } from './components/table-surcharge/table-surcharge.component';
import { SettlementPaymentDetailComponent } from './detail/detail-settlement-payment.component';
import { ApporveSettlementPaymentComponent } from '../approve-payment/settlement/approve.settlement.component';
import { ShareApprovePaymentModule } from '../approve-payment/components/share-approve-payment.module';
import { SettlementFormCopyPopupComponent } from './components/popup/copy-settlement/copy-settlement.popup';
import { SettlementTableListChargePopupComponent } from './components/popup/table-list-charge/table-list-charge.component';
import { ShareAccountingModule } from '../share-accouting.module';
import { SettlementChargeFromShipmentPopupComponent } from './components/popup/charge-from-shipment/charge-form-shipment.popup';
import { ReportPreviewComponent } from '@common';
import { reducers } from './components/store';
import { SettlementPaymentsPopupComponent } from './components/popup/settlement-payments/settlement-payments.popup';
import { ShareModulesModule } from '../../share-modules/share-modules.module';
import { SettlePaymentEffect } from './components/store/effects/settlement-payment.effect';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { SettlementShipmentAttachFilePopupComponent } from './components/popup/shipment-attach-files/shipment-attach-file-settlement.popup';
import { SettlementDetailChargesPaymentComponent } from './components/popup/payment-management/detail-charges-payment/detail-charges-payment.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routing: Routes = [
    {
        path: '', data: {
            name: ""
        },
        children: [
            {
                path: '', component: SettlementPaymentComponent
            },
            {
                path: "new", component: SettlementPaymentAddNewComponent,
                data: { name: "New", path: "New" }
            },
            {
                path: ":id", component: SettlementPaymentDetailComponent,
                data: { name: "Detail", path: "Detail" }
            },
            {
                path: ":id/approve", component: ApporveSettlementPaymentComponent,
                data: { name: "Approve", path: "Approve", title: 'eFMS Approve Settle' }
            },
        ]
    },
];

const COMPONENT = [
    SettlementFormSearchComponent,
    SettlementFormCreateComponent,
    SettlementListChargeComponent,
    SettlementPaymentManagementPopupComponent,
    SettlementExistingChargePopupComponent,
    SettlementFormChargePopupComponent,
    SettlementShipmentItemComponent,
    SettlementTableSurchargeComponent,
    SettlementFormCopyPopupComponent,
    SettlementTableListChargePopupComponent,
    SettlementChargeFromShipmentPopupComponent,
    SettlementPaymentsPopupComponent,
    SettlementShipmentAttachFilePopupComponent,
    SettlementDetailChargesPaymentComponent
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

const maskConfig: Partial<IConfig> = {
    validation: false,
    showMaskTyped: true,
    dropSpecialCharacters: false
};
@NgModule({
    imports: [
        SharedModule,
        NgxDaterangepickerMd,
        PaginationModule.forRoot(),
        PerfectScrollbarModule,
        ModalModule.forRoot(),
        NgProgressModule,
        RouterModule.forChild(routing),
        AccordionModule.forRoot(),
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        ShareApprovePaymentModule,
        ShareAccountingModule,
        NgSelectModule,
        BsDropdownModule.forRoot(),
        StoreModule.forFeature('settlement-payment', reducers),
        EffectsModule.forFeature([SettlePaymentEffect]),
        ShareModulesModule,
        NgxMaskModule.forRoot(maskConfig),
        TabsModule,
        ScrollingModule

    ],
    exports: [],
    declarations: [
        SettlementPaymentComponent,
        SettlementPaymentAddNewComponent,
        SettlementPaymentDetailComponent,
        ApporveSettlementPaymentComponent,
        ...COMPONENT
    ],
    entryComponents: [
        ReportPreviewComponent
    ],
    providers: [

    ],
})
export class SettlementPaymentModule { }
