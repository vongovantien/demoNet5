import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormValidators } from './form.validator';

@NgModule({
    declarations: [],
    imports: [CommonModule],
    exports: [],
    providers: [
        FormValidators
    ],
})
export class ValidatorModule { }