import { NgModule } from '@angular/core';
import { ShareAirServiceFormCreateComponent } from './components/form-create/form-create-air.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ShareAirServiceDIMVolumePopupComponent } from './components/dim/dim-volume.popup';
import { NgSelectModule } from '@ng-select/ng-select';

const COMPONENTS = [
    ShareAirServiceFormCreateComponent,
    ShareAirServiceDIMVolumePopupComponent
];

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        SharedModule,
        ModalModule,
        NgxDaterangepickerMd,
        NgSelectModule

    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class ShareAirServiceModule { }