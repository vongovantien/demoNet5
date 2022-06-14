import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';
const BASE_TIMER_DELAY = 10;
@Directive({
    selector: '[autoFocus]'
})
export class AutofocusDirective implements AfterContentInit {

    // tslint:disable-next-line: no-input-rename
    @Input('autoFocus') enable: boolean = true;

    @Input() timerDelay: number = BASE_TIMER_DELAY;

    private elementRef: ElementRef;
    private timer: any;

    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        this.timer = null;
    }

    setDefaultValue() {
        if (this.enable === false) {
            return;
        }
        this.enable = true;
    }

    public ngAfterContentInit(): void {
        this.setDefaultValue();
        if (this.enable) {
            this.startFocusWorkflow();
        }
    }

    public ngOnDestroy(): void {
        this.stopFocusWorkflow();
    }

    private startFocusWorkflow(): void {
        if (this.timer) {
            return;
        }

        this.timer = setTimeout((): void => {
            this.timer = null;
            this.elementRef.nativeElement.focus();
        }, this.timerDelay);
    }

    private stopFocusWorkflow(): void {
        clearTimeout(this.timer);
        this.timer = null;
    }
}
