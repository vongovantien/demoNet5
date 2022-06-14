import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

import { ReportPreviewComponent } from '@common';
import { DocumentationRepo } from '@repositories';
import { SystemConstants } from '@constants';
import { CsTransaction, CsShippingInstruction } from '@models';

import {
    ShareBussinessBillInstructionHousebillsSeaExportComponent,
    getTransactionPermission,
    getTransactionLocked,
    TransactionActions,
    TransactionGetDetailAction,
    getTransactionDetailCsTransactionState
} from '@share-bussiness';
import { AppList } from '@app';
import { delayTime } from '@decorators';
import { ICrystalReport } from '@interfaces';

import { ShareSeaServiceFormSISeaExportComponent } from '../../../share-sea/components/form-si-sea-export/form-si-sea-export.component';

import _groupBy from 'lodash/groupBy';
import { catchError, finalize, takeUntil, take, pluck, concatMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';


@Component({
    selector: 'app-sea-consol-export-si',
    templateUrl: './sea-consol-si.component.html'
})
export class SeaConsolExportShippingInstructionComponent extends AppList implements ICrystalReport {
    @ViewChild(ShareBussinessBillInstructionHousebillsSeaExportComponent) billDetail: ShareBussinessBillInstructionHousebillsSeaExportComponent;
    @ViewChild(ReportPreviewComponent) previewPopup: ReportPreviewComponent;
    @ViewChild(ShareSeaServiceFormSISeaExportComponent) billSIComponent: ShareSeaServiceFormSISeaExportComponent;

    jobId: string;
    houseBills: any[] = [];

    displayPreview: boolean = false;

    constructor(private _store: Store<TransactionActions>,
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _activedRouter: ActivatedRoute,
    ) {
        super();
    }

    ngOnInit() {
        this.permissionShipments = this._store.select(getTransactionPermission);
        this.isLocked = this._store.select(getTransactionLocked);
    }

    ngAfterViewInit() {
        this._activedRouter.params
            .pipe(
                pluck('jobId'),
                concatMap((jobId) => {
                    this.jobId = jobId;
                    this._store.dispatch(new TransactionGetDetailAction(this.jobId));
                    return forkJoin([
                        this._documentRepo.getListHouseBillOfJob({ jobId: this.jobId }),
                        this._documentRepo.getShippingInstruction(jobId)
                    ]);
                })
            ).subscribe(
                (res) => {
                    if (!!res) {
                        if (!!res[0]) {
                            this.billDetail.housebills = this.houseBills = res[0] || [];
                        }
                        this.displayPreview = !!res[1];
                        this.setDataBillInstructionComponent(res[1]);
                    }
                }
            );
    }

    getBillingInstruction(jobId: string) {
        this._documentRepo.getShippingInstruction(jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.displayPreview = !!res;
                    this.setDataBillInstructionComponent(res);
                },
            );
    }

    setDataBillInstructionComponent(data: any) {
        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe(
                (res) => {
                    if (!!res) {
                        if (data != null) {
                            this.billSIComponent.shippingInstruction = data;
                            this.billSIComponent.shippingInstruction.refNo = res.jobNo;
                        } else {
                            this.initNewShippingInstruction(res);
                            if (this.billSIComponent.type === "fcl") {
                                this.calculateGoodInfo();
                            }
                        }

                        this.billSIComponent.shippingInstruction.csTransactionDetails = this.houseBills;
                        this.billSIComponent.setformValue(this.billSIComponent.shippingInstruction);
                    }
                }
            );
    }

    calculateGoodInfo() {
        if (this.houseBills != null) {
            // let desOfGoods = '';
            const lstPackages = [];
            // let packages = '';
            let containerNotes = '';
            let contSealNos = '';
            let gw = 0;
            let volumn = 0;
            this.houseBills.forEach(x => {
                gw += x.gw;
                volumn += x.cbm;
                containerNotes += !!x.packageContainer ? (x.packageContainer + '\n') : '';
                if (!!x.containers) {
                    contSealNos += this.getContSealNo(x.containers);
                }
                if (!!x.packages) {
                    const a = x.packages.split(", ");
                    if (a.length > 0) {
                        a.forEach(element => {
                            const b = element.split(" ");
                            if (b.length > 1) {
                                lstPackages.push({ quantity: b[0], package: b[1] });
                            }
                        });
                    }
                }
            });
            const packages = this.getPackages(lstPackages);
            this.billSIComponent.shippingInstruction.grossWeight = gw;
            this.billSIComponent.shippingInstruction.volume = volumn;
            this.billSIComponent.shippingInstruction.packagesNote = packages;
            this.billSIComponent.shippingInstruction.containerNote = containerNotes;
            this.billSIComponent.shippingInstruction.containerSealNo = contSealNos;
            //
            this.setFormRefresh({
                grossWeight: gw,
                volume: volumn,
                packagesNote: packages,
                containerNote: containerNotes,
                containerSealNo: contSealNos
            });
        }
    }

    setFormRefresh(res: any) {
        this.billSIComponent.formSI.patchValue({
            grossWeight: res.grossWeight,
            cbm: res.volume,
            packages: res.packagesNote,
            sumContainers: res.containerNote,
            contSealNo: res.containerSealNo,
        });
    }

    getContSealNo(containers: any) {
        let contSealNos = '';
        const contseal = containers.split("; ");
        if (contseal.length > 0) {
            contseal.forEach(element => {
                if (element.length > 0) {
                    if (element.includes('\n')) {
                        element = element.substring(0, element.length - 2);
                    }
                    contSealNos += element + '\n';
                }
            });
        }
        return contSealNos;
    }

    getPackages(lstPackages: any[]): string {
        const t = _groupBy(lstPackages, "package");
        let packages = '';
        for (const key in t) {
            // check if the property/key is defined in the object itself, not in parent
            if (t.hasOwnProperty(key)) {
                let sum = 0;
                t[key].forEach(x => {
                    sum = sum + Number(x.quantity);
                });
                packages += sum + " " + key + "\n";
            }
        }
        return packages;
    }

    initNewShippingInstruction(res: CsTransaction) {
        const user: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.billSIComponent.shippingInstruction = new CsShippingInstruction();
        this.billSIComponent.shippingInstruction.refNo = res.jobNo;
        this.billSIComponent.shippingInstruction.bookingNo = res.bookingNo;
        this.billSIComponent.shippingInstruction.paymenType = res.paymentTerm;
        this.billSIComponent.shippingInstruction.invoiceDate = new Date();
        this.billSIComponent.shippingInstruction.supplier = res.coloaderId;
        this.billSIComponent.shippingInstruction.issuedUser = user.id;
        this.billSIComponent.shippingInstruction.consigneeId = res.agentId;
        this.billSIComponent.shippingInstruction.pol = res.pol;
        this.billSIComponent.shippingInstruction.pod = res.pod;
        this.billSIComponent.shippingInstruction.loadingDate = res.etd;
        this.billSIComponent.shippingInstruction.voyNo = (!!res.flightVesselName ? res.flightVesselName : '') + " - " + (!!res.voyNo ? res.voyNo : '');
        this.billSIComponent.shippingInstruction.goodsDescription = res.desOfGoods;
        this.billSIComponent.shippingInstruction.remark = res.mbltype;

        this.getExportDefault(res);
    }

    getExportDefault(res: CsTransaction) {
        this.billSIComponent.shippingInstruction.cargoNoticeRecevier = "SAME AS CONSIGNEE";
        if (res.creatorOffice) {
            if (!!res.creatorOffice.nameEn) {
                this.billSIComponent.shippingInstruction.shipper = !!res.creatorOffice.nameEn ? res.creatorOffice.nameEn : '';
                if (!!res.creatorOffice.addressEn) {
                    this.billSIComponent.shippingInstruction.shipper = this.billSIComponent.shippingInstruction.shipper + '\nAddress: ' + res.creatorOffice.addressEn;
                }
                if (!!res.creatorOffice.tel) {
                    this.billSIComponent.shippingInstruction.shipper = this.billSIComponent.shippingInstruction.shipper + '\nTel: ' + res.creatorOffice.tel;
                }
                if (!!res.creatorOffice.fax) {
                    this.billSIComponent.shippingInstruction.shipper = this.billSIComponent.shippingInstruction.shipper + '\nFax: ' + res.creatorOffice.fax;
                }
                if (!!res.groupEmail) {
                    this.billSIComponent.shippingInstruction.shipper = this.billSIComponent.shippingInstruction.shipper + (!!res.groupEmail ? '\nEmail: ' + res.groupEmail : '');
                }
            } else {
                if (!!res.groupEmail) {
                    this.billSIComponent.shippingInstruction.shipper = !!res.groupEmail ? '\nEmail: ' + res.groupEmail : '';
                }
            }
        }
    }

    save() {
        this.billSIComponent.isSubmitted = true;
        if (!this.checkValidateForm()) {
            return;
        }

        const data = this.billSIComponent.onSubmitForm();
        data.jobId = this.jobId;
        this.saveData(data);
    }

    saveData(data: CsShippingInstruction) {
        this._documentRepo.updateShippingInstruction(data).pipe(
            catchError(this.catchError)
        )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getBillingInstruction(this.jobId);
                        this.displayPreview = true;
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.billSIComponent.formSI.valid
            || (!!this.billSIComponent.loadingDate.value && !this.billSIComponent.loadingDate.value.startDate)
            || (!!this.billSIComponent.issueDate.value && !this.billSIComponent.issueDate.value.startDate)
            || (this.billSIComponent.pod.value === this.billSIComponent.pol.value)
            || (this.billSIComponent.voyNo.value.trim() === '')
        ) {
            valid = false;
        }
        return valid;
    }

    refresh() {
        this.setDataBillInstructionComponent(null);
        this.displayPreview = false;
    }

    previewSummaryReport() {
        if (this.billSIComponent.shippingInstruction.jobId === '00000000-0000-0000-0000-000000000000') {
            this._toastService.warning('This shipment have not saved. please save.');
            return;
        }
        this._documentRepo.previewSummaryReport(this.billSIComponent.shippingInstruction)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        } else {
                            this._toastService.warning('This shipment does not have any house bill ');
                        }
                    }
                },
            );
    }

    previewSIReport() {
        if (this.billSIComponent.shippingInstruction.jobId === '00000000-0000-0000-0000-000000000000') {
            this._toastService.warning('This shipment have not saved. please save.');
            return;
        }
        this._documentRepo.previewSIReport(this.billSIComponent.shippingInstruction)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        } else {
                            this._toastService.warning('This shipment does not have any house bill ');
                        }
                    }
                },
            );
    }

    previewSIContReport() {
        if (this.billSIComponent.shippingInstruction.jobId === '00000000-0000-0000-0000-000000000000') {
            this._toastService.warning('This shipment have not saved. please save.');
            return;
        }
        this._documentRepo.previewSIContReport(this.billSIComponent.shippingInstruction.jobId)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        if (this.dataReport != null && res.dataSource.length > 0) {
                            this.showReport();
                        } else {
                            this._toastService.warning('This shipment does not have any house bill ');
                        }
                    } else {
                        this._toastService.warning('This shipment does not have any container ');
                    }
                },
            );
    }

    previewOCL() {
        if (this.billSIComponent.shippingInstruction.jobId === '00000000-0000-0000-0000-000000000000') {
            this._toastService.warning('This shipment have not saved. please save.');
            return;
        }
        this._documentRepo.previewOCLReport(this.billSIComponent.shippingInstruction)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        this.showReport();
                    } else {
                        this._toastService.warning('This shipment does not have any house bill ');
                    }
                },
            );
    }

    @delayTime(1000)
    showReport(): void {
        this.previewPopup.frm.nativeElement.submit();
        this.previewPopup.show();
    }
}

