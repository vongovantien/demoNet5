import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { PopupBase } from '@app';
import { ReportPreviewComponent } from '@common';
import { delayTime } from '@decorators';
import { InjectViewContainerRefDirective } from '@directives';
import { ICrystalReport } from '@interfaces';
import { CsTransactionDetail } from '@models';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-menu-preview-hbl-sea-export',
    templateUrl: './menu-preview-hbl-sea-export.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareSeaServiceMenuPreviewHBLSeaExportComponent extends PopupBase implements OnInit, ICrystalReport {
    @Input() hblDetail: CsTransactionDetail;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;
    constructor(
        private readonly _documentationRepo: DocumentationRepo,
        private readonly _cd: ChangeDetectorRef,
        private readonly _toastService: ToastrService) {
        super();
    }

    ngOnInit(): void { }

    preview(reportType: string) {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewSeaHBLOfLanding(this.hblDetail.id, reportType);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            )
            .subscribe(
                (res: any) => {
                    if (res !== false) {
                        if (res?.dataSource?.length > 0) {
                            this.dataReport = res;
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }

                },
            );
    }

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
        this._cd.detectChanges(); // * Mark cd detect to refresh instance Popup.
    }

    previewAttachList() {
        this._documentationRepo.validateCheckPointContractPartner(this.hblDetail.customerId, this.hblDetail.id, 'DOC', null, 7)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (res.status) {
                        return this._documentationRepo.previewAirAttachList(this.hblDetail.id);
                    }
                    this._toastService.warning(res.message);
                    return of(false);
                })
            ).subscribe(
                (res: any) => {
                    if (res !== false) {
                        if (res?.dataSource?.length > 0) {
                            this.dataReport = res;
                            this.renderAndShowReport();
                        } else {
                            this._toastService.warning('There is no data to display preview');
                        }
                    }

                },
            );
    }
}
