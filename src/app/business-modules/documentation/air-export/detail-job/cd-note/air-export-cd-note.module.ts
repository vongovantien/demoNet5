import { NgModule } from '@angular/core';
import { ShareBussinessCdNoteListAirComponent } from 'src/app/business-modules/share-business/components/cd-note-air/cd-note-list/cd-note-list.component';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';

@NgModule({
    imports: [
        ShareBussinessModule
    ],
    exports: [],
    declarations: [

    ],
    providers: [],
    entryComponents: [
        ShareBussinessCdNoteListAirComponent
    ]
})
export class AirExportCDNoteModule {
    static rootComponent = ShareBussinessCdNoteListAirComponent;
}
