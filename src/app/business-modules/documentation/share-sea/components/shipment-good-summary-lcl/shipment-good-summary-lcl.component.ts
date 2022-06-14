import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppForm } from '@app';
import { CatalogueRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { DataService } from '@services';
import { getTransactionDetailCsTransactionState, IShareBussinessState } from '@share-bussiness';
import { CsTransaction, Unit } from '@models';

import { skip, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-shipment-good-summary-lcl',
    templateUrl: './shipment-good-summary-lcl.component.html'
})

export class ShareSeaServiceShipmentGoodSummaryLCLComponent extends AppForm implements OnInit {

    packages: Observable<Unit[]>;
    commodities: string = null;
    gw: number = null;
    cbm: number = null;
    packageQuantity: number = null;
    packageTypes: string[] = [];

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IShareBussinessState>,
        private _dataService: DataService,
    ) {
        super();
    }

    ngOnInit() {
        this.packages = this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE });

        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(skip(1))
            .subscribe(
                (res: CsTransaction) => {
                    if (!!res) {
                        this.commodities = res.commodity;
                        this.gw = res.grossWeight;
                        this.packageQuantity = res.packageQty;
                        this.cbm = res.cbm;

                        this.packageTypes = !!res.packageType ? res.packageType.split(",") : [];
                    }
                }
            );

        // * Listen event Select Booking Note
        this._dataService.$data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            (data: { gw: number, cbm: number, commodity: string }) => {
                this.gw = data.gw;
                this.cbm = data.cbm;
                this.commodities = data.commodity;
            }
        );
    }
}
