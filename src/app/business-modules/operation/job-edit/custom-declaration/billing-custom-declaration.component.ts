import { Component, OnInit, ViewChild } from '@angular/core';
import { OpsTransaction } from 'src/app/shared/models/document/OpsTransaction.model';
import { PagingService } from 'src/app/shared/services/paging-service';
import { SortService } from 'src/app/shared/services/sort.service';
import { AddMoreModalComponent } from './add-more-modal/add-more-modal.component';
import { OperationRepo, DocumentationRepo, CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { AppList } from 'src/app/app.list';
import { CustomDeclaration } from '@models';
import { InjectViewContainerRefDirective } from '@directives';
import { ConfirmPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-billing-custom-declaration',
    templateUrl: './billing-custom-declaration.component.html',
})
export class BillingCustomDeclarationComponent extends AppList implements OnInit {
    @ViewChild(InjectViewContainerRefDirective) injectViewContainerRef: InjectViewContainerRefDirective;

    @ViewChild(AddMoreModalComponent) poupAddMore: AddMoreModalComponent;
    currentJob: OpsTransaction;
    customClearances: any[];
    importedData: any = [];
    headers: CommonInterface.IHeaderTable[];

    searchImportedString: string = '';
    checkAllImported = false;
    dataImportedSearch: any[];
    selectedCd: CustomDeclaration;

    constructor(
        private readonly pagerService: PagingService,
        private readonly _documentRepo: DocumentationRepo,
        private readonly _operationRepo: OperationRepo,
        private readonly _activedRouter: ActivatedRoute,
        private readonly _ngProgressService: NgProgress,
        private readonly _sortService: SortService,
        private readonly _catalogueRepo: CatalogueRepo,
        private readonly _toastService: ToastrService

    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
        this.requestSort = this.sortLocal;
        this.requestList = this.getCustomClearanesOfJob;

    }

