import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { SeaLCLImportHBLComponent } from './sea-lcl-import-hbl.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { SeaLCLImportCreateHouseBillComponent } from './create/sea-lcl-import-create-house-bill.component';
import { SeaLCLImportDetailHouseBillComponent } from './detail/sea-lcl-import-detail-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ShareBusinessReAlertComponent } from 'src/app/business-modules/share-business/components/pre-alert/pre-alert.component';
import { ShareSeaServiceModule } from '../../../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', component: SeaLCLImportHBLComponent,
        data: { name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.SLI_CODE }
    },
    {
        path: 'new', component: SeaLCLImportCreateHouseBillComponent,
        data: { name: 'New House Bill', path: ':id', level: 5 }
    },
    {
        path: ':hblId',
        data: { name: 'House Bill Detail', path: ':id', level: 5 },
        children: [
            {
                path: '', component: SeaLCLImportDetailHouseBillComponent, data: { name: "" }
            },
            {
                path: 'arrivalnotice', component: ShareBusinessReAlertComponent,
                data: { name: "Arrival Notice", level: 6, serviceId: ChargeConstants.SLI_CODE },
            },
        ]
    }
];

const LIB = [
    TabsModule.forRoot(),
    BsDropdownModule.forRoot()
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ShareBussinessModule,
        FormsModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        NgxSpinnerModule,
        ShareSeaServiceModule,
        ...LIB
    ],
    exports: [],
    declarations: [
        SeaLCLImportHBLComponent,
        SeaLCLImportCreateHouseBillComponent,
        SeaLCLImportDetailHouseBillComponent,
    ],
    providers: [],
})
export class SeaLCLImportHBLModule { }
