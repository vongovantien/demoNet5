import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { CatalogueRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '@services';
import { IncotermUpdateModel, Incoterm } from '@models';

import { CommercialCreateIncotermComponent } from '../create/create-incoterm-commercial.component';

import UUID from 'validator/lib/isUUID';
import _merge from 'lodash/merge';
import { of } from 'rxjs';
import { takeUntil, map, switchMap, tap, catchError } from 'rxjs/operators';

@Component({
    selector: 'detail-incoterm-commercial',
    templateUrl: './detail-incoterm-commercial.component.html',
})
export class CommercialDetailIncotermComponent extends CommercialCreateIncotermComponent implements OnInit {

    incotermId: string;

    incotermDetail: IncotermUpdateModel;

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _router: Router,
        private _activedRoute: ActivatedRoute,
        private _cd: ChangeDetectorRef,
        private _dataService: DataService
    ) {
        super(_catalogueRepo, _toastService, _router);
    }

    ngOnInit(): void {
        this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    if (p.incotermId && UUID(p.incotermId)) {
                        console.log(p.incotermId);
                        return p.incotermId;
                    }
                    return null;
                }),
                tap(id => this.incotermId = id),
                switchMap((id) => this._catalogueRepo.getDetailIncoterm(id)),
            ).subscribe(
                (data: IncotermUpdateModel) => {
                    this.reloadIncotermDetail(data);
                }
            );
    }

    ngAfterViewInit() {
        this.listChargeSelling.isLoading = true;
        this._cd.detectChanges();
    }

    updateForm(res: Incoterm) {
        this._dataService.setData('incotermService', res.service);
        this.formCreateComponent.formGroup.patchValue(res);
    }

    setListChargeIncoterm(data: IncotermUpdateModel) {
        this.listChargeSelling.isLoading = false;
        this.listChargeBuying.isLoading = false;

        this.listChargeSelling.incotermCharges = data.sellings || [];
        this.listChargeBuying.incotermCharges = data.buyings || [];
    }

    saveIncoterm(model: IncotermUpdateModel) {
        model.incoterm.id = this.incotermDetail.incoterm.id;
        model.incoterm.userCreated = this.incotermDetail.incoterm.userCreated;
        model.incoterm.datetimeCreated = this.incotermDetail.incoterm.datetimeCreated;

        this._catalogueRepo.updateIncoterm(model).pipe(
            catchError(this.catchError),
            switchMap((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(res.message);
                    return this._catalogueRepo.getDetailIncoterm(this.incotermId);
                }
                return of(null);
            })
        ).subscribe(
            (res: IncotermUpdateModel) => {
                this.reloadIncotermDetail(res);
            }
        );
    }

    reloadIncotermDetail(data: IncotermUpdateModel): void {
        if (!!data) {
            this.incotermDetail = data;
            this.updateForm(this.incotermDetail.incoterm);
            this.setListChargeIncoterm(this.incotermDetail);
        }
    }
}
