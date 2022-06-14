import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ShareBussinessFilesAttachComponent } from 'src/app/business-modules/share-business/components/files-attach/files-attach.component';

@NgModule({
    imports: [
        CommonModule,
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
export class AirImportAttachFilesModule {
    static rootComponent = ShareBussinessFilesAttachComponent;
}
