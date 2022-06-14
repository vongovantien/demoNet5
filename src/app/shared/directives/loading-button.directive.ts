import { Directive, ElementRef, Input, HostBinding, Renderer2, HostListener } from '@angular/core';

@Directive({
    selector: '[appLoadingButton]'
})
export class AppLoadingButtonDirective {

    @Input()
    @HostBinding('disabled')
    state: boolean;

    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
    ) { }

    // @HostListener('click', ['$event'])
    // onClick($event: Event): void | any {
    //     $event.stopPropagation();
    //     $event.preventDefault();
    // }

    ngOnInit() {
        this.renderer.setAttribute(this.el.nativeElement, 'disabled', this.state ? 'disabled' : '');
    }
}

