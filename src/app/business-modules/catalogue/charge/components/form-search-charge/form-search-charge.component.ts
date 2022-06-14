import { Component, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppForm } from 'src/app/app.form';


import { Store } from '@ngrx/store';
import { getChargeSearchParamsState, IChargeState } from '../../store/reducers';
import { SearchList } from '../../store/actions';
import { takeUntil } from 'rxjs/operators';
import { SearchOptionsComponent } from '@common';
@Component({
    selector: 'form-search-charge',
    templateUrl: './form-search-charge.component.html'
})
export class FormSearchChargeComponent extends AppForm implements OnInit {
    @Output() onSearch: EventEmitter<ISearchGroup> = new EventEmitter<ISearchGroup>();
    configSearch: any;
    data: any;
    @ViewChild(SearchOptionsComponent, { static: true }) searchOptionsComponent: SearchOptionsComponent;
    constructor(private _store: Store<IChargeState>,
        private _cd: ChangeDetectorRef) {
        super();
        this.requestSearch = this.searchData;
        this.requestReset = this.onReset;
    }

    ngOnInit() {
        this._store.select(getChargeSearchParamsState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (!!data) {
                        this.data = data;
                        this.onSearch.emit(data);
                    }

                }
            );

        this.configSearch = {
            typeSearch: 'outtab',
            settingFields: <CommonInterface.IValueDisplay[]>[
                { displayName: 'Code', fieldName: 'code' },
                { displayName: 'Name EN', fieldName: 'chargeNameEn' },
                { displayName: 'Name Local', fieldName: 'chargeNameVn' },
                { displayName: 'Type', fieldName: 'type' }
            ]
        };
    }
    ngAfterViewInit() {
        if (Object.keys(this.data).length > 0) {
            this.searchOptionsComponent.searchObject.searchString = this.data.keyword;
            this.searchOptionsComponent.searchObject.field = this.data.type;
            this.searchOptionsComponent.searchObject.displayName = this.data.type;
            this._cd.detectChanges();
        }
    }
    searchData(searchObject: ISearchObject) {
        const searchData: ISearchGroup = {
            type: searchObject.field,
            keyword: searchObject.searchString
        };
        this._store.dispatch(SearchList({ payload: searchData }));
        this.onSearch.emit(searchData);
        console.log(searchData);
    }

    onReset(data: any) {
        this._store.dispatch(SearchList({
            payload: {}
        }));
        this.onSearch.emit(data);

    }
}
interface ISearchGroup {
    type: string;
    keyword: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
    searchString: string;
    field: string;
}