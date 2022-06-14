import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SharedModule } from 'src/app/shared/shared.module';

import { ShareSeaServiceFormCreateHouseBillSeaExportComponent } from './components/form-create-hbl-sea-export/form-create-hbl-sea-export.component';
import { ShareSeaServiceFormCreateHouseBillSeaImportComponent } from './components/form-create-hbl-sea-import/form-create-hbl-sea-import.component';
import { ShareSeaServiceFormCreateSeaExportComponent } from './components/form-create-sea-export/form-create-sea-export.component';
import { ShareSeaServiceFormCreateSeaImportComponent } from './components/form-create-sea-import/form-create-sea-import.component';
import { ShareSeaServiceFormSISeaExportComponent } from './components/form-si-sea-export/form-si-sea-export.component';
import { ShareSeaServiceMenuPreviewHBLSeaExportComponent } from './components/menu-preview-hbl-sea-export/menu-preview-hbl-sea-export.component';
import { ShareSeaServiceMenuPreviewHBLSeaImportComponent } from './components/menu-preview-hbl-sea-import/menu-preview-hbl-sea-import.component';
import { ShareSeaServiceShipmentGoodSummaryLCLComponent } from './components/shipment-good-summary-lcl/shipment-good-summary-lcl.component';


const COMPONENTS = [
    ShareSeaServiceFormCreateSeaExportComponent,
    ShareSeaServiceFormCreateSeaImportComponent,
    ShareSeaServiceFormSISeaExportComponent,
    ShareSeaServiceFormCreateHouseBillSeaExportComponent,
    ShareSeaServiceFormCreateHouseBillSeaImportComponent,
    ShareSeaServiceShipmentGoodSummaryLCLComponent,
    ShareSeaServiceMenuPreviewHBLSeaExportComponent,
    ShareSeaServiceMenuPreviewHBLSeaImportComponent
];

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        SharedModule,
        NgxDaterangepickerMd,
        NgSelectModule,
        BsDropdownModule
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class ShareSeaServiceModule { }
