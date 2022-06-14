import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[numeric]'
})

export class NumericDirective {
    @Input() decimals: number = 0;

    private specialKeys: string[] = [
        "Delete", "Backspace", "Tab", "Escape", "Enter", "Home", "End", 'ArrowLeft', 'ArrowRight'
    ];

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {
    }

    ngOnInit(): void {
        if (!this.el.nativeElement.getAttribute('min')) {
            this.renderer.setAttribute(this.el.nativeElement, 'min', '0');
        }
        if (!this.el.nativeElement.getAttribute('step')) {
            this.renderer.setAttribute(this.el.nativeElement, 'step', 'any');
        }
    }

    private check(value: string, decimals: number) {
        if (decimals <= 0) {
            return String(value).match(new RegExp(/^\d+$/));
        } else {
            const regExpString = "^\\s*((\\d+(\\.\\d{0," + decimals + "})?)|((\\d*(\\.\\d{1," + decimals + "}))))\\s*$";
            return String(value).match(new RegExp(regExpString));
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (
            this.specialKeys.indexOf(e.key) !== -1 ||
            (e.key === "a" && e.ctrlKey === true) || // Allow: Ctrl+A
            (e.key === 'c' && e.ctrlKey === true) || // Allow: Ctrl+C
            (e.key === 'v' && e.ctrlKey === true) || // Allow: Ctrl+V
            (e.key === 'x' && e.ctrlKey === true)  // Allow: Ctrl+X
        ) {
            return;
        }

        const value: string = this.el.nativeElement.value;
        const next: string = value.concat(e.key);
        if (next && !this.check(next, this.decimals)) {
            e.preventDefault();
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, (Math.abs(+pastedInput)).toString());
    }

}
