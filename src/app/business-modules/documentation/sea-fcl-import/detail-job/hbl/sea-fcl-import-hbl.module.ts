import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { SeaFCLImportHBLComponent } from './sea-fcl-import-hbl.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateHouseBillComponent } from './create/create-house-bill.component';
import { DetailHouseBillComponent } from './detail/detail-house-bill.component';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ShareBusinessReAlertComponent } from 'src/app/business-modules/share-business/components/pre-alert/pre-alert.component';

import { ChargeConstants } from 'src/constants/charge.const';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ShareSeaServiceModule } from '../../../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', component: SeaFCLImportHBLComponent,
        data: <CommonInterface.IDataParam>{ name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.SFI_CODE }
    },
    {
        path: 'new', component: CreateHouseBillComponent,
        data: { name: 'New House Bill', path: ':id', level: 5 }
    },
    {
        path: ':hblId',
        data: { name: 'House Bill Detail', path: ':id', level: 5 },
        children: [
            {
                path: '', component: DetailHouseBillComponent, data: { name: "" }
            },
            {
                path: 'arrivalnotice', component: ShareBusinessReAlertComponent,
                data: { name: "Arrival Notice", level: 6, serviceId: ChargeConstants.SFI_CODE },
            },
        ]
    }
];

const LIB = [
    TabsModule.forRoot(),
    BsDropdownModule.forRoot()
];
@NgModule({
    declarations: [
        SeaFCLImportHBLComponent,
        CreateHouseBillComponent,
        DetailHouseBillComponent,
    ],
    imports: [
        SharedModule,
        ShareBussinessModule,
        RouterModule.forChild(routing),
        NgxSpinnerModule,
        ShareSeaServiceModule,
        ...LIB

    ],
    exports: [],
    providers: [],

})
export class SeaFCLImportHBLModule { }

