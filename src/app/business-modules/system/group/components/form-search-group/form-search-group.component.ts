import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
  selector: 'app-form-search-group',
  templateUrl: './form-search-group.component.html'
})
export class FormSearchGroupComponent extends AppForm {
  @Output() onSearch: EventEmitter<ISearchGroup> = new EventEmitter<ISearchGroup>();
  configSearch: any;

  constructor() {
    super();
    this.requestSearch = this.searchData;
    this.requestReset = this.onReset;
  }

  ngOnInit() {
    this.configSearch = {
      typeSearch: 'outtab',
      settingFields: <CommonInterface.IValueDisplay[]>[
        { displayName: 'Group Code', fieldName: 'code' },
        { displayName: 'Name En', fieldName: 'nameEn' },
        { displayName: 'Name Local', fieldName: 'nameVn' },
        { displayName: 'Name Abbr', fieldName: 'shortName' },
        { displayName: 'Department', fieldName: 'departmentName' }
      ]
    };
  }
  searchData(searchObject: ISearchObject) {
    const searchData: ISearchGroup = {
      type: searchObject.field,
      keyword: searchObject.searchString
    };

    this.onSearch.emit(searchData);
    console.log(searchData);
  }

  onReset(data: any) {
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
