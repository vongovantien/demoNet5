import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { DestroyService } from '@services';


@Directive({
    selector: '([formControl])[formatDecimalFormControl],([formControlName])[formatDecimalFormControl]',
    providers: [DecimalPipe, DestroyService]
})
export class FormatDecimalFormControlDirective {
    @Input() set minimum(c: string) { this._minValue = c; }

    private _minValue: string = null;

    @Input() set format(format: string) {
        this._format = format;
    }
    private _format = '.0-2';

    get format() {
        return this._format;
    }

    get minValue() {
        return this._minValue;
    }
    constructor(
        private ngControl: NgControl,
        private decimalPipe: DecimalPipe,
        private _el: ElementRef<any>,
        private _destroyService: DestroyService
    ) {
    }

    ngOnInit() {
        this.ngControl.valueChanges
            .pipe(takeUntil(this._destroyService))
            .subscribe(
                (value: string) => {
                    if (value !== null && value !== undefined) {
                        const result = this.formatNumber(value);
                        if (result.indexOf('.', result.length - 1) === -1) {
                            this._el.nativeElement.value = this.decimalPipe.transform(result, this.format);
                        }
                    }
                }
            );
    }

    private formatNumber(value: any) {
        if (value !== null && value !== undefined) {
            value = value.toString().replace(/[^-0-9.]+/g, '');
        }
        return this.check(value);
    }

    private check(input) {
        if (!!this.minValue) {
            input = input < this.minValue ? '' : input;
        }

        var index = input.indexOf('.');
        if (index > -1) {
            input = input.substr(0, index + 1) + input.slice(index).replace(/\./g, '');
        }

        return input;
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value) {
        const result = this.formatNumber(value);
        this._el.nativeElement.value = this.decimalPipe.transform(result, '.0-3');
    }
}