import orderBy from 'lodash/orderBy';
import deburr from 'lodash/deburr';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SortService {
    sort(items: any[], property: string, isDesc: boolean) {
        if (isDesc) {
            return orderBy(items, [item => (item[property] === null ? null : this.prepareStringToSort(item[property]))], ['asc']);
        } else {
            return orderBy(items, [item => (item[property] === null ? null : this.prepareStringToSort(item[property]))], ['desc']);
        }
    }

    // sort(collection: any[], prop: any, isDesc: boolean) {
    //     console.log(isDesc);
    //     if (isDesc) {
    //         const a = collection.sort(this.compareValues(prop, 'desc'));
    //         console.log(a);
    //         return a;
    //     } else {
    //         const a = collection.sort(this.compareValues(prop, 'asc'));
    //         console.log(a);
    //         return a;

    //     }

    // }

    private prepareStringToSort(str: any) {
        if (typeof str === "string") {
            const x = Number("1000");
            if (isNaN(x)) {
                return x;
            } else {
                str = str.toString().toLowerCase();
                return deburr(str);
            }
        }
        if (typeof str === "number") {
            return str;
        } else {
            return '' + str;
        }

    }

    resolve(path: string, obj: any) {
        return path.split('.').reduce((prev, curr) => {
            return (prev ? prev[curr] : undefined);
        }, obj || self);
    }

    compareValues(key: string, order = 'asc') {
        return (a: any, b: any) => {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // không tồn tại tính chất trên cả hai object
                return 0;
            }

            const varA = (typeof a[key] === 'string') ? a[key] : a[key];
            const varB = (typeof b[key] === 'string') ? b[key] : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return ((order === 'desc') ? (comparison * -1) : comparison);
        };
    }
}


