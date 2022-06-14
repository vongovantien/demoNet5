import { GenerateIdComponent } from './components/generate-id/generate-id.component';
import { NgModule } from '@angular/core';
import { OtherComponent } from './other.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { UnlockShipmentComponent } from './components/unlock-shipment/unlock-shipment.component';
import { UnlockAccountingComponent } from './components/unlock-accounting/unlock-accouting.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { UnlockHistoryPopupComponent } from './components/unlock-history/unlock-history.popup';
import { NgSelectModule } from '@ng-select/ng-select';
import { LockShipmentComponent } from './components/lock-shipment/lock-shipment.component';

const routing: Route[] = [
    { path: '', component: OtherComponent, data: { name: "" } },

];

@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        TabsModule.forRoot(),
        NgSelectModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
    ],
    exports: [],
    declarations: [
        OtherComponent,
        UnlockShipmentComponent,
        UnlockAccountingComponent,
        UnlockHistoryPopupComponent,
        LockShipmentComponent,
        GenerateIdComponent
    ],
    providers: [],
})
export class OtherModule { }
