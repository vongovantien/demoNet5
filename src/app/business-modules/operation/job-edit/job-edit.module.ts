import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxCurrencyModule } from 'ngx-currency';


import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { OpsModuleBillingJobEditComponent } from './job-edit.component';
import { PlSheetPopupComponent } from './pl-sheet-popup/pl-sheet.popup';
import { SharedModule } from 'src/app/shared/shared.module';
import { JobEditLazyLoadComponentModule } from './job-edit-lazy-load-component.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { JobManagementFormEditComponent } from './components/form-edit/form-edit.component';
import { DeactivateGuardService } from '@core';
import { NgSelectModule } from '@ng-select/ng-select';

const routing: Routes = [
    {
        path: ":id", component: OpsModuleBillingJobEditComponent, data: { name: "", serviceId: ChargeConstants.CL_CODE }, canDeactivate: [DeactivateGuardService]
    },

];


const LIB = [
    NgxDaterangepickerMd,
    NgSelectModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    DragDropModule
];

const COMPONENTS = [
    PlSheetPopupComponent,
];

const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: true,
    allowZero: true,
    decimal: ".",
    precision: 3,
    prefix: "",
    suffix: "",
    thousands: ",",
    nullable: true
};


@NgModule({
    imports: [
        RouterModule.forChild(routing),
        PaginationModule.forRoot(),
        SharedModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        JobEditLazyLoadComponentModule, // ? Lazy loading module with 3 tab component (CD, Credit/Debit, Stage),
        ShareBussinessModule,
        ...LIB,

    ],
    exports: [],
    declarations: [
        OpsModuleBillingJobEditComponent,
        JobManagementFormEditComponent,
        ...COMPONENTS,
    ],
    providers: [
    ],
})
export class JobEditModule { }
