import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { CsOtherCharge } from '@models';
import { IAppState } from '@store';
import { Store } from '@ngrx/store';
import { getOtherChargeState, getTransactionLocked } from '@share-bussiness';
import { skip, takeUntil } from 'rxjs/operators';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'air-export-other-charge-popup',
    templateUrl: './air-export-other-charge.popup.html',
})
export class ShareAirExportOtherChargePopupComponent extends PopupBase implements OnInit {

    @Output() onUpdate: EventEmitter<IDataOtherCharge> = new EventEmitter<IDataOtherCharge>();

    csOtherCharges: CsOtherCharge[] = [];
    csOtherChargesTemp: CsOtherCharge[] = [];

    dueToData: CommonInterface.IValueDisplay[];

    totalAgent: number = 0;
    totalCarrier: number = 0;


    constructor(
        private _store: Store<IAppState>,
    ) {
        super();
    }

    ngOnInit(): void {
        this.dueToData = [
            { value: 'Agent', displayName: 'Agent' },
            { value: 'Carrier', displayName: 'Carrier' }
        ];

        this._store.select(getOtherChargeState)
            .pipe(
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (charges: CsOtherCharge[] = []) => {
                    this.csOtherCharges = charges;
                    this.csOtherChargesTemp = cloneDeep(charges);
                    if (!!this.csOtherChargesTemp.length) {
                        this.updateDescription();
                    }
                }
            );

        this.isLocked = this._store.select(getTransactionLocked);
    }

    closePopup() {
        this.csOtherChargesTemp = cloneDeep(this.csOtherCharges);
        this.updateDescription();
        this.isSubmitted = false;
        this.hide();
    }

    onSave() {
        this.isSubmitted = true;

        if (!this.checkValidate()) {
            return;
        } else {
            this.isSubmitted = false;

            this.csOtherCharges = cloneDeep(this.csOtherChargesTemp);

            this.onUpdate.emit({
                charges: this.csOtherCharges,
                totalAmountAgent: this.totalAgent,
                totalAmountCarrier: this.totalCarrier
            });
            this.hide();
        }
    }

    checkValidate() {
        let valid: boolean = true;
        for (const item of this.csOtherChargesTemp) {
            if (
                item.amount === null
                || item.dueTo === null
                || item.chargeName === null
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    delete(item: CsOtherCharge, index: number) {
        this.isSubmitted = false;
        this.csOtherChargesTemp.splice(index, 1);
        this.updateDescription();

    }

    addOtherCharge() {
        this.isSubmitted = false;
        this.csOtherChargesTemp.push(new CsOtherCharge());
    }

    updateDescription() {
        this.totalAgent = this.csOtherChargesTemp.reduce((acc, curr) => {
            if (curr.dueTo === 'Agent') {
                return acc += curr.amount;
            }
            return acc;

        }, 0);
        this.totalCarrier = this.csOtherChargesTemp.reduce((acc, curr) => {
            if (curr.dueTo === 'Carrier') {
                return acc += curr.amount;
            }
            return acc;
        }, 0);
    }

    updateTotalAmount(item: CsOtherCharge) {
        item.amount = item.quantity * item.rate;
        this.updateDescription();
    }
}

export interface IDataOtherCharge {
    charges: CsOtherCharge[];
    totalAmountAgent: number;
    totalAmountCarrier: number;
}
