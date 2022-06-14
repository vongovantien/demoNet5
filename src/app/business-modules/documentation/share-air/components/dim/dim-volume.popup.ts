import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DIM } from '@models';
import { ToastrService } from 'ngx-toastr';

import { PopupBase } from 'src/app/popup.base';
import { SystemConstants } from 'src/constants/system.const';

import { skip, takeUntil, catchError } from 'rxjs/operators';

import { DocumentationRepo } from '@repositories';
import { ConfirmPopupComponent } from '@common';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject } from 'rxjs';
import { CommonEnum } from '@enums';
import { getDimensionVolumesState, getTransactionLocked, IShareBussinessState } from '@share-bussiness';

@Component({
    selector: 'app-dim-volume-popup',
    templateUrl: './dim-volume.popup.html'
})

export class ShareAirServiceDIMVolumePopupComponent extends PopupBase implements OnInit {
    @ViewChild('confirmDeleteDim') confirmDeleteDIMpopup: ConfirmPopupComponent;


    @Output() onUpdate: EventEmitter<DIM[]> = new EventEmitter<DIM[]>();

    jobId: string;

    dims: DIM[] = [];
    dimsTemp: DIM[] = []; // dim temp;

    hwConstant: number = SystemConstants.HW_AIR_CONSTANT; // ? 6000
    cbmConstant: number = SystemConstants.CBM_AIR_CONSTANT; // ? 166.67

    totalHW: number = null;
    totalCBM: number = null;

    isCBMChecked: boolean = false;
    isShowGetFromHAWB: boolean = true;

    selectedIndexDIMItem: number;

    applyDIM: string;
    roundUp: string;

    $applyDIM: BehaviorSubject<string> = new BehaviorSubject(this.applyDIM);
    $roundUp: BehaviorSubject<string> = new BehaviorSubject(this.roundUp);

    constructor(
        private _toastService: ToastrService,
        private _store: Store<IShareBussinessState>,
        private _documentRepo: DocumentationRepo
    ) {
        super();
    }

    ngOnInit() {
        this._store.select<any>(getDimensionVolumesState)
            .pipe(
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (dims: DIM[]) => {
                    this.dims = dims;
                    this.dimsTemp = cloneDeep(dims);

                    this.calculateHWDimension();
                }
            );

        this.$applyDIM
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                (apply) => {
                    this.applyDIM = apply;
                }
            );

        this.$roundUp
            .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
                (round: string) => {
                    this.roundUp = round;
                }
            );

        this.isLocked = this._store.select<any>(getTransactionLocked);
    }

    addDIM() {
        this.isSubmitted = false;
        // this.dims.push(new DIM());
        this.dimsTemp.push(new DIM());
    }

    delete(dimItem: DIM, index: number) {
        this.selectedIndexDIMItem = index;
        if (dimItem.id === SystemConstants.EMPTY_GUID) {
            this.isSubmitted = false;
            this.dimsTemp.splice(index, 1);

            this.calculateHWDimension();
        } else {
            this.confirmDeleteDIMpopup.show();
        }
    }

    onDeleteDIMItem() {
        this.isSubmitted = false;
        this.dimsTemp.splice(this.selectedIndexDIMItem, 1);

        this.calculateHWDimension();
    }

    saveDIM() {
        // if (!this.dims.length) {
        //     this._toastService.warning("Please Add Dimension Information");
        //     return;
        // }
        this.isSubmitted = true;

        if (!this.checkValidate()) {
            return;
        } else {
            this.isSubmitted = false;

            this.dims = cloneDeep(this.dimsTemp);

            this.onUpdate.emit(this.dims);
            this.hide();
        }
    }

    closePopup() {
        this.dimsTemp = cloneDeep(this.dims);
        this.isSubmitted = false;

        this.hide();
    }

    updateHeightWeight(dimItem: DIM) {
        dimItem.hw = this.utility.calculateHeightWeight(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwConstant);

        // * Round
        if (this.applyDIM === CommonEnum.APPLY_DIM.SINGLE) {
            dimItem.hw = this.calculateDataDIMWithRound(this.applyDIM, this.roundUp, dimItem.hw);
        }
        dimItem.cbm = this.utility.calculateCBM(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwConstant);

        this.updateTotalHeightWeight();
        this.updateCBM();
    }

    calculateHWDimension() {
        if (!!this.dimsTemp.length) {
            for (const item of this.dimsTemp) {
                this.updateHeightWeight(item);
            }
        } else {
            this.totalCBM = this.totalHW = 0;
        }
    }

    updateTotalHeightWeight() {
        this.totalHW = +this.dimsTemp.reduce((acc: number, curr: DIM) => acc += curr.hw, 0).toFixed(3);

        // * Round
        if (this.applyDIM === CommonEnum.APPLY_DIM.TOTAL) {
            this.totalHW = this.calculateDataDIMWithRound(this.applyDIM, this.roundUp, this.totalHW);
        }
    }

    calculateDataDIMWithRound(apply: string, round: string, num: number): number {
        if (isNaN(num)) {
            return 0;
        }
        if (!!apply && !!round) {
            if (round === CommonEnum.ROUND_DIM.HALF) {
                return Math.round(num);
            } else if (round === CommonEnum.ROUND_DIM.ONE) {
                return Math.ceil(num);
            } else { // * Standard
                return this.utility.calculateRoundStandard(num);
            }
        } else {
            return num;
        }
    }

    updateCBM() {
        this.totalCBM = +this.dimsTemp.reduce((acc: number, curr: DIM) => acc += curr.cbm, 0).toFixed(3);
    }

    checkValidate() {
        let valid: boolean = true;
        for (const item of this.dimsTemp) {
            if (
                item.length === null
                || item.width === null
                || item.height === null
                || item.package === null
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    onGetDimsFromHAWB() {
        if (!!this.jobId) {
            this._documentRepo.getHouseDIMByJob(this.jobId).pipe(
                catchError(this.catchError)
            ).subscribe(
                (res: DIM[]) => {
                    if (!!res && !!res.length) {
                        this.dimsTemp.length = 0;
                        this.dimsTemp = cloneDeep(res);

                        this.calculateHWDimension();
                    } else {
                        this._toastService.warning("Not found DIMs from HAWB");
                    }
                }
            );
        }
    }
}
