import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppShareHBLBase, IShareBussinessState } from '@share-bussiness';

import { catchError, finalize } from 'rxjs/operators';
import { RoutingConstants } from '@constants';


@Component({
    selector: 'app-sea-consol-import-hbl',
    templateUrl: './sea-consol-import-hbl.component.html',
})
export class SeaConsolImportHBLComponent extends AppShareHBLBase {
    constructor(
        private _router: Router,
        protected _sortService: SortService,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
        protected _store: Store<IShareBussinessState>,
        protected _activedRoute: ActivatedRoute,
        protected _spinner: NgxSpinnerService
    ) {
        super(_sortService, _store, _spinner, _progressService, _toastService, _documentRepo, _activedRoute);
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'advance-settle':
                this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`], { queryParams: { tab: 'ADVANCE-SETTLE' } });
                break;
        }
    }

    configHBL() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Salesman', field: 'saleManName', sortable: true },
            { title: 'Departure', field: 'finalDestinationPlace', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Container', 'field': 'containers', sortable: true },
            { title: 'Package', field: 'packages', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Group', field: 'group', sortable: true },
            { title: 'Department', field: 'department', sortable: true }
        ];
    }

    gotoCreate() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}/hbl/new`]);
    }


    gotoDetail(id: string) {
        this._documentRepo.checkDetailShippmentPermission(this.shipmentDetail.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}/hbl/${id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    duplicateConfirm() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}`]);
    }
}
