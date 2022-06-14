import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { ToastrService } from 'ngx-toastr';
import { CommonEnum } from '@enums';
import { formatDate } from '@angular/common';
import { DocumentationRepo, SystemRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { UnlockHistoryPopupComponent } from '../unlock-history/unlock-history.popup';
import { Office } from '@models';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'unlock-shipment',
    templateUrl: './unlock-shipment.component.html',
    styleUrls: ['./unlock-shipment.component.scss']
})

export class UnlockShipmentComponent extends AppForm implements OnInit {

    @ViewChild(UnlockHistoryPopupComponent) confirmPopup: UnlockHistoryPopupComponent;

    options: CommonInterface.INg2Select[] = [
        { id: 1, text: 'Job ID' },
        { id: 2, text: 'MBL' },
        { id: 3, text: 'HBL' },
        { id: 4, text: 'Custom No' },
    ];
    selectedOption: string = this.options[0].id;

    services: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: CommonEnum.TransactionTypeEnum.AirExport, text: 'Air Export' },
        { id: CommonEnum.TransactionTypeEnum.AirImport, text: 'Air Import' },
        { id: CommonEnum.TransactionTypeEnum.CustomLogistic, text: 'Custom logistic' },
        { id: CommonEnum.TransactionTypeEnum.SeaFCLExport, text: 'Sea FCL Export' },
        { id: CommonEnum.TransactionTypeEnum.SeaFCLImport, text: 'Sea FCL Import' },
        { id: CommonEnum.TransactionTypeEnum.SeaLCLExport, text: 'Sea LCL Export' },
        { id: CommonEnum.TransactionTypeEnum.SeaLCLImport, text: 'Sea LCL Import' },
    ];
    selectedService: string = this.services[0].id;

    isSelectOption: boolean = true;
    isSelectServiceDate: boolean = false;

    lockHistory: string[] = [];
    shipmentUnlock: ILockedLog[] = [];

    offices: Observable<Office[]>;
    selectedOffice: string[];

    constructor(
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _systemRepo: SystemRepo,
    ) {
        super();

    }

    ngOnInit() {
        // * default disabled serviceDate.
        this.isDisabled = true;

        this.offices = this._systemRepo.getAllOffice();

    }

    onSelectOptionChange(e: any) {
        if (e.target.checked) {
            this.isSelectOption = true;
            this.isSelectServiceDate = false;

            this.selectedOption = this.options[0].id;
            this.isDisabled = true;
            this.selectedRange = null;

        } else {
            this.isSelectOption = false;
        }
    }

    onSelectServiceDate(e: any) {
        if (e.target.checked) {
            this.isSelectServiceDate = true;
            this.isSelectOption = false;

            this.isDisabled = null;
            this.keyword = '';
            this.selectedService = this.services[0].id;


        } else {
            this.isSelectServiceDate = false;
        }
    }

    unlock($event: boolean) {
        let body = {};
        if (this.isSelectOption) {
            if (!this.keyword.trim()) {
                this._toastService.warning("Please input keyword");
                return;
            }
            body = {
                shipmentPropertySearch: this.selectedOption,
                keywords: !!this.keyword ? this.keyword.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            };
        } else {
            if (!this.selectedRange.startDate && !this.selectedRange.endDate) {
                this._toastService.warning("Please select range of date");
                return;
            }
            body = {
                fromDate: !!this.selectedRange && !!this.selectedRange.startDate ? formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en') : null,
                toDate: !!this.selectedRange && !!this.selectedRange.endDate ? formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en') : null,
                transactionType: this.selectedService !== 'All' ? this.selectedService : 0,
                officeIds: this.selectedOffice.length ? this.selectedOffice : null
            };
        }
        this._documentRepo.getShipmentToUnlock(body)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: IShipmentLockInfo) => {
                    if (!!res.logs && !!res.logs.length) {
                        this.lockHistory = (res.logs || []);
                        this.confirmPopup.show();
                    } else {
                        this.lockHistory = [];
                    }

                    this.shipmentUnlock = res.lockedLogs;

                    if (!this.lockHistory.length) {
                        if (!this.shipmentUnlock) {
                            this._toastService.warning("Unlock failed, Reference No not found!");

                        } else if (!!this.shipmentUnlock.length) {
                            const shipmentLocked = this.shipmentUnlock.filter(x => x.isLocked);

                            if (!!shipmentLocked.length) {
                                this.shipmentUnlock = [...shipmentLocked];
                                this.onUnlockShipment($event);
                            } else {
                                this._toastService.success("These shipment's open.");
                            }
                        }
                    }
                }
            );
    }

    onUnlockShipment($event: boolean) {
        if ($event && !!this.shipmentUnlock) {
            if (!this.shipmentUnlock.filter(x => x.isLocked).length) {
                this._toastService.success("These shipment's open.");
                return;
            }
            this._documentRepo.unlockShipment(this.shipmentUnlock)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        if (res.success) {
                            this._toastService.success(res.message);
                        } else {
                            this._toastService.error("Unlock failed, Please check again!");
                        }
                    }
                );
        }

    }
}
export interface IShipmentLockInfo {
    lockedLogs: ILockedLog[]
    logs: string[];
}

export interface ILockedLog {
    id: string;
    advanceNo: string;
    settlementNo: string;
    isLocked: boolean;
    opsShipmentNo: string;
    csShipmentNo: string;
    unLockedLog: string;
}

