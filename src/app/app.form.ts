import { AppPage } from './app.base';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ButtonModalSetting } from './shared/models/layout/button-modal-setting.model';
import { ButtonType } from './shared/enums/type-button.enum';
import { ViewChildren, QueryList, HostListener, ElementRef, Directive } from '@angular/core';
import { ComboGridVirtualScrollComponent } from './shared/common/combo-grid-virtual-scroll/combo-grid-virtual-scroll.component';
import { Observable, fromEvent, merge, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, share, filter, takeUntil } from 'rxjs/operators';

@Directive()
export abstract class AppForm extends AppPage {
    @ViewChildren(ComboGridVirtualScrollComponent) comboGrids: QueryList<ComboGridVirtualScrollComponent>;

    requestSearch: any = null;
    requestReset: any = null;

    isDisabled: boolean = null;
    isSubmitted: boolean = false;
    isCollapsed: boolean = true;
    isDuplicate: boolean = false;
    isReadonly: any = false;

    selectedRange: any;

    resetButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.reset
    };

    saveButtonSetting: ButtonModalSetting = {
        buttonAttribute: {
            type: 'button',
            titleButton: "Save",
            classStyle: "btn btn-brand  m-btn--icon m-btn--uppercase",
            icon: "la la-save"
        },
        typeButton: ButtonType.save,
    };

    accepctFilesUpload = 'image/*,.txt,.pdf,.doc,.xlsx,.xls';

    digitDecimal: number = 5;

    confirmCancelFormText: string = "All entered data will be discarded, <br>Are you sure you want to leave?";
    confirmUpdateHblText: string = 'You are about to update HBL, are you sure all entered details are correct?';
    confirmCreateHblText: string = 'Are you sure you want to create HBL?';
    invalidFormText: string = 'Opps, It looks like you missed something, Please recheck the highlighted field below.';
    errorETA: string = 'ETA must be greater than or equal ETD';
    confirmSyncHBLText: string = `Do you want to sync <span class='font-italic'>ETD, Port, Issue By, Agent, Flight No, Flight Date, Warehouse, Route, MBL to HAWB ?<span>`;
    currentFormValue: any;

    form: FormGroup;
    private $submitClick = new Subject<null>();

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.reset();
    }
    constructor() {
        super();
    }

    submitClick(data?) {
        this.$submitClick.next(data);
    }
    resetFormWithFeilds(form: FormGroup, key: string): void {
        if (form.controls.hasOwnProperty(key)) {
            if (form.controls[key] instanceof AbstractControl || form.controls[key] instanceof FormControl) {
                form.controls[key].setErrors(null);
                form.controls[key].reset();
                form.controls[key].markAsUntouched({ onlySelf: true });
                form.controls[key].markAsPristine({ onlySelf: true });
            }
        }
    }

    resetFormControl(control: FormControl | AbstractControl) {
        if (!!control && control instanceof FormControl) {
            control.setValue(null);
            control.markAsUntouched({ onlySelf: true });
            control.markAsPristine({ onlySelf: true });
        }
    }

    emailValidator(control: AbstractControl) {
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

    passwordValidator(control: AbstractControl) {
        if (control.value.match(/^(?=.*\d)(?=.*[a-zA-Z!@#$%^&*])(?!.*\s).{6,100}$/)) {
            return null;
        } else {
            return { 'invalidPassword': true };
        }
    }

    removeValidators(form: FormControl | AbstractControl) {
        form.clearValidators();
        form.updateValueAndValidity();
    }

    addValidators(form: FormControl | AbstractControl, validateFn: ValidatorFn | ValidatorFn[]) {
        form.setValidators(validateFn);
        form.updateValueAndValidity();
    }

    setError(control: FormControl | AbstractControl, err: ValidationErrors = null) {
        control.setErrors(err);
    }

    onSearchRequest($event?: any) {
        this.requestSearch($event);
    }

    reset($event?: any) {
        if (!!this.requestReset) {
            this.requestReset($event);
        }
    }

    setFocusInput(element: ElementRef) {
        if (!!element) {
            element.nativeElement.focus();
        }

    }

    resetKeywordSearchCombogrid() {
        if (this.comboGrids) {
            const arrayCombo = this.comboGrids.toArray();
            if (arrayCombo.length > 0) {
                arrayCombo.forEach((c: ComboGridVirtualScrollComponent) => { c.keyword = ''; });
            }
        }
    }

    trimInputValue(control: FormControl | AbstractControl, value: string) {
        control.setValue(value != null ? value.trim() : value);
    }

    createShortcut = (shortcuts: string[]): Observable<KeyboardEvent[]> => {
        const keyDown$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document as Document, 'keydown');
        const keyUp$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document as Document, 'keyup');

        // * Create KeyboardEvent Observable for specified KeyCode
        const createKeyPressStream = (charCode: string) =>
            merge(keyDown$, keyUp$).pipe(
                distinctUntilChanged((a: KeyboardEvent, b: KeyboardEvent) => a.code === b.code && a.type === b.type),
                share()
            ).pipe(filter((event: KeyboardEvent) => event.code === charCode));

        // * Create Event Stream for every KeyCode in shortcut
        const keyCodeEvents$: Observable<KeyboardEvent>[] = shortcuts.map((shortcut: string) => createKeyPressStream(shortcut));

        // * Emit when specified keys are pressed (keydown).
        // * Emit only when all specified keys are pressed at the same time.
        return combineLatest(keyCodeEvents$).pipe(
            filter<KeyboardEvent[]>((arr) => arr.every((a) => a.type === 'keydown'))
        );
    }


    protected initSubmitClickSubscription(cb: (d?: any) => void) {
        this.$submitClick
            .asObservable()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(cb);
    }


}


