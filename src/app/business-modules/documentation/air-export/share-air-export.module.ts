import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareAirExportOtherChargePopupComponent } from './share/other-charge/air-export-other-charge.popup';
import { CommonComponentModule } from 'src/app/shared/common/common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DirectiveModule } from 'src/app/shared/directives/directive.module';
import { FormsModule } from '@angular/forms';
import { NgxCurrencyModule, CurrencyMaskConfig } from 'ngx-currency';

const customCurrencyMaskConfig: CurrencyMaskConfig = {
    align: "right",
    allowNegative: false,
    allowZero: true,
    decimal: ".",
    precision: 2,
    prefix: "",
    suffix: "",
    thousands: ",",
    nullable: true
};
@NgModule({
    declarations: [
        ShareAirExportOtherChargePopupComponent
    ],
    imports: [
        CommonModule,
        CommonComponentModule,
        ModalModule,
        DirectiveModule,
        FormsModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),

    ],
    exports: [
        ShareAirExportOtherChargePopupComponent
    ],
    providers: [],
})
export class ShareAirExportModule {
}
