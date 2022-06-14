import { ModalDirective, ModalOptions } from "ngx-bootstrap/modal";
import { AppPage } from "src/app/app.base";
import { ViewChild, Directive } from "@angular/core";
import { FormControl, AbstractControl, ValidationErrors } from "@angular/forms";
import { delayTime } from "@decorators";

@Directive()
export abstract class PopupBase extends AppPage {

    @ViewChild("popup") popup: ModalDirective;

    options: ModalOptions = {
        animated: true,
        keyboard: true,
        backdrop: 'static'
    };

    page: number = 1;
    totalItems: number = 0;
    numberToShow: number[] = [3, 15, 30, 50];
    pageSize: number = this.numberToShow[1];

    sortField: string = null;
    order: any = false;
    keyword: string = '';
    requestList: any = null;
    requestSort: any = null;

    isSubmitted: boolean = false;
    headers: CommonInterface.IHeaderTable[];

    // @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    //     if (this.popup.isShown) {
    //         this.popup.hide();
    //     }
    // }

    constructor() {
        super();
    }

    // * fn set options
    setOptions(options?: ModalOptions) {
        const self = this;
        if (typeof options === 'object') {
            for (const key in options) {
                if (self.hasOwnProperty(key)) {
                    self[key] = options[key];
                }
            }
        }
    }

    // * show poup
    show(options?: ModalOptions): void {
        this.setOptions(Object.assign(this.options, options));
        if (!this.popup.isShown) {
            this.popup.config = this.options;
            this.popup.show();
        }
    }

    @delayTime(100)
    ShowWithDelay() {
        this.show();
    }

    hide() {
        this.popup.hide();
    }

    // event fire when hide popup
    onHide($event: any) {
    }

    // event fire when show popup
    onShow($event: any) {
    }

    setSortBy(sortField?: string, order?: boolean): void {
        this.sortField = sortField ? sortField : 'code';
        this.order = order;
    }

    sortBy(sortField: string): void {
        if (!!sortField) {
            this.setSortBy(sortField, this.sortField !== sortField ? true : !this.order);

            if (typeof (this.requestSort) === 'function') {
                // this.requestList(this.sortField, this.order);   // sortField server
                this.requestSort(this.sortField, this.order);   // sortField Local
            }
        }
    }

    sortClass(sortField: string): string {
        if (!!sortField) {
            let classes = 'sortable ';
            if (this.sortField === sortField) {
                classes += ('sort-' + (this.order ? 'asc' : 'desc') + ' ');
            }

            return classes;
        }
        return '';
    }

    pageChanged(event: any): void {
        if (this.page !== event.page || this.pageSize !== event.itemsPerPage) {
            this.page = event.page;
            this.pageSize = event.itemsPerPage;

            this.requestList();
        }
    }

    selectPageSize(pageSize: number, data?: any) {
        this.pageSize = pageSize;
        this.page = 1;  // TODO reset page to initial
        this.requestList(data);
    }
    setError(control: FormControl | AbstractControl, err: ValidationErrors = null) {
        control.setErrors(err);
    }

    trimInputValue(control: FormControl | AbstractControl, value: string) {
        control.setValue(value != null ? value.trim() : value);
    }
}
