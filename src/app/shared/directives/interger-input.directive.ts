import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[integer]'
})
export class IntergerInputDirective {

    private specialKeys: string[] = [
        "Delete", "Backspace", "Tab", "Escape", "Enter", "Home", "End", 'ArrowLeft', 'ArrowRight'
    ];
    constructor(
        private el: ElementRef,
        private renderer: Renderer2) {
    }

    ngOnInit(): void {
        if (!this.el.nativeElement.getAttribute('min')) {
            this.renderer.setAttribute(this.el.nativeElement, 'min', '0');
        }
        if (!this.el.nativeElement.getAttribute('step')) {
            this.renderer.setAttribute(this.el.nativeElement, 'step', 'any');
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
        if ((e.shiftKey || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) === -1)) {
            e.preventDefault();
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData
            .getData('text/plain')
            .replace(/\D/g, ''); // get a digit-only string
        document.execCommand('insertText', false, pastedInput);
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        event.preventDefault();
        const textData = event.dataTransfer
            .getData('text').replace(/\D/g, '');
        this.el.nativeElement.focus();
        document.execCommand('insertText', false, textData);
    }
}