import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule, } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AirImportHBLComponent } from './air-import-hbl.component';
import { AirImportHBLFormCreateComponent } from './components/form-create-house-bill-air-import/form-create-house-bill-air-import.component';
import { AirImportCreateHBLComponent } from './create/create-house-bill.component';
import { AirImportDetailHBLComponent } from './detail/detail-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ShareBusinessReAlertComponent } from 'src/app/business-modules/share-business/components/pre-alert/pre-alert.component';
import { NgSelectModule } from '@ng-select/ng-select';



const routing: Routes = [
    {
        path: '', component: AirImportHBLComponent,
        data: { name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.AI_CODE }
    },
    {
        path: 'new', component: AirImportCreateHBLComponent,
        data: { name: 'New House Bill ', path: ':id', level: 5 }
    },
    {
        path: ':hblId',
        data: { name: 'House Bill Detail', path: ':id', level: 5 },
        children: [
            {
                path: '', component: AirImportDetailHBLComponent, data: { name: "" }
            },
            {
                path: 'arrivalnotice', component: ShareBusinessReAlertComponent,
                data: { name: "Arrival Notice", level: 6, serviceId: ChargeConstants.AI_CODE },
            },
        ]
    },
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    BsDropdownModule.forRoot()

];
@NgModule({
    imports: [
        SharedModule,
        ShareBussinessModule,
        RouterModule.forChild(routing),
        NgxSpinnerModule,
        ...LIB

    ],
    exports: [],
    declarations: [
        AirImportHBLComponent,
        AirImportHBLFormCreateComponent,
        AirImportCreateHBLComponent,
        AirImportDetailHBLComponent
    ],
    providers: [],
})
export class AirImportHBLModule { }
