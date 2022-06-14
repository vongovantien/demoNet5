import { HostListener, Directive, Input, Renderer2, ElementRef } from "@angular/core";
@Directive({
    selector: '[NoDbClick]'
})
export class NoDblClickDirective {
    @Input() timer: number = 1000; // * delay 1s.
    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
    ) {
        this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
    }

    ngOnInit(): void {

    }

    @HostListener('click', ['$event'])
    clickEvent(event: any) {
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'disabled');
        setTimeout(() => {
            this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
        }, this.timer);
    }
}
