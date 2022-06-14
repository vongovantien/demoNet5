import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxCurrencyModule } from 'ngx-currency';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { AirExportHBLComponent } from './air-export-hbl.component';
import { AirExportCreateHBLComponent } from './create/create-house-bill.component';
import { AirExportHBLFormCreateComponent } from './components/form-create-house-bill-air-export/form-create-house-bill-air-export.component';
import { AirExportDetailHBLComponent } from './detail/detail-house-bill.component';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { SeparateHouseBillComponent } from './components/form-separate-house-bill/form-separate-house-bill.component';
import { ShareAirExportModule } from '../../share-air-export.module';
import { InputBookingNotePopupComponent } from './components/input-booking-note/input-booking-note.popup';
import { ShareBusinessReAlertComponent } from 'src/app/business-modules/share-business/components/pre-alert/pre-alert.component';

const routing: Routes = [
    {
        path: '', component: AirExportHBLComponent,
        data: { name: '', path: '/', level: 4, serviceId: ChargeConstants.AE_CODE }
    },
    {
        path: 'new', component: AirExportCreateHBLComponent,
        data: { name: 'New House Bill', path: ':id', level: 5, transactionType: CommonEnum.TransactionTypeEnum.AirExport }
    },
    {
        path: ':hblId',
        data: { name: 'House Bill Detail', path: ':id', level: 5 },
        children: [
            {
                path: '', component: AirExportDetailHBLComponent, data: { name: "" }
            },
            {
                path: 'manifest', component: ShareBusinessReAlertComponent,
                data: { name: "Pre Alert", level: 6, serviceId: ChargeConstants.AE_CODE },
            }
        ],
    },
    {
        path: ':hblId/separate', component: SeparateHouseBillComponent,
        data: { name: "Separate Hawb", path: ":id", level: 6 },
    },
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    PerfectScrollbarModule,
    FroalaEditorModule.forRoot(),
    CollapseModule,
    NgxCurrencyModule.forRoot({
        align: "right",
        allowNegative: true,
        allowZero: true,
        decimal: ".",
        precision: 3,
        prefix: "",
        suffix: "",
        thousands: ",",
        nullable: true
    }),
];


@NgModule({
    imports: [
        SharedModule,
        ShareBussinessModule,
        RouterModule.forChild(routing),
        NgxSpinnerModule,
        ShareAirExportModule,
        ...LIB
    ],
    exports: [],
    declarations: [
        AirExportHBLComponent,
        AirExportCreateHBLComponent,
        AirExportHBLFormCreateComponent,
        AirExportDetailHBLComponent,
        SeparateHouseBillComponent,
        InputBookingNotePopupComponent
    ],
    providers: [],
})
export class AirExportHBLModule { }
