import { NgModule } from '@angular/core';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ShareBussinessFilesAttachComponent } from 'src/app/business-modules/share-business/components/files-attach/files-attach.component';

@NgModule({
    imports: [
        ShareBussinessModule,
    ],
    exports: [],
    declarations: [
    ],
    providers: [],
    entryComponents: [
        ShareBussinessFilesAttachComponent
    ]
})
export class AirExportAttachFilesModule {
    static rootComponent = ShareBussinessFilesAttachComponent;
}
