import { Directive, Input, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({ selector: '[allowRemove]' })
export class IConClearCalendarDirective {

    @Output() remove: EventEmitter<any> = new EventEmitter<any>();
    @Input() set allowRemove(v: boolean) {
        this.isShowClearIcon = v;
        if (this.isShowClearIcon) {
            this.renderIconClear();
        }
    }

    get allowRemove() {
        return this.isShowClearIcon;
    }

    private isShowClearIcon: boolean = false;

    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
    ) { }


    ngOnInit(): void {
    }

    renderIconClear() {
        const parent: HTMLElement = this.el.nativeElement.parentElement;

        const spanInputIconWrapper: HTMLElement = this.renderer.createElement('span');
        const i: HTMLElement = this.renderer.createElement("i");

        this.renderer.addClass(spanInputIconWrapper, "m-input-icon_clear");
        this.renderer.addClass(i, "la");
        this.renderer.addClass(i, "la-times");

        this.renderer.appendChild(parent, spanInputIconWrapper);
        this.renderer.appendChild(spanInputIconWrapper, i);

        // * Listen Event click
        spanInputIconWrapper.addEventListener('click', (e: MouseEvent) => {
            this.remove.emit();

            this.renderer.removeChild(spanInputIconWrapper, i);
            this.renderer.removeChild(parent, spanInputIconWrapper);
        });
    }
}

