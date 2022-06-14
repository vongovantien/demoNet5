import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment/moment';
import Highcharts from 'highcharts/highcharts';
import { FormGroup } from '@angular/forms';
import { extend } from 'validator';
import { AppPage } from '../app.base';
import { Shipment } from '../shared/models/operation/shipment';
import { DataService } from '@services';
import { DocumentationRepo } from '@repositories';
import { catchError, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getCurrentUserState } from '@store';
import { Permission403PopupComponent } from '@common';
import { ChargeConstants, RoutingConstants } from '@constants';
// import { Chart } from 'angular-highcharts';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends AppPage implements OnInit {

    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;
    isShow: boolean = false;
    shipments: any[] = [];
    term$ = new BehaviorSubject<string>('');
    selectedShipment: Shipment = null;
    headersShipment: CommonInterface.IHeaderTable[];
    serviceList: CommonInterface.INg2Select[] = [];

    constructor(private _dataService: DataService,
        private _documentRepo: DocumentationRepo,
        private router: Router
    ) {
        super();
        // this.keepCalendarOpeningWithRange = true;
        // this.selectedDate = Date.now();
        // this.selectedRange = { startDate: moment().startOf('month'), endDate: moment().endOf('month') };
    }

    ngOnInit() {
        this.initBasicData();
        // * Search autocomplete shipment.
        this.term$.pipe(
            filter(x => x.length >= 2),
            distinctUntilChanged(),
            this.autocomplete(500, ((keyword: string = '') => {
                if (!!keyword) {
                    this.isShow = true;
                }
                return this._documentRepo.getAllShipment(keyword);
            }))
        ).subscribe(
            (res: any) => {
                this.shipments = res;
            },
        );

        // * Detect close autocomplete when user click outside chargename control or select charge.
        this.$isShowAutoComplete
            .pipe(
                takeUntil(this.ngUnsubscribe),
            )
            .subscribe((isShow: boolean) => {
                this.isShow = isShow;

            });

    }

    initBasicData() {
        this.headersShipment = [
            { title: 'Job ID', field: 'jobNo' },
            { title: 'MBL No', field: 'mblNo' },
            { title: 'HBL No', field: 'hwbNo' },
            { title: 'Service', field: 'productService' },
            { title: 'Shipper', field: 'shipper' },
            { title: 'Consignee', field: 'consignee' },
            { title: 'Person In Charge', field: 'personInCharge' },
            { title: 'Sales Man', field: 'saleMan' },
            { title: 'Service Date', field: 'serviceDate' },
            { title: 'Create Date', field: 'datetimeCreated' },
            { title: 'Modified Date', field: 'datetimeModified' },
        ];

    }

    onSearchAutoComplete(keyword: string = '') {
        this.term$.next(keyword);
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'shipment':
                this._isShowAutoComplete.next(false);
                this.selectedShipment = new Shipment(data);
                this.checkPermission(data.service, data.id, data.productService);
                break;
            default:
                break;


        }
    }

    checkPermission(service: string, shipmentId: string, productService: string) {
        if (service === 'OPS') {
            this._documentRepo.checkViewDetailPermission(shipmentId)
                .subscribe(
                    (res: boolean) => {
                        if (res) {
                            this.gotoActionLink(productService);
                        } else {
                            this.permissionPopup.show();
                        }
                    }
                )
        }
        else if (service === 'CS') {
            this._documentRepo.checkDetailShippmentPermission(shipmentId)
                .subscribe(
                    (res: boolean) => {
                        if (res) {
                            this.gotoActionLink(productService);
                        } else {
                            this.permissionPopup.show();
                        }
                    }
                )
        }
    }

    gotoActionLink(service: string) {
        switch (service) {
            case ChargeConstants.AE_CODE:
                //return this.router.navigate([`home/documentation/air-export/${this.selectedShipment.id}`]);
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_EXPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.AI_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.IT_CODE:
                return this.router.navigate([`${RoutingConstants.LOGISTICS.TRUCKING_ASSIGNMENT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SCE_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_EXPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SCI_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SFE_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_EXPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SFI_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_IMPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SLE_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_EXPORT}/${this.selectedShipment.id}`]);
            case ChargeConstants.SLI_CODE:
                return this.router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_LCL_IMPORT}/${this.selectedShipment.id}`]);
            default:
                return this.router.navigate([`${RoutingConstants.LOGISTICS.JOB_DETAIL}/${this.selectedShipment.id}`]);
        }
    }
    /**
     * Daterange picker
     */
    // selectedRange: any;
    // selectedDate: any;
    // keepCalendarOpeningWithRange: true;
    // maxDate: moment.Moment = moment();
    // ranges: any = {
    //     Today: [moment(), moment()],
    //     Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    //     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    //     'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    //     'This Month': [moment().startOf('month'), moment().endOf('month')],
    //     'Last Month': [
    //         moment()
    //             .subtract(1, 'month')
    //             .startOf('month'),
    //         moment()
    //             .subtract(1, 'month')
    //             .endOf('month')
    //     ]
    // };

    // //add active to button-group
    onButtonGroupClick($event) {
        let clickedElement = $event.target || $event.srcElement;

        if (clickedElement.nodeName === "BUTTON") {

            let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
            // if a Button already has Class: .active
            if (isCertainButtonAlreadyActive) {
                isCertainButtonAlreadyActive.classList.remove("active");
            }

            clickedElement.className += " active";
        }

    }



    onClickOutsideShipmentName() {
        this._isShowAutoComplete.next(false);
    }
    //https://www.npmjs.com/package/angular-highcharts
    // chart: Chart;

    // //draw chart by month
    // init() {
    //     let chart = new Chart({
    //         chart: {
    //             marginLeft: 40, // Keep all charts left aligned
    //             spacingTop: 20,
    //             spacingBottom: 20,
    //             className: 'chart-sync-revenue'
    //         },
    //         title: {
    //             text: 'Revenue',
    //             align: 'left',
    //             margin: 0,
    //             x: 30
    //         },
    //         credits: {
    //             enabled: false
    //         },
    //         legend: {
    //             enabled: true,
    //             verticalAlign: 'top',
    //             y: 0
    //         },
    //         xAxis: {
    //             type: 'datetime'
    //         },
    //         yAxis: {
    //             title: {
    //                 text: null
    //             }
    //         },
    //         series: [
    //             {
    //                 type: 'line',
    //                 color: '#ffb822',
    //                 data: [
    //                     [Date.UTC(2010, 0, 1), 29.9],
    //                     [Date.UTC(2010, 2, 1), 71.5],
    //                     [Date.UTC(2010, 3, 1), 106.4]
    //                 ],
    //                 name: "USD"
    //             },
    //             {
    //                 type: 'line',
    //                 color: "#c9cdd4",
    //                 data: [
    //                     [Date.UTC(2010, 0, 1), 29.9],
    //                     [Date.UTC(2010, 2, 1), 71.5],
    //                     [Date.UTC(2010, 3, 1), 106.4]
    //                 ],
    //                 name: "VND"
    //             }
    //         ]
    //     });
    //     this.chart = chart;
    // }
    // //draw chart by day
    // chartPerDay() {
    //     this.chart.removeSeries(this.chart.ref.series.length - 1);
    // }


    // highchart
    // https://www.npmjs.com/package/highcharts-angular
    Highcharts = Highcharts;
    chartOptions1 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: 'chart-sync-revenue'
        },
        title: {
            text: 'Revenue',
            align: 'left',
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== 'syncExtremes') {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: 'syncExtremes'
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // titles: {
            //     format: '{value}'
            // }
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.title.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: '#ffb822',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "USD"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "VND"
            }
        ]
    };

    chartOptions2 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: "chart-sync-volume"
        },
        title: {
            text: "Volume",
            align: "left",
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== "syncExtremes") {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: "syncExtremes"
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // titles: {
            //     format: "{value}"
            // }
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.title.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: "#3966b6",
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "Shipment"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "HBL"
            }
        ]
    };

    chartOptions3 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: "chart-sync-weight"
        },
        title: {
            text: "Weight",
            align: "left",
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== "syncExtremes") {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: "syncExtremes"
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // titles: {
            //     format: "{value}"
            // }
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.title.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: "#41bfa3",
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "KG"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "CBM"
            }
        ]
    };

}
