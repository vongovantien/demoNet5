import range from 'lodash/range';
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class PagingService {
    getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10, totalPageBtn = 5) {
        // calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        let startPage: number, endPage: number;

        if (totalPages <= totalPageBtn) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= Math.floor(totalPageBtn / 2)) {
                startPage = 1;
                endPage = totalPageBtn;
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - totalPageBtn + 1;
                endPage = totalPages;
            } else {

                if (totalPageBtn % 2 == 0) {
                    startPage = currentPage - (Math.floor(totalPageBtn / 2) - 1);
                } else {
                    startPage = currentPage - (Math.floor(totalPageBtn / 2));
                }
                endPage = currentPage + (Math.floor(totalPageBtn / 2));
            }
        }

        // calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        const pages = range(startPage, endPage + 1);

        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }
}