    ngOnInit() {
        this.headers = [
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'Clearance Date', field: 'clearanceDate', sortable: true },
            { title: 'HBL No', field: 'hblid', sortable: true },
            { title: 'Export Country', field: 'exportCountryCode', sortable: true },
            { title: 'Import Country', field: 'importCountryCode', sortable: true },
            { title: 'Commodity Code', field: 'commodityCode', sortable: true },
            { title: 'Qty', field: 'qtyCont', sortable: true },
            { title: 'Parentdoc', field: 'firstClearanceNo', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];
        this._activedRouter.params.subscribe((param: { id: string }) => {
            if (!!param.id) {
                this.getShipmentDetails(param.id);

            }
        });
    }
    sortLocal(sort: string): void {
        this.customClearances = this._sortService.sort(this.customClearances, sort, this.order);
    }
    getShipmentDetails(id: any) {
        this._progressRef.start();
        this._documentRepo.getDetailShipment(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.getCurrentCustomer(this.currentJob.customerId);
                    this._progressRef.complete();
                }),
                tap((response: any) => {
                    this.currentJob = response;
                })
            ).subscribe(
                () => {
                    this.getCustomClearanesOfJob();
                },
            );
    }

    getCurrentCustomer(customerId: string) {
        this._catalogueRepo.getDetailPartner(customerId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.poupAddMore.partnerTaxcode = res.accountNo;
                    }
                }
            );
    }
    getCustomClearanesOfJob() {
        this._operationRepo.getListImportedInJob(this.currentJob.jobNo).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
        ).subscribe(
            (res: any) => {
                this.importedData = res;
                if (this.importedData != null) {
                    this.importedData.forEach(element => {
                        element.isChecked = false;
                    });
                } else {
                    this.importedData = [];
                }
                this.totalItems = this.importedData.length;
                this.dataImportedSearch = this.importedData;
                const pager = this.pagerService.getPager(this.totalItems, this.page, this.pageSize);
                this.customClearances = this.importedData.slice(pager.startIndex, pager.endIndex + 1);
            }
        );
    }

    removeChecked() {
        this.checkAllImported = false;
        const checkedData = this.importedData.filter(x => x.isChecked === true);
        if (checkedData.length > 0) {
            for (let i = 0; i < checkedData.length; i++) {
                const index = this.importedData.indexOf(x => x.id === checkedData[i].id);
                if (index > -1) {
                    this.importedData[index] = true;
                }
            }
        }
    }

    removeImported() {
        const dataToUpdate = this.importedData.filter(x => x.isChecked === true);
        if (dataToUpdate.length > 0) {
            dataToUpdate.forEach(x => {
                x.jobNo = null;
                x.jobId = this.currentJob.id;
                x.isDelete = true;
            });
            this._operationRepo.updateJobToClearances(dataToUpdate)
                .subscribe(
                    (responses: any) => {
                        if (responses.success === true) {
                            this._operationRepo.getListImportedInJob(this.currentJob.jobNo).pipe(
                                takeUntil(this.ngUnsubscribe),
                                catchError(this.catchError),
                                finalize(() => {
                                    this.updateShipmentVolumn();
                                })
                            ).subscribe(
                                () => {
                                    this.page = 1;
                                    this.getCustomClearanesOfJob();
                                }
                            );
                        }
                    }
                );

        }
    }

    updateShipmentVolumn() {
        if (this.importedData != null) {
            this.currentJob.sumGrossWeight = 0;
            this.currentJob.sumNetWeight = 0;
            this.currentJob.sumCbm = 0;
            if (this.importedData.length > 0) {
                for (let i = 0; i < this.importedData.length; i++) {
                    this.currentJob.sumGrossWeight = this.currentJob.sumGrossWeight + this.importedData[i].grossWeight == null ? 0 : this.importedData[i].grossWeight;
                    this.currentJob.sumNetWeight = this.currentJob.sumNetWeight + this.importedData[i].netWeight == null ? 0 : this.importedData[i].netWeight;
                    this.currentJob.sumCbm = this.currentJob.sumCbm + this.importedData[i].cbm == null ? 0 : this.importedData[i].cbm;
                }
                if (this.currentJob.sumGrossWeight === 0) {
                    this.currentJob.sumGrossWeight = null;
                }
                if (this.currentJob.sumNetWeight === 0) {
                    this.currentJob.sumNetWeight = null;
                }
                if (this.currentJob.sumCbm === 0) {
                    this.currentJob.sumCbm = null;
                }
            } else {
                this.currentJob.sumGrossWeight = null;
                this.currentJob.sumNetWeight = null;
                this.currentJob.sumCbm = null;
            }

            this._documentRepo.updateShipment(this.currentJob).subscribe(() => { });
        }
    }

    showPopupAdd() {
        this.poupAddMore.getClearanceNotImported();
        this.poupAddMore.show();

    }

    changeAllImported() {
        if (this.checkAllImported) {
            this.customClearances.forEach(x => {
                x.isChecked = true;
            });
        } else {
            this.customClearances.forEach(x => {
                x.isChecked = false;
            });
        }
    }

    closeAddMore(event: any) {
        if (event) {
            this.page = 1;
            this.getCustomClearanesOfJob();
        }
    }

    searchClearanceImported() {
        const keySearch = this.searchImportedString.trim().toLocaleLowerCase();
        if (keySearch !== null && keySearch.length < 2 && keySearch.length > 0) {
            return 0;
        }
        this.dataImportedSearch = this.importedData.filter(item => item.clearanceNo.toLocaleLowerCase().includes(keySearch)
            || (item.hblid == null ? '' : item.hblid.toLocaleLowerCase()).includes(keySearch)
            || (item.exportCountryCode == null ? '' : item.exportCountryCode.toLocaleLowerCase()).includes(keySearch)
            || (item.importCountryCode == null ? '' : item.importCountryCode.toLocaleLowerCase()).includes(keySearch)
            || (item.commodityCode == null ? '' : item.commodityCode.toLocaleLowerCase()).includes(keySearch)
            || (item.firstClearanceNo == null ? '' : item.firstClearanceNo.toLocaleLowerCase()).includes(keySearch)
            || (item.qtyCont == null ? '' : item.qtyCont.toString()).includes(keySearch));
        this.page = 1;
        this.totalItems = this.dataImportedSearch.length;

        const pager = this.pagerService.getPager(this.totalItems, this.page, this.pageSize);
        this.customClearances = this.dataImportedSearch.slice(pager.startIndex, pager.endIndex + 1);
    }

    onSelectCd(cd: CustomDeclaration) {
        this.selectedCd = cd;
    }

    confirmSyncCDToReplicateJob() {
        const currentCd = Object.assign({}, this.selectedCd);

        const confirmMessage = `Are you sure you want to sync <span class="font-weight-bold">${this.selectedCd?.clearanceNo}</span> to replicate job?`;
        this.showPopupDynamicRender(ConfirmPopupComponent, this.injectViewContainerRef.viewContainerRef, {
            title: 'Sync Clearance',
            body: confirmMessage,
            iconConfirm: 'la la-cloud-upload',
            labelConfirm: 'Yes',
            center: true
        }, () => {
            if (!!currentCd) {
                this._operationRepo.replicateClearance(currentCd.id)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                            } else
                                this._toastService.error(res.message);
                        }
                    )
            }
        });
    }


}
