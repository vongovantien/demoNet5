import { NgModule } from '@angular/core';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ShareBusinessAsignmentComponent } from 'src/app/business-modules/share-business';

@NgModule({
    imports: [
        ShareBussinessModule,
    ],
    exports: [],
    declarations: [


    ],
    providers: [],
    entryComponents: [
        ShareBusinessAsignmentComponent
    ]
})
export class AirImportAssignmentModule {
    static rootComponent = ShareBusinessAsignmentComponent;
}
