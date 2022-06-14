import { AppList } from "src/app/app.list";
import { Component, ViewChild } from "@angular/core";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { ReportManagementRepo } from "@repositories";
import { catchError, finalize } from "rxjs/operators";
import { ReportPreviewComponent } from "@common";
import { CommonEnum } from "@enums";
import { NgxSpinnerService } from "ngx-spinner";
import { delayTime } from "@decorators";
import { ICrystalReport, ReportInterface } from "@interfaces";

@Component({
    selector: 'app-sale-report',
    templateUrl: './sale-report.component.html',
})
export class SaleReportComponent extends AppList implements ICrystalReport {
    @ViewChild(ReportPreviewComponent) reportPopup: ReportPreviewComponent;


    constructor(
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _reportRepo: ReportManagementRepo,
        private _spinnerService: NgxSpinnerService
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }


    ngOnInit() {
    }

    @delayTime(1000)
    showReport(): void {
        this.reportPopup.frm.nativeElement.submit();
        this.reportPopup.show();
    }

    onSearchSaleReport(data: ReportInterface.ISaleReportCriteria) {
        switch (data.typeReport) {
            case CommonEnum.SALE_REPORT_TYPE.SR_MONTHLY:
                this.previewMonthlyReport(data);
                break;
            case CommonEnum.SALE_REPORT_TYPE.SR_DEPARTMENT:
                this.previewDepartmentReport(data);
                break;
            case CommonEnum.SALE_REPORT_TYPE.SR_QUARTER:
                this.previewQuaterReport(data);
                break;
            case CommonEnum.SALE_REPORT_TYPE.SR_SUMMARY:
                this.previewSummaryReport(data);
                break;
            case CommonEnum.SALE_REPORT_TYPE.SR_COMBINATION:
                this.previewCombinationStatictisReport(data);
                break;
            case CommonEnum.SALE_REPORT_TYPE.SR_KICKBACK:
                this.previewSaleKickBackReport(data);
                break;
        }
    }
    previewMonthlyReport(data: ReportInterface.ISaleReportCriteria) {
        this._reportRepo.previewSaleMonthlyReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    previewQuaterReport(data: ReportInterface.ISaleReportCriteria) {
        this._spinnerService.show();
        this._reportRepo.previewSaleQuaterReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    previewDepartmentReport(data: ReportInterface.ISaleReportCriteria) {
        this._spinnerService.show();
        this._reportRepo.previewSaleDepartmentReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    previewSummaryReport(data: ReportInterface.ISaleReportCriteria) {
        this._spinnerService.show();
        this._reportRepo.previewSaleSummaryReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    previewCombinationStatictisReport(data: ReportInterface.ISaleReportCriteria) {
        this._spinnerService.show();
        this._reportRepo.previewCombinationSalesReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    previewSaleKickBackReport(data: ReportInterface.ISaleReportCriteria) {
        this._spinnerService.show();
        this._reportRepo.previewSaleKickBackReport(data)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._spinnerService.hide(); })
            )
            .subscribe(
                (res: any) => {
                    if (res != null && res.dataSource.length > 0) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        }
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }
}