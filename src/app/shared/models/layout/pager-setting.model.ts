import { NgModel } from "@angular/forms";

export class PagerSetting {
    totalItems?: number;
    currentPage?: number;
    numberPageDisplay?: number = 10;
    pageSize?: number;
    totalPages?: number;
    startPage?: number;
    endPage?: number;
    startIndex?: number;
    endIndex?: number;
    pages?: number[];
    numberToShow?: number[];
    //total page buttons
    totalPageBtn?:number;

}