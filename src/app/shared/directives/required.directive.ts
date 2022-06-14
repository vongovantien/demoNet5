import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
    selector: '[required]'
})
export class AppRequiredDirective {
    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
    ) { }

    ngOnInit() {
        const span = this.renderer.createElement('span');
        this.renderer.appendChild(span, this.renderer.createText('(*)'));
        this.renderer.appendChild(this.el.nativeElement, span);
        this.renderer.setAttribute(this.el.nativeElement, 'title', 'Field required');
    }

    ngAfterViewInit(): void {

        this.renderer.addClass(this.el.nativeElement.querySelector('span'), "text-danger");

    }
}

