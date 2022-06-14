import { NgModule } from '@angular/core';
import { ShareBusinessAsignmentComponent } from 'src/app/business-modules/share-business/components/asignment/asignment.component';
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
        ShareBusinessAsignmentComponent
    ]
})
export class SeaLCLImportAsignmentModule {
    static rootComponent = ShareBusinessAsignmentComponent;

}
