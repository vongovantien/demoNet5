import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxSpinnerModule } from 'ngx-spinner';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';

import { SeaConsolImportHBLComponent } from './sea-consol-import-hbl.component';
import { SeaConsolImportCreateHBLComponent } from './create/create-hbl-consol-import.component';
import { SeaConsolImportDetailHBLComponent } from './detail/detail-hbl-consol-import.component';
import { ShareSeaServiceModule } from '../../../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', component: SeaConsolImportHBLComponent,
        data: <CommonInterface.IDataParam>{ name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.SCI_CODE }
    },
    {
        path: 'new', component: SeaConsolImportCreateHBLComponent,
        data: { name: 'New House Bill', path: ':id', level: 5 }
    },
    {
        path: ':hblId', component: SeaConsolImportDetailHBLComponent,
        data: { name: 'House Bill Detail', path: ':id', level: 5 }
    }
];

const LIB = [
    TabsModule.forRoot(),
    BsDropdownModule.forRoot()
];


@NgModule({
    declarations: [
        SeaConsolImportHBLComponent,
        SeaConsolImportCreateHBLComponent,
        SeaConsolImportDetailHBLComponent
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
export class SeaConsolImportHBLModule { }

