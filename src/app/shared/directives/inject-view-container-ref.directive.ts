import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[inject]'
})
export class InjectViewContainerRefDirective {
    constructor(public viewContainerRef: ViewContainerRef) {
    }
}