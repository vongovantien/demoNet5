import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, QueryList, ViewChildren, ChangeDetectionStrategy, HostListener, forwardRef, ChangeDetectorRef } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';
import { ListKeyManager, FocusKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { AppCombogridItemComponent } from './combogrid-item/combo-grid-item.component';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'app-combo-grid-virtual-scroll',
    templateUrl: './combo-grid-virtual-scroll.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => ComboGridVirtualScrollComponent),
        }
    ]

})
export class ComboGridVirtualScrollComponent implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {
    @Input() dataSources: any[];
    @Input() displayFields: { field: string, label: string }[];
    @Input() searchFields: any[];
    @Input() selectedDisplayFields: any[];
    @Input() currentActiveItemId: any;
    @Input() disabled: boolean;
    @Input() height: number = 200;
    @Input() isTooltip: boolean = false;
    @Input() loading: boolean = false;
    @Input() placeholder: string = '';
    @Input() size: number = 25;
    @Input() clearable: boolean = true;
    @Input() name: string = null;
    @Input() set allowFreeText(val: any) {
        this._allowEditing = coerceBooleanProperty(val);
    }
    private _allowEditing: boolean = false;

    get allowEditing(): boolean {
        return this._allowEditing;
    }

    @Output() itemSelected = new EventEmitter<any>();
    @Output() remove = new EventEmitter<any>();

    @ViewChild('inputSearch') inputSearch: ElementRef;
    @ViewChild('clkSearch') inputPlaceholder: ElementRef;
    @ViewChildren(AppCombogridItemComponent) items: QueryList<AppCombogridItemComponent>;
    @ViewChild(BsDropdownDirective) dropdown: BsDropdownDirective;

    currentItemSelected: any = null;
    CurrentActiveItemIdObj: { field: string, value: any, hardValue: any } = null;
    indexSelected: number = -1;
    ConstDataSources: any[] = [];
    DataSources: any[] = [];
    DisplayFields: { field: string, label: string }[] = [];
    SearchFields: string[] = [];
    SelectedDisplayFields: string[] = [];
    Disabled: boolean = false;
    searchKeys: string[] = [];
    showAngledownIcon: boolean = false;
    keyboardEventsManager: ListKeyManager<any>;
    isFocusSearch: boolean = false;
    keyword: string = '';

    private keyManager: FocusKeyManager<AppCombogridItemComponent>;
    public displaySelectedStr: string = ''; // * public for set value direct
    private onChange: Function = (v: string) => { };
    private onTouch: Function = () => { };
    private timeout: NodeJS.Timeout;

    @HostListener('keydown.Enter', ['$event'])
    onKeydownEnterHandler(event: KeyboardEvent) {
        if (this.isFocusSearch) {
            this.inputPlaceholder.nativeElement.click();
            if (this._allowEditing && this.dropdown) {
                this.dropdown.hide();
            }
        }
    }

    constructor(
        private cdf: ChangeDetectorRef
    ) {
    }

    ngOnInit() { }

    ngAfterViewInit() {
        this.keyManager = new FocusKeyManager(this.items).withWrap();
    }

