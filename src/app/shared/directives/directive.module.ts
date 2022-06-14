import { NgModule } from '@angular/core';
import {
    AutofocusDirective, TwoDigitDecimaNumberDirective, IntergerInputDirective, SpecialCharacterDirective, DecimalNumberGreaterThan0Directive, ClickOutSideDirective, AppLoadingButtonDirective, AppRequiredDirective, NumericDirective, InjectViewContainerRefDirective, NoDblClickDirective, AutoFormatCurrencyDirective, IconCalendarDirective,
    IConClearCalendarDirective, LoadModuleDirective, DisabledControlDirective, HasOwnerPermissionDirective, ClickStopPropagationDirective, FormatDecimalFormControlDirective, DropdownToggleDirective, ContextMenuDirective
} from '.';
import { OverlayModule } from '@angular/cdk/overlay';

const APP_DIRECTIVES = [
    AutofocusDirective,
    TwoDigitDecimaNumberDirective,
    IntergerInputDirective,
    SpecialCharacterDirective,
    DecimalNumberGreaterThan0Directive,
    ClickOutSideDirective,
    LoadModuleDirective,
    AppLoadingButtonDirective,
    AppRequiredDirective,
    NumericDirective,
    AutoFormatCurrencyDirective,
    NoDblClickDirective,
    InjectViewContainerRefDirective,
    IconCalendarDirective,
    IConClearCalendarDirective,
    DisabledControlDirective,
    HasOwnerPermissionDirective,
    ClickStopPropagationDirective,
    FormatDecimalFormControlDirective,
    DropdownToggleDirective,
    ContextMenuDirective
];
@NgModule({
    declarations: [
        ...APP_DIRECTIVES
    ],
    imports: [
        OverlayModule
    ],
    exports: [
        ...APP_DIRECTIVES
    ],
    providers: [
    ],
})

export class DirectiveModule {

}
