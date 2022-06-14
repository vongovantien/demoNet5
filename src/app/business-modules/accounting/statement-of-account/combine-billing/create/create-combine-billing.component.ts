import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppForm } from '@app';
import {  RoutingConstants } from '@constants';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, CatalogueRepo, SystemRepo } from '@repositories';
import { DataService } from '@services';
import { IAppState } from '@store';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { CombineBilling } from 'src/app/shared/models/accouting/combine-billing.model';
import { CombineBillingListComponent } from '../components/combine-billing-list/combine-billing-list.component';
import { FormGetBillingListComponent } from '../components/form-get-billing-list/form-get-billing-list.component';

@Component({
  selector: 'create-combine-billing',
  templateUrl: './create-combine-billing.component.html',
})
export class CreateCombineBillingComponent extends AppForm implements OnInit {
  @ViewChild(FormGetBillingListComponent) formSearchBillingDetail: FormGetBillingListComponent;
  @ViewChild(CombineBillingListComponent) combineBillingListDetail: CombineBillingListComponent;
  
  isUpdate: boolean = false;
  billing: any = null;
  dataSearch: any = {};

  constructor(
    protected _router: Router,
    protected _toastService: ToastrService,
    protected _accountingRepo: AccountingRepo,
    private cdRef: ChangeDetectorRef,
    private _dataService: DataService
  ) {
    super();
  }

  ngOnInit() {
    this.cdRef.detectChanges(); // * Force to update view
  }

  onSearchShipmet(body: any = {}) {
    this.dataSearch = body;
    this._accountingRepo.checkDocumentNoExisted(body)
      .pipe(
        catchError(this.catchError),
        concatMap((rs: any) => {
          if (!rs.status) {
            this._toastService.warning('Document No "' + rs.message + '". Please you check again!');
          }
          return this._accountingRepo.getListShipmentInfo(body);
        })
      ).subscribe((res: any = {}) => {
        if (!!res && res.status === false) {
          this._toastService.error(res.message);
          this.isSubmitted = false;
          return of(false);
        }
        if (!!res) {
          this.combineBillingListDetail.shipments = this.combineBillingListDetail.originShipments.filter((item: any) => 
            res.shipments.map((s: any) => s.refno + s.hblid).indexOf(item.refno + item.hblid) === -1);
          this.combineBillingListDetail.shipments = [...this.combineBillingListDetail.shipments, ...res.shipments];
          this.combineBillingListDetail.originShipments = this.combineBillingListDetail.shipments;
          this.combineBillingListDetail.calculateSumTotal();
        }
      }
      );
  }

  saveBilling() {
    if (!this.combineBillingListDetail.shipments.length) {
      this._toastService.warning(`Can't save empty combine list, Please check it again! `, '');
      return;
    }
    const body = this.getDataForm();

    this._accountingRepo.saveCombineBilling(body)
      .pipe(catchError(this.catchError))
      .subscribe(
        (res: CommonInterface.IResult) => {
          if (res.status) {
            this._toastService.success('Save successfully');

            this._router.navigate([`${RoutingConstants.ACCOUNTING.COMBINE_BILLING}/detail/${res.data.id}`]);
          } else {
            this._toastService.warning(res.message, '', { enableHtml: true });
          }

        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            if (error.error?.data) {
              this._dataService.setData('addNewCombineBilling', error.error);
            }
          }
        }
      );

  }

  getDataForm() {
    const data: CombineBilling = {
      id: "00000000-0000-0000-0000-000000000000",
      combineBillingNo: this.formSearchBillingDetail.billingNo.value,
      partnerId: this.dataSearch.partnerId,
      type: this.dataSearch.type,
      totalAmountVnd: this.combineBillingListDetail.sumTotalObj.totalAmountVnd,
      totalAmountUsd: this.combineBillingListDetail.sumTotalObj.totalAmountUsd,
      description: this.formSearchBillingDetail.description.value,
      services: !!this.dataSearch.service ? this.dataSearch.service.join(';') : null,
      issuedDateFrom: this.formSearchBillingDetail.billingDateType.value == "Issue Date" ? (!this.dataSearch.issuedDateFrom ? null : formatDate(this.dataSearch.issuedDateFrom, 'yyyy-MM-dd', 'en')) : null,
      issuedDateTo: this.formSearchBillingDetail.billingDateType.value == "Issue Date" ? (!this.dataSearch.issuedDateTo ? null : formatDate(this.dataSearch.issuedDateTo, 'yyyy-MM-dd', 'en')) : null,
      serviceDateFrom: this.formSearchBillingDetail.billingDateType.value == "Service Date" ? (!this.dataSearch.serviceDateFrom ? null : formatDate(this.dataSearch.serviceDateFrom, 'yyyy-MM-dd', 'en')) : null,
      serviceDateTo: this.formSearchBillingDetail.billingDateType.value == "Issue Date" ? (!this.dataSearch.serviceDateTo ? null : formatDate(this.dataSearch.serviceDateTo, 'yyyy-MM-dd', 'en')) : null,
      userCreated: null,
      datetimeCreated: null,
      userModified: null,
      datetimeModified: null,
      userCreatedName: null,
      userModifiedName: null,
      shipments: this.combineBillingListDetail.shipments || []
    };
    return data;
  }

  back() {
    this.combineBillingListDetail.shipments = [];
    this.combineBillingListDetail.originShipments = [];
    this._router.navigate([`${RoutingConstants.ACCOUNTING.COMBINE_BILLING}`]);
  }
}

