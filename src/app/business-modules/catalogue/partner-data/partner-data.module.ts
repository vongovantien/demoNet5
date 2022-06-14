import { NgModule } from '@angular/core';

import { PartnerComponent } from './partner.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { PartnerDataImportComponent } from './import/partner-data-import.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SalemanPopupComponent } from './components/saleman-popup.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormAddPartnerComponent } from './components/form-add-partner/form-add-partner.component';
import { AddPartnerDataComponent } from './add/add-partner.component';
import { PartnerListComponent } from './components/partner-list/partner-list.component';
import { PartnerDetailComponent } from './detail/detail-partner.component';
import { PartnerOtherChargePopupComponent } from './components/other-charge/partner-other-charge.popup';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShareModulesModule } from '../../share-modules/share-modules.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducers';
import { UserCreatePopupComponent } from './components/user-create-popup/user-create-popup.component';
import { EffectsModule } from '@ngrx/effects';
import { partnerEffect } from './store/effect';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Partner' },
        children: [
            {
                path: '', component: PartnerComponent

            },
            {
                path: 'import', component: PartnerDataImportComponent, data: { name: "Import", level: 3 }
            },
            {
                path: 'add', component: AddPartnerDataComponent, data: { name: "New", level: 3 }
            },
            {
                path: 'detail/:id', component: PartnerDetailComponent, data: { name: "Detail", level: 3 }
            },
            {
                path: 'add-sub/:id', component: PartnerDetailComponent, data: { name: "New PartnerSub", level: 3, action: true }
            },
        ]
    },

]
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
        NgProgressModule,
        NgSelectModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        ShareModulesModule,
        StoreModule.forFeature('partnerData', reducers),
        EffectsModule.forFeature(partnerEffect),
    ],
    exports: [],
    declarations: [
        PartnerComponent,
        PartnerDataImportComponent,
        SalemanPopupComponent,
        FormAddPartnerComponent,
        AddPartnerDataComponent,
        PartnerDetailComponent,
        PartnerListComponent,
        PartnerOtherChargePopupComponent,
        UserCreatePopupComponent

    ],
    providers: [],
})
export class PartnerDataModule { }
