import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgProgress } from '@ngx-progressbar/core';
import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { IShareBussinessState, AppShareHBLBase } from '@share-bussiness';

import { catchError, finalize } from 'rxjs/operators';
import { RoutingConstants } from '@constants';

@Component({
    selector: 'app-air-import-hbl',
    templateUrl: './air-import-hbl.component.html'
})

export class AirImportHBLComponent extends AppShareHBLBase implements OnInit {

    serviceType: CommonType.SERVICE_TYPE = 'air';

    constructor(
        private _router: Router,
        protected _store: Store<IShareBussinessState>,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
        protected _spinner: NgxSpinnerService,
        protected _sortService: SortService,
        protected _activedRoute: ActivatedRoute

    ) {
        super(_sortService, _store, _spinner, _progressService, _toastService, _documentRepo, _activedRoute);
    }

    gotoDetail(id: string) {
        this._documentRepo.checkDetailShippmentPermission(this.shipmentDetail.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}/hbl/${id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}`]);
    }

    gotoCreate() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}/hbl/new`]);
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'files':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], { queryParams: { tab: 'FILES' } });
                break;
            case 'advance-settle':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ADVANCE-SETTLE' } });
                break;
        }
    }

    duplicateConfirm() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }

}
