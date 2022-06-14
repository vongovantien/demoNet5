import { formatDate } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppForm } from '@app';
import { ReportPreviewComponent } from '@common';
import { JobConstants, RoutingConstants, SystemConstants } from '@constants';
import { Partner } from '@models';
import { NgProgress } from '@ngx-progressbar/core';
import { AccountingRepo, ExportRepo } from '@repositories';
import { DataService } from '@services';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, concatMap, finalize, pluck, takeUntil } from 'rxjs/operators';
import { CombineBilling } from 'src/app/shared/models/accouting/combine-billing.model';
import { isUUID } from 'validator';
import { FormGetBillingListComponent } from '../components/form-get-billing-list/form-get-billing-list.component';
import { CombineBillingListComponent } from '../components/combine-billing-list/combine-billing-list.component';
import { delayTime } from '@decorators';

@Component({
  selector: 'detail-combine-billing',
  templateUrl: './detail-combine-billing.component.html'
})
export class DetailCombineBillingComponent extends AppForm implements OnInit {
  @ViewChild(FormGetBillingListComponent) formSearchBillingDetail: FormGetBillingListComponent;
  @ViewChild(CombineBillingListComponent) combineBillingListDetail: CombineBillingListComponent;
  @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;

  billingTypeList: string[] = ['Debit', 'Credit'];
  typeDateSearch: string[] = ['Issue Date', 'Invoice Date'];
  serviceList: any[] = [];
  documentTypes: string[] = ['CD Note', 'Soa', 'Job No', 'HBL No', 'Custom No'];
  displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
  partners: Partner[] = [];
  isUpdate: boolean = false;
  billing: any = null;
  billingId: string = '';
  dataSearch: any = {};
  detailCombine: CombineBilling;

  constructor(
    protected _router: Router,
    protected _toastService: ToastrService,
    protected _accountingRepo: AccountingRepo,
    private _activedRoute: ActivatedRoute,
    private _ngProgressService: NgProgress,
    private _dataService: DataService,
    private _exportRepo: ExportRepo,

  ) {
    super();
    this._progressRef = this._ngProgressService.ref();
  }

  ngOnInit() {
    this._activedRoute.params
      .pipe(pluck('id'))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((id: any) => {
        if (!!id && isUUID(id)) {
          this.billingId = id;
          this.getDetailCombineDetail(this.billingId)
        }
      });
  }

  getDetailCombineDetail(id: string) {
    this._progressRef.start();
    this.isLoading = true;
    this._accountingRepo.getDetailByCombineId(id)
      .pipe(
        catchError(this.catchError),
        finalize(() => { this._progressRef.complete(); this.isLoading = false; })
      )
      .subscribe(
        (res: any) => {
          if (!res) {
            this.back();
            this._toastService.error(res.message);
          } else {
            var combine = new CombineBilling(res);
            this.detailCombine = combine;
            console.log('map', combine)
            this.formSearchBillingDetail.formGroup.patchValue({
              billingNo: combine.combineBillingNo,
              partnerId: combine.partnerId,
              billingType: combine.type === '' || !combine.type ? 'All' : combine.type,
              billingDateType: !!combine.serviceDateFrom ? 'Service Date' : 'Issue Date',
              billingDate: !!combine?.issuedDateFrom ?
                { startDate: new Date(combine?.issuedDateFrom), endDate: new Date(combine?.issuedDateTo) } :
                (!!combine?.serviceDateFrom ? { startDate: new Date(combine?.serviceDateFrom), endDate: new Date(combine?.serviceDateTo) }
                  : null),
              service: (!combine.services || combine.services === '') ? ['All'] : this.getCurrentActiveService(combine.services),
              documentType: 'CD Note',
              referenceNo: null,
              description: combine.description
            });
            this.formSearchBillingDetail.billing = combine;

            this.combineBillingListDetail.originShipments = combine.shipments;
            this.combineBillingListDetail.shipments = combine.shipments;
            this.combineBillingListDetail.calculateSumTotal();
          }

        },
      );
  }

