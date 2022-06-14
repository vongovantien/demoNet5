import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AppForm } from '@app';
import { JobConstants, SystemConstants } from '@constants';
import { CommonEnum } from '@enums';
import { Partner } from '@models';
import { Store } from '@ngrx/store';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { IAppState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { SearchListCombineBilling } from '../../store/actions';
import { getDataSearchCombineBillingState } from '../../store/reducers';

@Component({
  selector: 'form-search-combine-billing',
  templateUrl: './form-search-combine-billing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSearchCombineBillingComponent extends AppForm implements OnInit {
  @Input() isExport: boolean = false;

  referenceNo: AbstractControl;
  partnerId: AbstractControl;
  createDate: AbstractControl;
  creator: AbstractControl;

  partners: Observable<Partner[]>;
  formSearch: FormGroup;

  dataSearch: ISearchDataBilling;
  creators: any[] = [];
  selectedCreator: any[] = [];
  displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;

  constructor(
    private _catalogueRepo: CatalogueRepo,
    private _systemRepo: SystemRepo,
    private _fb: FormBuilder,
    private _toastService: ToastrService,
    private _store: Store<IAppState>,
  ) {
    super();
    this.requestSearch = this.onSubmit;
    this.requestReset = this.resetSearch;
  }

  ngOnInit() {
    this.initFormSearch();
    this.loadPartnerList();
    this.loadCreatorList();

    this.subscriptionSearchParamState();
  }

  initFormSearch() {
    this.formSearch = this._fb.group({
      'referenceNo': [],
      'partnerId': [],
      'createDate': [{ startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, new Date().getDate()),
        endDate: new Date()}],
      'creator': []
    });

    this.referenceNo = this.formSearch.controls['referenceNo'];
    this.partnerId = this.formSearch.controls['partnerId'];
    this.createDate = this.formSearch.controls['createDate'];
    this.creator = this.formSearch.controls['creator'];
  }

  subscriptionSearchParamState() {
    this._store.select(getDataSearchCombineBillingState)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (data: any) => {
          if (data) {
            let formData: any = {
              referenceNo: !!data.referenceNo && !!data.referenceNo.length ? data.referenceNo.join('\n') : null,
              partnerId: data.partnerId ? data.partnerId : null,
              createDate: (!!data?.createdDateFrom && !!data?.createdDateTo) ?
                { startDate: new Date(data?.createdDateFrom), endDate: new Date(data?.createdDateTo) } : null,
              creator: !data.creator || data.creator.length == 0 ? ['All'] : data.creator
            };
            this.formSearch.patchValue(formData);
          }
        }
      );
  }

  loadPartnerList() {
    this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL, true);
  }

  loadCreatorList() {
    this._systemRepo.getSystemUsers({}).pipe(catchError(this.catchError))
      .subscribe(
        (res: any) => {
          if (!!res) {
            this.creators = this.utility.prepareNg2SelectData(res, 'id', 'username');
            this.creators.unshift({ id: 'All', text: 'All' });
            this.creator.setValue(['All']);
          } else {
            this.handleError(null, (data) => {
              this._toastService.error(data.message, data.title);
            });
          }
        },
      );
  }

  onSelectDataFormInfo(data: any, type: string) {
    switch (type) {
        case 'partner':
            this.partnerId.setValue((data as Partner).id);
            if(!!this.partnerId.value){
              console.log('5456')
              this.isExport = false;
            }
            break;
        default:
            break;
    }
  }
  getCreatorData(creator: []) {
    let strCreator = [];
    if (!!creator) {
      strCreator = [];
      creator.forEach(element => {
        if (element !== 'All') {
          strCreator.push(element);
        } else {
          return [];
        }
      });
    }
    return strCreator;
  }

  selelectedCreator(event: any){
    const currData = this.creator.value;
    if (currData.filter(x => x === 'All').length > 0 && event.id !== 'All') {
      currData.splice(0);
      currData.push(event.id);
      this.creator.setValue(currData);

    }
    if (event.id === 'All') {
      this.creator.setValue(['All']);
    }
  }

  onSubmit() {
    const dataForm: { [key: string]: any } = this.formSearch.getRawValue();
    const body: ISearchDataBilling = {
      referenceNo: !!dataForm.referenceNo ? dataForm.referenceNo.trim().replace(SystemConstants.CPATTERN.LINE, ',').trim().split(',').map((item: any) => item.trim()) : null,
      partnerId: dataForm.partnerId,
      createdDateFrom: (!!this.createDate && !!this.createDate.value?.startDate) ? formatDate(this.createDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
      createdDateTo: (!!this.createDate && !!this.createDate.value?.endDate) ? formatDate(this.createDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
      creator: !!dataForm.creator ? this.getCreatorData(dataForm.creator) : null
    };
    this._store.dispatch(SearchListCombineBilling(body));
  }

  resetSearch() {
    this.formSearch.reset();
    this.selectedCreator = ['All'];
    this.creator.setValue(null);
    this.referenceNo.setValue(null);
    this.partnerId.setValue(null);

    this._store.dispatch(SearchListCombineBilling({createdDateFrom: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 3, new Date().getDate()), 'yyyy-MM-dd', 'en'),
    createdDateTo: formatDate(new Date(), 'yyyy-MM-dd', 'en')}));
  }
}


interface ISearchDataBilling {
  referenceNo: string[];
  partnerId: string;
  createdDateFrom: string;
  createdDateTo: string;
  creator: string[];
}