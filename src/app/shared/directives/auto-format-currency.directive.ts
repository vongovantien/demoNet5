import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SystemConstants } from '@constants';

@Directive({
    selector: '[autoFormatCurrency]',
    providers: [CurrencyPipe]
})
export class AutoFormatCurrencyDirective {
    @Input() set digits(d: number) { this._digitNumber = ('.0-' + d); }
    @Input() set decimals(number: number) { this.setRegex(number); }
    @Input() set currency(c: string) { this._currency = c; }
    get currency() { return this._currency; }

    _currency: string = '';
    _digitNumber = '.0-3';

    private el: HTMLInputElement;
    private lastValid = '';
    private specialKeys: string[] = [
        "Delete", "Backspace", "Tab", "Escape", "Enter", "Home", "End", 'ArrowLeft', 'ArrowRight'
    ];

    isReadyClear = false;
    digitRegex: RegExp = new RegExp(this.regexString(), 'g');

    constructor(
        private currencyPipe: CurrencyPipe,
        private _elementRef: ElementRef,
        private renderer: Renderer2

    ) {
        this.el = this._elementRef.nativeElement;
    }

    private setRegex(maxDigits?: number) {
        if (maxDigits <= 0) {
            // this.digitRegex = new RegExp(/^\d+$/);
            this.digitRegex = new RegExp(SystemConstants.CPATTERN.NUMBER);

        } else {
            this.digitRegex = new RegExp(this.regexString(maxDigits), 'g');
        }
    }

    private regexString(max?: number) {
        return "^\\s*((\\d+(\\.\\d{0," + max + "})?)|((\\d*(\\.\\d{1," + max + "}))))\\s*$";
    }

    ngOnInit(): void {
        if (!this._elementRef.nativeElement.getAttribute('type') || this._elementRef.nativeElement.getAttribute('type') === 'number') {
            this.renderer.setAttribute(this._elementRef.nativeElement, 'type', 'text');
        }

        setTimeout(() => {
            this.el.value = this.currencyPipe.transform(this.el.value, this.currency, '', this._digitNumber);
        }, 500);
    }

    @HostListener("focus", ["$event.target.value"])
    onFocus(value) {
        this.el.value = value.replace(/[^0-9.-]+/g, '');
        // this.el.select();
    }

    @HostListener("select", ["$event.target.value"])
    onSelect(value) {
        this.isReadyClear = true;
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value) {
        this.el.value = this.currencyPipe.transform(value, this.currency, '', this._digitNumber);
        this.isReadyClear = false;
    }

    @HostListener("keydown.control.z", ["$event.target.value"])
    onUndo(value) {
        this.el.value = '';
    }

    @HostListener("keydown", ["$event"])
    onKeyDown(v) {
        if (
            v.ctrlKey === true ||
            this.specialKeys.indexOf(v.key) !== -1 ||
            (v.key === "a" && v.ctrlKey === true) || // Allow: Ctrl+A
            (v.key === 'c' && v.ctrlKey === true) || // Allow: Ctrl+C
            (v.key === 'v' && v.ctrlKey === true) || // Allow: Ctrl+V
            (v.key === 'x' && v.ctrlKey === true)  // Allow: Ctrl+X
        ) {
            return;
        }
        if (this.isReadyClear === true) {
            if (v.key === 'Backspace') {
                this.el.value = '';
            } else {
                this.el.value = '';
                // this.el.value = v.key;
            }
            this.isReadyClear = false;
            this.onInput(v);
        }
    }

    @HostListener('input', ['$event'])
    onInput(event) {
        // when user on input, check regex
        const cleanValue = (event.target.value);
        // const cleanValue = (event.target.value.match(this.digitRegex) || event.target.value.match(new RegExp(/\,/g)) || []).join('');
        if (cleanValue || !event.target.value) {
            this.lastValid = cleanValue;
        }
        this.el.value = cleanValue || this.lastValid;

    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData
            .getData('text/plain')
            .replace(/[^0-9.]+/g, '');
        this.el.value = '';
        document.execCommand('insertText', false, pastedInput);
    }
}
