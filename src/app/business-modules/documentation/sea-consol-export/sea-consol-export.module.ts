import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { ChargeConstants } from '@constants';
import { CommonEnum } from '@enums';

import { SeaConsolExportComponent } from './sea-consol-export.component';
import { CommonComponentModule } from 'src/app/shared/common/common.module';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { DirectiveModule } from 'src/app/shared/directives/directive.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { SeaConsolExportCreateJobComponent } from './create-job/create-job-consol-export.component';
import { SeaConsolExportDetailJobComponent } from './detail-job/detail-job-consol-export.component';
import { SeaConsolExportLazyLoadModule } from './sea-consol-export-lazy-load.module';
import { SeaConsolExportManifestComponent } from './detail-job/manifest/sea-consol-manifest.component';
import { SeaConsolExportShippingInstructionComponent } from './detail-job/si/sea-consol-si.component';
import { ShareBusinessReAlertComponent } from '../../share-business/components/pre-alert/pre-alert.component';
import { FormsModule } from '@angular/forms';
import { DeactivateGuardService } from '@core';
import { ShareSeaServiceModule } from '../share-sea/share-sea-service.module';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Sea Consol Export' }, children: [
            {
                path: '', component: SeaConsolExportComponent
            },
            {
                path: 'new', component: SeaConsolExportCreateJobComponent,
                data: { name: "Create New Job" }
            },
            {
                path: ':jobId',
                data: { transactionType: CommonEnum.TransactionTypeEnum.SeaConsolExport, name: "Job Detail" },
                children: [
                    {
                        path: '', component: SeaConsolExportDetailJobComponent, data: { name: "" }, canDeactivate: [DeactivateGuardService]
                    },
                    {
                        path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-consol-export-hbl.module').then(m => m.SeaConsolExportHBLModule),
                        data: {
                            name: "House Bill",
                        },
                    },
                    {
                        path: 'manifest', component: SeaConsolExportManifestComponent,
                        data: { name: "Manifest", },
                    },
                    {
                        path: 'si',
                        data: { name: "Shipping Instructions", },
                        children: [
                            {
                                path: '', component: SeaConsolExportShippingInstructionComponent, data: { name: "" }
                            },
                            {
                                path: 'send-si', component: ShareBusinessReAlertComponent, data: {
                                    name: "Send S.I", serviceId: ChargeConstants.SFE_CODE // Similar FCL Export
                                }
                            },
                        ]
                    },

                ]
            },

        ]
    },


];

@NgModule({
    imports: [
        RouterModule.forChild(routing),
        CommonComponentModule,
        PipeModule,
        ShareBussinessModule,
        CommonModule,
        FormsModule,
        DirectiveModule,
        TabsModule.forRoot(),
        SeaConsolExportLazyLoadModule, // ?  Lazy loading module with  tab component (CD Note),
        ShareSeaServiceModule
    ],
    exports: [],
    declarations: [
        SeaConsolExportComponent,
        SeaConsolExportCreateJobComponent,
        SeaConsolExportDetailJobComponent,
        SeaConsolExportManifestComponent,
        SeaConsolExportShippingInstructionComponent
    ],
    providers: [],
})
export class SeaConsolExportModule { }
