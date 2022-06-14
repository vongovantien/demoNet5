import { NgModule } from '@angular/core';
import { StateManagmentModule } from 'src/app/business-modules/operation/job-edit/stage-management/stage-management.module';
import { ShareBusinessAsignmentComponent } from 'src/app/business-modules/share-business/components/asignment/asignment.component';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
@NgModule({
    imports: [
        StateManagmentModule,
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
export class SeaFCLImportAsignmentModule {
    static rootComponent = ShareBusinessAsignmentComponent;

}
