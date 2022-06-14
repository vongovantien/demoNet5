import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppForm } from '@app';
import { ChargeConstants } from '@constants';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, CatalogueRepo, SystemRepo } from '@repositories';
import { IAppState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { CombineBilling } from 'src/app/shared/models/accouting/combine-billing.model';

@Component({
  selector: 'form-get-billing-list',
  templateUrl: './form-get-billing-list.component.html'
})
export class FormGetBillingListComponent extends AppForm {
  @Input() isUpdate: boolean = false;
  @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

  formGroup: FormGroup;
  billingNo: AbstractControl;
  partnerId: AbstractControl;
  billingType: AbstractControl;
  billingDateType: AbstractControl;
  billingDate: AbstractControl;
  service: AbstractControl;
  documentType: AbstractControl;
  referenceNo: AbstractControl;
  description: AbstractControl;

  billingTypeList: string[] = ['All', 'Debit', 'Credit'];
  typeDateSearch: string[] = ['Issue Date', 'Service Date'];
  serviceList: CommonInterface.INg2Select[] = [];
  documentTypes: string[] = ['CD Note', 'Soa', 'Job No', 'HBL No', 'Custom No'];
  partners: any;
  billing: CombineBilling;

  constructor(
    protected _router: Router,
    protected _toastService: ToastrService,
    protected _accountingRepo: AccountingRepo,
    private _activedRoute: ActivatedRoute,
    private _ngProgressService: NgProgress,
    private _fb: FormBuilder,
    private _catalogueRepo: CatalogueRepo,
    private _systemRepo: SystemRepo,
    private _store: Store<IAppState>
  ) {
    super();
    this._progressRef = this._ngProgressService.ref();
  }

  ngOnInit() {
    this.initFormCombine();
    this.getService();
    this.getPartner();
    if (!this.isUpdate) {
      this.getInitBillingNo();
    }
  }

  initFormCombine() {
    this.formGroup = this._fb.group({
      'billingNo': [],
      'partnerId': [null, Validators.required],
      'billingType': ['All'],
      'billingDateType': [this.typeDateSearch[0]],
      'billingDate': [],
      'service': ['All'],
      'documentType': [this.documentTypes[0]],
      'referenceNo': [],
      'description': []
    });

    this.partnerId = this.formGroup.controls['partnerId'];
    this.billingType = this.formGroup.controls['billingType'];
    this.billingNo = this.formGroup.controls['billingNo'];
    this.billingDateType = this.formGroup.controls['billingDateType'];
    this.billingDate = this.formGroup.controls['billingDate'];
    this.service = this.formGroup.controls['service'];
    this.documentType = this.formGroup.controls['documentType'];
    this.referenceNo = this.formGroup.controls['referenceNo'];
    this.description = this.formGroup.controls['description'];
  }

  getInitBillingNo() {
    this._accountingRepo.generateCombineBillingNo()
      .pipe(catchError(this.catchError))
      .subscribe(
        (data) => {
          this.billingNo.setValue(data);
        }
      );
  }

  getPartner() {
    const customersFromService = this._catalogueRepo.getCurrentCustomerSource();
    if (!!customersFromService.data.length) {
      this.partners = customersFromService.data;
      return;
    }
    this._catalogueRepo.getPartnersByType(PartnerGroupEnum.ALL, true)
      .subscribe(
        (data) => {
          this._catalogueRepo.customersSource$.next({ data }); // * Update service.
          this.partners = data;
        }
      );
  }
  getService() {
    this.serviceList = ChargeConstants.ServiceTypeMapping;
    this.service.setValue([this.serviceList[0].id]);
  }

  selelectedService(event: any) {
    const currData = this.service.value;
    if (currData.filter(x => x === 'All').length > 0 && event.id !== 'All') {
      currData.splice(0);
      currData.push(event.id);
      this.service.setValue(currData);

    }
    if (event.id === 'All') {
      this.service.setValue(['All']);
    }

  }

  search() {
    this.isSubmitted = true;
    if (!this.partnerId.value) {
      return;
    }
    const dataForm: { [key: string]: any } = this.formGroup.getRawValue();
    let body: ISearchListShipment = {
      partnerId: !dataForm.partnerId ? null : dataForm.partnerId,
      type: this.getTypeData(dataForm.billingType),
      issuedDateFrom: this.billingDateType.value == "Issue Date" ? (!!dataForm.billingDate ? (!dataForm.billingDate.startDate ? null : formatDate(dataForm.billingDate.startDate, 'yyyy-MM-dd', 'en')) : null) : null,
      issuedDateTo: this.billingDateType.value == "Issue Date" ? (!!dataForm.billingDate ? (!dataForm.billingDate.endDate ? null : formatDate(dataForm.billingDate.endDate, 'yyyy-MM-dd', 'en')) : null) : null,
      serviceDateFrom: this.billingDateType.value == "Service Date" ? (!!dataForm.billingDate ? (!dataForm.billingDate.startDate ? null : formatDate(dataForm.billingDate.startDate, 'yyyy-MM-dd', 'en')) : null) : null,
      serviceDateTo: this.billingDateType.value == "Service Date" ? (!!dataForm.billingDate ? (!dataForm.billingDate.endDate ? null : formatDate(dataForm.billingDate.endDate, 'yyyy-MM-dd', 'en')) : null) : null,
      // personInCharge: !this.personInCharge.value ? this.personInCharges.map((item: any) => item.id).join(';') : this.personInCharge.value.join(';'),
      services: this.getServiceData(dataForm.service),
      documentType: dataForm.documentType,
      documentNo: !!dataForm.referenceNo ? dataForm.referenceNo.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
      combineNo: this.billingNo.value
    };
    this.onSearch.emit(body);
  }

  getTypeData(billingType: '') {
    let strType = null;
    if (!!billingType) {
      if (billingType === 'All') {
        strType = '';
      } else{
        strType = billingType;
      }
    }
    return strType;
  }

  getServiceData(service: any[]) {
    let strService = null;
    if (!!service) {
      strService = [];
      service.forEach(element => {
        if (element !== 'All') {
          strService.push(element);
        } else {
          return [];
        }
      });
    }
    return strService;
  }

  reset(){
    this.isSubmitted = false;
    if(!this.isUpdate){
      this.partnerId.setValue(null);
      this.billingType.setValue('All');
      this.billingDateType.setValue(this.typeDateSearch[0]);
      this.billingDate.setValue(null);
      this.service.setValue(['All']);
      this.documentType.setValue(this.documentTypes[0]);
      this.referenceNo.setValue(null);
      this.description.setValue(null);
    }else{
      this.billingType.setValue('All');
      this.billingDateType.setValue(this.typeDateSearch[0]);
      this.billingDate.setValue(null);
      this.service.setValue(['All']);
      this.documentType.setValue(this.documentTypes[0]);
      this.referenceNo.setValue(null);
    }
  }
  print() {

  }
}

interface ISearchListShipment {
  partnerId: string;
  type: string;
  issuedDateFrom: string;
  issuedDateTo: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  services: string[];
  documentType: string;
  documentNo: string[];
  combineNo: string;
}