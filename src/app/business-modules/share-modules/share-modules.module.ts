import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModulesInputShipmentPopupComponent, FormContractCommercialPopupComponent, PartnerRejectPopupComponent, ShareModulesReasonRejectPopupComponent } from './components';
import { ModalModule } from 'ngx-bootstrap/modal/';
import { PipeModule } from "src/app/shared/pipes/pipe.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DirectiveModule } from "src/app/shared/directives/directive.module";

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { CommonComponentModule } from "src/app/shared/common/common.module";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { CommercialContractListComponent } from "../commercial/components/contract/commercial-contract-list.component";
import { SalesmanCreditLimitPopupComponent } from "../commercial/components/popup/salesman-credit-limit.popup";
import { CommercialBranchSubListComponent } from "../commercial/components/branch-sub/commercial-branch-sub-list.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { CommercialEmailListComponent } from '../commercial/components/email/commercial-email-list.component';
import { FormUpdateEmailCommercialCatalogueComponent } from './components/form-update-email-commercial-catalogue/form-update-email-commercial-catalogue.popup';
import { FormSearchExportComponent } from '../commercial/components/popup/form-search-export/form-search-export.popup';
import { ShareBussinessAdjustDebitValuePopupComponent } from './components/adjust-debit-value/adjust-debit-value.popup';

const COMPONENTS = [
    ShareModulesInputShipmentPopupComponent,
    FormContractCommercialPopupComponent,
    CommercialContractListComponent,
    SalesmanCreditLimitPopupComponent,
    PartnerRejectPopupComponent,
    CommercialBranchSubListComponent,
    CommercialEmailListComponent,
    FormUpdateEmailCommercialCatalogueComponent,
    ShareModulesReasonRejectPopupComponent,
    FormSearchExportComponent,
    ShareBussinessAdjustDebitValuePopupComponent
];
@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        CommonComponentModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DirectiveModule,
        PipeModule,
        NgSelectModule,
        TabsModule.forRoot(),
        CollapseModule.forRoot(),
        NgxDaterangepickerMd,
        FormsModule
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class ShareModulesModule {

}
