import { AppList } from "src/app/app.list";
import { Component, ViewChild } from "@angular/core";
import { SortService } from "@services";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { DocumentationRepo, ExportRepo } from "@repositories";
import { catchError, finalize, map } from "rxjs/operators";
import { LoadingPopupComponent } from "@common";
import { NgxSpinnerService } from "ngx-spinner";
import { SystemConstants } from "@constants";
import { of } from "rxjs";
import { HttpResponse } from "@angular/common/http";

@Component({
    selector: 'app-general-report',
    templateUrl: './general-report.component.html',
})
export class GeneralReportComponent extends AppList {
    @ViewChild(LoadingPopupComponent) loadingPopupComponent: LoadingPopupComponent;
    headers: CommonInterface.IHeaderTable[];
    dataList: any[] = [];
    isClickSubMenu: boolean = false;


    constructor(
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _exportRepo: ExportRepo,
        private _spinner: NgxSpinnerService

    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchGeneralReport;
        this.requestSort = this.sortGeneralReport;
    }

    ngOnInit() {
        this.headers = [
            { title: 'No.', field: 'no', sortable: true },
            { title: 'Job ID', field: 'jobId', sortable: true },
            { title: 'MBL/MAWB', field: 'mawb', sortable: true },
            { title: 'HBL/HAWB', field: 'hawb', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Carrier', field: 'carrierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'Service Date', field: 'serviceDate', sortable: true },
            { title: 'Route', field: 'route', sortable: true },
            { title: 'Qty', field: 'qty', sortable: true },
            { title: 'CW', field: 'chargeWeight', sortable: true },
            { title: 'Revenue', field: 'revenue', sortable: true },
            { title: 'Cost', field: 'cost', sortable: true },
            { title: 'Profit', field: 'profit', sortable: true },
            { title: 'OBH', field: 'obh', sortable: true },
            { title: 'P.I.C', field: 'personInCharge', sortable: true },
            { title: 'Salesman', field: 'salesman', sortable: true },
            { title: 'Service', field: 'serviceName', sortable: true },
        ];
    }

    onSearchGeneralReport(data: any) {
        this.page = 1; // reset page.        
        if (Object.keys(data).length !== 0) {
            this.dataSearch = data;
            this.searchGeneralReport();
        } else {
            this.dataList = [];
            this.totalItems = 0;
        }
    }

    searchGeneralReport() {
        console.log(this.dataSearch);
        this._progressRef.start();
        this._documentRepo.getGeneralReport(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(()=> of(this.loadingPopupComponent.downloadFail())),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data,
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.dataList = res.data;
                },
            );
    }

    sortGeneralReport(sort: string): void {
        this.dataList = this._sortService.sort(this.dataList, sort, this.order);
    }

    startDownloadReport(data: any, fileName: string){
        if(data.byteLength > 0){
            this.downLoadFile(data, SystemConstants.FILE_EXCEL, fileName);
            this.loadingPopupComponent.downloadSuccess();
        }else{
            this.loadingPopupComponent.downloadFail();
        }
    }
    
    exportShipmentOverview() {
        if (this.dataList.length === 0) {
            this._toastService.warning('No Data To View, Please Re-Apply Report');
            return;
        } else {
            this.isClickSubMenu = false;
            this._spinner.hide();
            this.loadingPopupComponent.show();
            this._exportRepo.exportShipmentOverview(this.dataSearch)
                .pipe(
                    catchError(()=> of(this.loadingPopupComponent.downloadFail())),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (response: HttpResponse<any>) => {
                        this.startDownloadReport(response.body, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    },
                );
        }
    }

    exportShipmentOverviewWithType(reportType: string) {
        if (this.dataList.length === 0) {
            this._toastService.warning('No Data To View, Please Re-Apply Report');
            return;
        } else {
            this.isClickSubMenu = false;
            this._spinner.hide();
            this.loadingPopupComponent.show();
            this._exportRepo.exportShipmentOverviewWithType(this.dataSearch, reportType)
                .pipe(
                    catchError(()=> of(this.loadingPopupComponent.downloadFail())),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (response: HttpResponse<any>) => {
                        this.startDownloadReport(response.body, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    },
                );
        }
    }

    exportStandard() {
        if (this.dataList.length === 0) {
            this._toastService.warning('No Data To View, Please Re-Apply Report');
            return;
        } else {
            this.isClickSubMenu = false;
            this._spinner.hide();
            this.loadingPopupComponent.show();
            this._exportRepo.exportStandardGeneralReport(this.dataSearch)
                .pipe(
                    catchError(()=> of(this.loadingPopupComponent.downloadFail())),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (response: HttpResponse<any>) => {
                        this.startDownloadReport(response.body, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    },
                );
        }
    }
}