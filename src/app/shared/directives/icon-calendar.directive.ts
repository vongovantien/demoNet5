import { Directive, Renderer2, ElementRef, HostListener } from '@angular/core';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

@Directive({ selector: '[calendar]' })
export class IconCalendarDirective {


    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private _d: DaterangepickerDirective
    ) { }

    @HostListener('keydown.enter', ['$event'])
    onKeydownEnterHandler(event: KeyboardEvent) {
        this._d.picker.show();
    }


    ngOnInit(): void {
        const parent: HTMLElement = this.el.nativeElement.parentElement;

        const spanInputIconWrapper: HTMLElement = this.renderer.createElement('span');
        const spanInner: HTMLElement = this.renderer.createElement('span');
        const i: HTMLElement = this.renderer.createElement('i');

        this.renderer.addClass(spanInputIconWrapper, "m-input-icon__icon");
        this.renderer.addClass(spanInputIconWrapper, "m-input-icon__icon--right");
        this.renderer.addClass(i, "la");
        this.renderer.addClass(i, "la-calendar");

        this.renderer.appendChild(parent, spanInputIconWrapper);
        this.renderer.appendChild(spanInputIconWrapper, spanInner);
        this.renderer.appendChild(spanInner, i);

    }

}