  getCurrentActiveService(Service: any) {
    const listService = Service.split(";");
    let activeServiceList: any = [];
    listService.forEach(item => {
      const element = this.formSearchBillingDetail.serviceList.find(x => x.id === item.trim());
      if (element !== undefined) {
        const activeService = item.trim();
        activeServiceList = [...activeServiceList, activeService];
      }
    });
    return activeServiceList;
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
    this._accountingRepo.updateCombineBilling(body)
      .pipe(catchError(this.catchError))
      .subscribe(
        (res: CommonInterface.IResult) => {
          if (res.status) {
            this._toastService.success('Save successfully');
            this.detailCombine = res.data;
            this.combineBillingListDetail.originShipments = res.data.shipments;
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
    let type = this.formSearchBillingDetail.getTypeData(this.formSearchBillingDetail.billingType.value);
    let service = this.formSearchBillingDetail.getServiceData(this.formSearchBillingDetail.service.value);
    const data: CombineBilling = {
      id: this.billingId,
      combineBillingNo: this.formSearchBillingDetail.billingNo.value,
      partnerId: this.formSearchBillingDetail.partnerId.value,
      type: !!type ? type : null,
      totalAmountVnd: this.combineBillingListDetail.sumTotalObj.totalAmountVnd,
      totalAmountUsd: this.combineBillingListDetail.sumTotalObj.totalAmountUsd,
      description: this.formSearchBillingDetail.description.value,
      services: !!service ? service.join(';') : null,
      issuedDateFrom: this.formSearchBillingDetail.billingDateType.value == "Issue Date" ?
        (!this.formSearchBillingDetail.billingDate.value || !this.formSearchBillingDetail.billingDate.value.startDate ? null : formatDate(this.formSearchBillingDetail.billingDate.value.startDate, 'yyyy-MM-dd', 'en')) : null,
      issuedDateTo: this.formSearchBillingDetail.billingDateType.value == "Issue Date" ?
        (!this.formSearchBillingDetail.billingDate.value || !this.formSearchBillingDetail.billingDate.value.endDate ? null : formatDate(this.formSearchBillingDetail.billingDate.value.endDate, 'yyyy-MM-dd', 'en')) : null,
      serviceDateFrom: this.formSearchBillingDetail.billingDateType.value == "Service Date" ?
        (!this.formSearchBillingDetail.billingDate.value || !this.formSearchBillingDetail.billingDate.value.startDate ? null : formatDate(this.formSearchBillingDetail.billingDate.value.startDate, 'yyyy-MM-dd', 'en')) : null,
      serviceDateTo: this.formSearchBillingDetail.billingDateType.value == "Service Date" ?
        (!this.formSearchBillingDetail.billingDate.value || !this.formSearchBillingDetail.billingDate.value.endDate ? null : formatDate(this.formSearchBillingDetail.billingDate.value.endDate, 'yyyy-MM-dd', 'en')) : null,
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
    this._router.navigate([`${RoutingConstants.ACCOUNTING.COMBINE_BILLING}`]);
  }

  @delayTime(1000)
  showReport(): void {
    this.componentRef.instance.frm.nativeElement.submit();
    this.componentRef.instance.show();
  }

  print() {

  }

  previewDebitTemplate() {
    this._accountingRepo.previewCombineDebitTemplate(this.detailCombine)
      .pipe(catchError(this.catchError))
      .subscribe(
        (res: any) => {
          this.dataReport = res;
          if (this.dataReport != null && res.dataSource.length > 0) {
            setTimeout(() => {
              this.previewPopup.frm.nativeElement.submit();
              this.previewPopup.show();
            }, 1000);
          } else {
            this._toastService.warning('There is no data to display preview');
          }

        },
      );
  }

  exportCombineOps() {
    this._progressRef.start();
    let criteriaExport: any = {
      referenceNo: []
    };
    criteriaExport.referenceNo.push(this.detailCombine.combineBillingNo);
    this._exportRepo.exportCombineOps(criteriaExport)
      .pipe(
        catchError(this.catchError),
        finalize(() => this._progressRef.complete())
      )
      .subscribe(
        (response: HttpResponse<any>) => {
          if (response!=null) {
            this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
          } else {
            this._toastService.warning('No data found');
          }
        },
      );
  }

  previewConfirmBilling() {
    this._progressRef.start();
    this._accountingRepo.previewConfirmBilling(this.detailCombine.combineBillingNo)
      .pipe(
        catchError(this.catchError),
        finalize(() => this._progressRef.complete()),
      )
      .subscribe(
        (res: any) => {
          this.dataReport = res;
          if (this.dataReport != null && res.dataSource.length > 0) {
            setTimeout(() => {
              this.previewPopup.frm.nativeElement.submit();
              this.previewPopup.show();
            }, 1000);
          } else {
            this._toastService.warning('There is no data to display preview');
          }
        },
      );
  }
}
