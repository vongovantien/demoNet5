import { Component, ViewChild } from '@angular/core';
import { AppList } from "src/app/app.list";
import { ReportPreviewComponent } from "@common";
import { CommonEnum } from "@enums";
import { ICrystalReport, ReportInterface } from "@interfaces";
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { ExportRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { SystemConstants } from '@constants';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-commission-incentive-report',
  templateUrl: './commission-incentive-report.component.html'
})
export class CommissionIncentiveReportComponent extends AppList implements ICrystalReport {
  @ViewChild(ReportPreviewComponent) reportPopup: ReportPreviewComponent;
  shipmentInput: OperationInteface.IInputShipment;
  numberOfShipment: number = 0;

  constructor(
    private _progressService: NgProgress,
    private _toastService: ToastrService,
    private _exportRepo: ExportRepo,
  ) {
    super();
    this._progressRef = this._progressService.ref();
  }

  showReport(): void {
    this.reportPopup.frm.nativeElement.submit();
    this.reportPopup.show();
  }

  ngOnInit() {
  }

  onSearchSaleReport(data: ReportInterface.ICommissionReportCriteria) {
    console.log(data);
    switch (data.typeReport) {
      case CommonEnum.COMMISSION_INCENTIVE_TYPE.COMMISSION_PR_AS:
        this.previewComPRReport(data);
        break;
      case CommonEnum.COMMISSION_INCENTIVE_TYPE.COMMISSION_PR_OPS:
        this.previewComPROpsReport(data);
        break;
      case CommonEnum.COMMISSION_INCENTIVE_TYPE.INCENTIVE_RPT:
        this.previewIncentiveReport(data);
        break;
    }
  }

  previewComPRReport(data: ReportInterface.ICommissionReportCriteria) {
    this._progressRef.start();
    const currentUser: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    this._exportRepo.exportCommissionPRReport(data, currentUser.id, "Services")
        .pipe(
            catchError(this.catchError),
            finalize(() => this._progressRef.complete())
        )
        .subscribe(
            (response: ArrayBuffer) => {
              if (response.byteLength > 0) {
                const fileName = "Commission PR.xlsx";
                this.downLoadFile(response, SystemConstants.FILE_EXCEL, fileName);
              } else {
                this._toastService.warning("No data to download. Please try again.");
              }
            },
        );
}

  previewComPROpsReport(data: ReportInterface.ICommissionReportCriteria) {
        this._progressRef.start();
        const currentUser: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this._exportRepo.exportCommissionPRReport(data, currentUser.id, "OPS")
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                  if (response.byteLength > 0) {
                    const fileName = "Commission OPS VND.xlsx";
                    this.downLoadFile(response, SystemConstants.FILE_EXCEL, fileName);
                  } else {
                    this._toastService.warning("No data to download. Please try again.");
                  }
                },
            );
  }

  previewIncentiveReport(data: ReportInterface.ICommissionReportCriteria) {
    this._progressRef.start();
    const currentUser: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    this._exportRepo.exportIncentiveReport(data, currentUser.id)
        .pipe(
            catchError(this.catchError),
            finalize(() => this._progressRef.complete())
        )
        .subscribe(
            (response: HttpResponse<any>) => {
              if (response!=null) {
                this.downLoadFile(response, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
              } else {
                this._toastService.warning("No data to download. Please try again.");
              }
            },
        );
}

  onShipmentList(data: any) {
    this.shipmentInput = data;
    if (data) {
      this.numberOfShipment = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).length;
    } else {
      this.numberOfShipment = 0;
    }
  }
}
