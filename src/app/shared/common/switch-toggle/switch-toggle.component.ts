import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
    selector: 'app-switch',
    templateUrl: './switch-toggle.component.html',
    styles: [
        `
        .m-switch.m-switch--success:not(.m-switch--outline) input:empty ~ span:before {
            background-color: #ebedf2;
        }        
        .m-switch.m-switch--success:not(.m-switch--outline)
            input:checked
            ~ span:before {
            background-color: #34bfa3;
        }
        .m-switch.m-switch--danger:not(.m-switch--outline) input:empty ~ span:before {
            background-color: #ebedf2;
        }
         .m-switch.m-switch--danger:not(.m-switch--outline)
            input:checked
            ~ span:before {
            background-color: #f4516c;
        }
        
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => SwitchToggleComponent),
        }
    ]
})
export class SwitchToggleComponent implements ControlValueAccessor {
    @Input() class: string = 'success';
    @Input() size: string = "md";
    @Input() set disabled(v: boolean) {
        this._disabled = coerceBooleanProperty(v);
    };
    @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    private toggle: boolean = false; // * internal state
    private onChange: Function = (v: boolean) => { };
    private onTouch: Function = () => { };

    private _disabled: boolean = false;

    get disabled(): boolean {
        return this._disabled;
    }

    constructor(private _cd: ChangeDetectorRef) { }

    set toggleValue(val: boolean) {
        if (val !== null && val !== undefined) {
            this.toggle = val;

            this.onChange(val);
            this.onTouch(val);

            // this.toggleChange.emit(this.toggle);
        }
    }

    get toggleValue() {
        return this.toggle;
    }

    public writeValue(value: any) {
        this.toggleValue = value;

        // ! Check this out https://github.com/angular/angular/issues/10816
        this._cd.markForCheck();
    }

    public registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    public registerOnTouched(fn: Function) {
        this.onTouch = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    ngOnInit(): void { }
}
