import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ButtonModalSetting } from 'src/app/shared/models/layout/button-modal-setting.model';
import { ButtonType } from 'src/app/shared/enums/type-button.enum';
import { NgProgress } from '@ngx-progressbar/core';
import { AppList } from 'src/app/app.list';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { SortService } from 'src/app/shared/services';
import { formatDate } from '@angular/common';
import { Crystal } from 'src/app/shared/models/report/crystal.model';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { ToastrService } from 'ngx-toastr';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ShareBusinessFormManifestComponent } from 'src/app/business-modules/share-business/components/manifest/form-manifest/components/form-manifest.component';
import { ShareBusinessAddHblToManifestComponent } from 'src/app/business-modules/share-business/components/manifest/popup/add-hbl-to-manifest.popup';
import { CommonEnum } from '@enums';
import { getTransactionLocked, getTransactionPermission, TransactionGetDetailAction } from '@share-bussiness';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-sea-consol-import-manifest',
    templateUrl: './sea-consol-import-manifest.component.html'
})
export class SeaConsolImportManifestComponent extends AppList {
    @ViewChild(ConfirmPopupComponent) confirmCreatePopup: ConfirmPopupComponent;

    @ViewChild(ShareBusinessFormManifestComponent) formManifest: ShareBusinessFormManifestComponent;
    @ViewChild(ReportPreviewComponent) reportPopup: ReportPreviewComponent;
    @ViewChild(ShareBusinessAddHblToManifestComponent) AddHblToManifestPopup: ShareBusinessAddHblToManifestComponent;
    housebills: any[] = [];
    housebillsRoot: any[] = [];
    housebillsChange: any[] = [];
    manifest: any = {};
    saveButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.save
    };
    portType: CommonEnum.PORT_TYPE = CommonEnum.PORT_TYPE.SEA;
    cancelButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.cancel
    };
    jobId: string = '';
    headers: CommonInterface.IHeaderTable[];
    checkAll = false;
    totalGW = 0;
    totalCBM = 0;
    fistOpen: boolean = true;
    dataReport: Crystal;

    //
    displayPreview: boolean = false;

    constructor(
        protected _store: Store<any>,
        private _progressService: NgProgress,
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        protected _router: Router,
        private cdRef: ChangeDetectorRef,
        private _activedRoute: ActivatedRoute

    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'HBL No', field: 'hwbNo', sortable: true, width: 100 },
            { title: 'No of Pieces', field: 'packageContainer', sortable: true },
            { title: 'G.W', field: 'grossWeight', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Destination', field: 'podName', sortable: true },
            { title: 'Shipper', field: 'shipperName', sortable: true },
            { title: 'Consignee', field: 'consignee', sortable: true },
            { title: 'Description', field: 'desOfGoods', sortable: true },
            { title: 'Freight Charge', field: '', sortable: true },

        ];

        this.isLocked = this._store.select(getTransactionLocked);
        this.permissionShipments = this._store.select(getTransactionPermission);

    }
    ngAfterViewInit() {
        this._activedRoute.params
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((param: Params) => {
                if (param.jobId) {
                    this.formManifest.isImport = true;
                    this.jobId = param.jobId;
                    this.formManifest.jobId = this.jobId;
                    this._store.dispatch(new TransactionGetDetailAction(this.jobId));

                    this.getHblList(this.jobId);
                    this.getManifest(this.jobId);
                    this.cdRef.detectChanges();

                }
            });
    }

    showPopupAddHbl() {
        this.AddHblToManifestPopup.show();
    }

    removeAllChecked() {

        this.checkAll = false;
    }

    refreshManifest() {
        //this.getManifest(this.jobId);
        this.formManifest.getShipmentDetail();
        this.getHblList(this.jobId);
    }

    onRefresh() {
        this.confirmCreatePopup.hide();
        this.refreshManifest();
        this.displayPreview = false;
    }

    showRefreshPopup() {
        this.confirmCreatePopup.show();
    }

    combackToHBLList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`]);
    }


    getTotalWeight() {
        this.totalCBM = 0;
        this.totalGW = 0;
        this.housebills.forEach(x => {
            if (x.isRemoved === false) {
                this.totalGW = this.totalGW + x.gw;
                this.totalCBM = this.totalCBM + x.cbm;
            }
        });
        this.manifest.weight = this.totalGW;
        this.manifest.volume = this.totalCBM;
        this.formManifest.volume.setValue(this.manifest.volume);
        this.formManifest.weight.setValue(this.manifest.weight);

    }

    getManifest(id: string) {
        this._documentationRepo.getManifest(id).subscribe(
            (res: any) => {
                if (!!res) {
                    this.displayPreview = true;
                    this.manifest = res;
                    this.formManifest.updateDataToForm(this.manifest);
                }
                else {
                    this.displayPreview = false;
                    this.formManifest.getShipmentDetail();
                }
            }
        );
    }

    addOrUpdateManifest() {
        this.formManifest.isSubmitted = true;
        if (this.formManifest.formGroup.valid) {
            this._progressRef.start();
            const body: any = {
                jobId: this.jobId,
                refNo: this.formManifest.referenceNo.value,
                supplier: this.formManifest.supplier.value,
                attention: this.formManifest.attention.value,
                masksOfRegistration: this.formManifest.marksOfNationality.value,
                voyNo: this.formManifest.vesselNo.value,
                invoiceDate: !!this.formManifest.date.value && this.formManifest.date.value.startDate != null ? formatDate(this.formManifest.date.value.startDate !== undefined ? this.formManifest.date.value.startDate : this.formManifest.date.value, 'yyyy-MM-dd', 'en') : null,
                pol: this.formManifest.pol.value,
                pod: this.formManifest.pod.value,
                paymentTerm: this.formManifest.freightCharge.value,
                consolidator: this.formManifest.consolidator.value,
                deConsolidator: this.formManifest.deconsolidator.value,
                volume: this.formManifest.volume.value,
                weight: this.formManifest.weight.value,
                manifestIssuer: this.formManifest.agent.value,
                csTransactionDetails: this.housebills
            };
            this._documentationRepo.AddOrUpdateManifest(body)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this.getManifest(this.jobId);
                            this.getHblList(this.jobId);
                            this.displayPreview = true;
                        } else {
                            this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                        }
                    }
                );

        }
    }

    checkIsChecked() {
        let isChecked = false;
        isChecked = this.housebills.find(t => t.isChecked === true);
        if (!isChecked) {
            return false;
        }
        return true;
    }

    onRemove() {
        if (this.checkIsChecked() === false) {
            return;
        }
        this.housebills.forEach(x => {
            if (x.isChecked) {
                x.isRemoved = true;
                x.isChecked = false;
                x.manifestRefNo = null;
            }
        });
        this.getTotalWeight();
        this.AddHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
        this.AddHblToManifestPopup.checkAll = false;
    }

    onAdd() {
        if (this.checkIsChecked() === false) {
            return;
        }
        this.housebills.forEach(x => {
            if (x.isChecked) {
                x.isRemoved = false;
                x.isChecked = false;
            }
        });
        this.getTotalWeight();
        this.AddHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
    }

    checkAllChange() {
        if (this.checkAll) {
            this.housebills.forEach(x => {
                x.isChecked = true;
            });
        } else {
            this.housebills.forEach(x => {
                x.isChecked = false;
            });
        }
    }

    sortHouseBills(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.housebills = this._sortService.sort(this.housebills, sortData.sortField, sortData.order);
        }
    }

    getHblList(jobId: string) {
        this._progressRef.start();
        this._documentationRepo.getListHouseBillOfJob({ jobId: jobId })
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                })
            ).subscribe(
                (res: any) => {
                    this.AddHblToManifestPopup.houseBills = this.housebills;

                    (res || []).forEach((element: { isChecked: boolean; isRemoved: boolean }) => {
                        element.isChecked = false;
                        if (element["manifestRefNo"] == null) {
                            element.isRemoved = true;
                        } else {
                            element.isRemoved = false;
                        }
                    });
                    this.housebills = res || [];
                    const hasHbl = this.housebills.some(element => element.isRemoved === false);
                    if (!hasHbl) {
                        this.housebills.forEach(element => {
                            element.isRemoved = false;
                        });
                    }
                    console.log(hasHbl);
                    this.AddHblToManifestPopup.houseBills = this.housebills.filter(x => x.isRemoved === true);
                },
            );
    }
    previewManifest() {
        if (this.formManifest.referenceNo.value === null) {
            this._toastService.warning('There is no data to display preview');
            return;
        }
        const body: any = {
            jobId: this.jobId,
            refNo: this.formManifest.referenceNo.value,
            supplier: this.formManifest.supplier.value,
            attention: this.formManifest.attention.value,
            masksOfRegistration: this.formManifest.marksOfNationality.value,
            voyNo: this.formManifest.vesselNo.value,
            invoiceDate: !!this.formManifest.date.value && this.formManifest.date.value.startDate != null ? formatDate(this.formManifest.date.value.startDate !== undefined ? this.formManifest.date.value.startDate : this.formManifest.date.value, 'yyyy-MM-dd', 'en') : null,
            pol: this.formManifest.pol.value,
            pod: this.formManifest.pod.value,
            paymentTerm: this.formManifest.freightCharge.value,
            consolidator: this.formManifest.consolidator.value,
            deConsolidator: this.formManifest.deconsolidator.value,
            volume: this.formManifest.volume.value,
            weight: this.formManifest.weight.value,
            manifestIssuer: this.formManifest.agent.value,
            csTransactionDetails: this.housebills.filter(x => x.isRemoved === false)
        };
        this._documentationRepo.previewSeaImportManifest(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            setTimeout(() => {
                                this.reportPopup.frm.nativeElement.submit();
                                this.reportPopup.show();
                            }, 1000);
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    } else {
                        this._toastService.warning('There is no container data to display preview');
                    }
                },
            );
    }
}


