import { NgModule } from '@angular/core';
import { ShareBussinessCdNoteListComponent } from 'src/app/business-modules/share-business/components/cd-note/cd-note-list/cd-note-list.component';
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
        ShareBussinessCdNoteListComponent
    ]
})
export class SeaFCLImportCDNoteModule {
    static rootComponent = ShareBussinessCdNoteListComponent;
}
