import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OpsCDNoteComponent } from './ops-cd-note-list.component';
import { OpsCdNoteDetailPopupComponent } from '../components/popup/ops-cd-note-detail/ops-cd-note-detail.popup';
import { OpsCdNoteAddPopupComponent } from '../components/popup/ops-cd-note-add/ops-cd-note-add.popup';
import { OpsCdNoteAddRemainingChargePopupComponent } from '../components/popup/ops-cd-note-add-remaining-charge/ops-cd-note-add-remaining-charge.popup';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ShareModulesModule } from 'src/app/business-modules/share-modules/share-modules.module';


@NgModule({
    declarations: [
        OpsCDNoteComponent,
        OpsCdNoteDetailPopupComponent,
        OpsCdNoteAddPopupComponent,
        OpsCdNoteAddRemainingChargePopupComponent,
    ],
    imports: [
        SharedModule,
        ShareBussinessModule,
        ModalModule,
        ShareModulesModule
    ],
    exports: [],
    providers: [],
    entryComponents: [
        OpsCDNoteComponent
    ]
})
export class OpsCDNoteModule {
    static rootComponent = OpsCDNoteComponent;
}