import { NgModule } from '@angular/core';
import { ProcessApporveComponent } from './process-approve/process-approve.component';
import { CommonModule } from '@angular/common';
import { HistoryDeniedPopupComponent } from './popup/history-denied/history-denied.popup';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ModalModule.forRoot(),
    ],
    exports: [
        ProcessApporveComponent,
        HistoryDeniedPopupComponent
    ],
    declarations: [
        ProcessApporveComponent,
        HistoryDeniedPopupComponent
    ],
    providers: [],
})
export class ShareApprovePaymentModule { }
