import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareBusinessAdvanceSettlementInforComponent } from 'src/app/business-modules/share-business/components/advance-settlement-info/advance-settlement-info.component';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';

@NgModule({
    imports: [
        CommonModule,
        PipeModule,
    ],
    exports: [],
    declarations: [
        ShareBusinessAdvanceSettlementInforComponent
    ],
    providers: [],
    entryComponents: [
        ShareBusinessAdvanceSettlementInforComponent
    ]
})
export class ShareAdvanceSettleModule {
    static rootComponent = ShareBusinessAdvanceSettlementInforComponent;
}