    onKeydown(event: any) {
        if (event.keyCode === ENTER) {
            const item = this.keyManager.activeItem.data;

            this.itemSelected.emit(item);
            this.setCurrentActiveItem(item);

            this.currentItemSelected = item;
            if (this.CurrentActiveItemIdObj !== null && this.CurrentActiveItemIdObj.value !== null) {
                this.CurrentActiveItemIdObj.value = item[this.CurrentActiveItemIdObj.field];
            }

            // * Reset keyword search.
            this.keyword = '';
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    onKeydownSearchInput(e: any) {
        if (e.keyCode === DOWN_ARROW) {
            this.keyManager.onKeydown(e);
            this.keyManager.setFirstItemActive();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!changes.dataSources) {
            this.loading = changes.dataSources.firstChange;
            if (!!changes.dataSources.currentValue) {
                if (!!changes.dataSources.currentValue.length) {
                    if (changes.dataSources.firstChange) {
                        this.loading = false;
                    }
                } else {
                    this.loading = false;
                }
                this.setDataSource(changes.dataSources.currentValue);
            } else {
                this.loading = false;
            }
        }
        if (!!changes.displayFields && !!changes.displayFields.currentValue) {
            this.setDisplayFields(changes.displayFields.currentValue);
        }
        if (!!changes.selectedDisplayFields && !!changes.selectedDisplayFields.currentValue) {
            this.setSelectedDisplayFields(changes.selectedDisplayFields.currentValue);
        }
        if (!!changes.currentActiveItemId && (!!changes.currentActiveItemId.currentValue)) {
            this.setCurrentActiveItemId(changes.currentActiveItemId.currentValue);
        }
        if (changes.disabled !== undefined && changes.disabled !== null) {
            this.setDisabled(changes.disabled.currentValue);
        }
        if (!!changes.loading && typeof changes.loading.currentValue === 'boolean') {
            this.loading = changes.loading.currentValue;
        }
        // if (!!changes.displaySelectedStr) {
        //     this.displaySelectedStr = changes.displaySelectedStr.currentValue;
        // }
    }

    setDataSource(data: any[]) {
        if (!!data && data.length > 0) {
            this.DataSources = data;
            this.ConstDataSources = cloneDeep(data);
            if (this.CurrentActiveItemIdObj !== null) {
                const activeItemData = this.CurrentActiveItemIdObj;

                const itemIndex = this.ConstDataSources.findIndex(o => o[activeItemData.field] === activeItemData.value);

                if (itemIndex !== -1) {
                    this.indexSelected = itemIndex;
                    // * Trường hợp currentItem về null sau đó get lại source
                    if (!!this.currentActiveItemId?.value) {
                        this.setCurrentActiveItem(this.ConstDataSources[itemIndex]);
                    }

                } else if (!!activeItemData.hardValue) {
                    this.displaySelectedStr = activeItemData.hardValue;
                }
            }
        } else {
            this.DataSources = data;
            this.ConstDataSources = cloneDeep(data);
        }
    }

    setDisplayFields(data: { field: string, label: string }[]) {
        if (!!data && data.length > 0) {
            this.DisplayFields = data;
            this.searchKeys = this.DisplayFields.map(d => d.field);
        }
    }

    setSelectedDisplayFields(data: any[]) {
        if (data.length > 0) {
            this.SelectedDisplayFields = data;
            this.searchKeys.push(...data);
        }
    }

    setDisabled(data: boolean) {
        this.Disabled = data;
    }

    setCurrentActiveItemId(data: any) {
        // * Ưu tiên hiển thị hardValue
        if (data.hardValue) {
            this.displaySelectedStr = data.hardValue;
        } else {
            if (data.value != null) {
                this.CurrentActiveItemIdObj = data;
                if (!!this.ConstDataSources.length) {
                    const itemIndex = this.ConstDataSources.findIndex(i => i[data.field] === data.value);
                    if (itemIndex !== -1) {
                        this.indexSelected = itemIndex;
                        this.setCurrentActiveItem(this.ConstDataSources[itemIndex]);
                    } else if (!!data.hardValue) {
                        this.displaySelectedStr = data.hardValue;
                    }
                }

            } else {
                this.indexSelected = -1;
                if (!!data.hardValue) {
                    this.displaySelectedStr = data.hardValue;
                } else {
                    this.displaySelectedStr = null;
                }
            }
        }

    }

    removeCurrenActiveItem() {
        // this.indexSelected = -1;
        // this.displaySelectedStr = null;
        this.setCurrentActiveItemId({ value: null });
        this.remove.emit();
        // this.displaySelectedStrChange.emit(null);
    }

    emitSelected(item: any, index: number) {
        this.indexSelected = index;
        this.itemSelected.emit(item);
        this.setCurrentActiveItem(item);

        this.currentItemSelected = item;
        if (this.CurrentActiveItemIdObj !== null && this.CurrentActiveItemIdObj.value !== null) {
            this.CurrentActiveItemIdObj.value = item[this.CurrentActiveItemIdObj.field];
        }

        this.keyManager.setActiveItem(index);
        // * Reset keyword search.
        this.keyword = '';
    }

    setCurrentActiveItem(item: any) {
        this.displaySelectedStr = '';
        if (this.SelectedDisplayFields.length === 1) {
            this.displaySelectedStr += (!item[this.SelectedDisplayFields[0]] ? '' : item[this.SelectedDisplayFields[0]]);
        } else {
            let dataItem = '';
            this.SelectedDisplayFields.forEach((data: string, index: number) => {
                if (!!item[data]) {
                    if (index === 0) {
                        dataItem = (item[data] === null ? '' : item[data]);
                    } else {
                        dataItem += ' - ' + (item[data] === null ? '' : item[data]);
                    }
                }
                this.displaySelectedStr = dataItem;
            });
        }
        // this.displaySelectedStrChange.emit(this.displayStringValue);
    }

    clickSearch() {
        if (this.inputSearch) {
            this.timeout = setTimeout(() => this.inputSearch.nativeElement.focus(), 0);
        }
    }

    onFocusInputPlaceholder(e) {
        this.isFocusSearch = true;
    }

    trackByFn(index: number, item: any) {
        return !!item.id ? item.id : !!item.code ? item.code : index;
    }

    set displayStringValue(val: string) {
        if (val !== undefined) {
            this.displaySelectedStr = val;
            this.onChange(val);
            this.onTouch(val);
            this.cdf.markForCheck();

        }
    }

    get displayStringValue() {
        return this.displaySelectedStr;
    }

    public writeValue(value: any) {
        this.displayStringValue = value;

        // ! Check this out https://github.com/angular/angular/issues/10816
        this.cdf.markForCheck();
    }

    public registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: Function): void {
        this.onTouch = fn
    }

    public setDisabledState?(isDisabled: boolean): void {
        this.setDisabled(isDisabled);
    }

    ngOnDestroy(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

}
