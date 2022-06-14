import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppPage } from '@app';
import { ReportPreviewComponent } from '@common';
import { delayTime } from '@decorators';
import { InjectViewContainerRefDirective } from '@directives';
import { CsTransactionDetail } from '@models';
import { DocumentationRepo, ExportRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SystemConstants } from '@constants';

@Component({
    selector: 'app-menu-preview-hbl-sea-import',
    templateUrl: './menu-preview-hbl-sea-import.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class ShareSeaServiceMenuPreviewHBLSeaImportComponent extends AppPage implements OnInit {
    @Input() hblDetail: CsTransactionDetail;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    isClickSubMenu: boolean = false;

    constructor(private readonly _toastService: ToastrService,
        private readonly _cd: ChangeDetectorRef,
        private readonly _documentationRepo: DocumentationRepo,
        private readonly _exportRepository: ExportRepo) {
        super();
    }

    ngOnInit(): void { }

    renderAndShowReport() {
        // * Render dynamic
        this.componentRef = this.renderDynamicComponent(ReportPreviewComponent, this.viewContainerRef.viewContainerRef);
        (this.componentRef.instance as ReportPreviewComponent).data = this.dataReport;

        this.showReport();

        this.subscription = ((this.componentRef.instance) as ReportPreviewComponent).$invisible.subscribe(
            (v: any) => {
                this.subscription.unsubscribe();
                this.viewContainerRef.viewContainerRef.clear();
            });
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.ShowWithDelay();
        this._cd.detectChanges();
    }


    onPreview(type: string) {
        this.isClickSubMenu = false;
        this._toastService.clear();
        // Preview Delivery Order
        if (type === 'DELIVERY_ORDER') {
            this.previewDeliveryOrder();
        }

        // Preview Arrival Notice
        if (type === 'ARRIVAL_ORIGINAL' || type === 'ARRIVAL_VND') {
            const _currency = type === 'ARRIVAL_VND' ? 'VND' : 'ORIGINAL';
            this.previewArrivalNotice(_currency);
        }

        // PREVIEW PROOF OF DELIVERY
        if (type === 'PROOF_OF_DELIVERY') {
            this.previewProofOfDelivery();
        }
        if (type === 'E_MANIFEST') {
            this.exportEManifest();
        }
        if (type === 'GOODS_DECLARE') {
            this.exportGoodsDeclare();
        }
        if (type === 'DANGEROUS_GOODS') {
            this.exportDangerousGoods();
        }
    }

    previewProofOfDelivery() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewProofofDelivery(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.dataReport = res;
                        this.renderAndShowReport();
                    }
                },
            );
    }
    previewArrivalNotice(_currency: string) {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewArrivalNotice({ hblId: this.hblDetail.id, currency: _currency });
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.dataReport = res;
                        if (this.dataReport.dataSource?.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data charge to display preview');
                        }
                    }
                },
            );
    }

    previewDeliveryOrder() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewDeliveryOrder(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.dataReport = res;
                        if (this.dataReport.dataSource?.length > 0) {
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no container data to display preview');
                        }
                    }
                },
            );
    }

    exportDangerousGoods() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._exportRepository.exportDangerousGoods(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                    }
                },
            );
    }

    exportGoodsDeclare() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._exportRepository.exportGoodDeclare(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                    }
                },
            );
    }

    exportEManifest() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._exportRepository.exportEManifest(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.downLoadFile(res.body, SystemConstants.FILE_EXCEL, res.headers.get(SystemConstants.EFMS_FILE_NAME));
                    }
                },
            );
    }
}
