import { Component, Input, ViewChild } from '@angular/core';
import { OpsTransaction } from 'src/app/shared/models/document/OpsTransaction.model';
import { catchError, finalize, map } from 'rxjs/operators';
import { DocumentationRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { SortService } from 'src/app/shared/services';
import { ActivatedRoute } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { AppList } from 'src/app/app.list';
import { TransactionTypeEnum } from 'src/app/shared/enums/transaction-type.enum';
import { OpsCdNoteDetailPopupComponent } from '../components/popup/ops-cd-note-detail/ops-cd-note-detail.popup';
import { ToastrService } from 'ngx-toastr';
import { OpsCdNoteAddPopupComponent } from '../components/popup/ops-cd-note-add/ops-cd-note-add.popup';
import { AcctCDNote } from 'src/app/shared/models/document/acctCDNote.model';
import _uniq from 'lodash/uniq';
import { ReportPreviewComponent } from '@common';
import { Crystal } from '@models';
import { InjectViewContainerRefDirective } from '@directives';
import { delayTime } from '@decorators';
import { combineLatest } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { SystemConstants } from '@constants';

@Component({
    selector: 'ops-cd-note-list',
    templateUrl: './ops-cd-note-list.component.html',
    styleUrls: ['./ops-cd-note-list.component.scss']
})
export class OpsCDNoteComponent extends AppList {
    @Input() currentJob: OpsTransaction;
    @ViewChild(OpsCdNoteDetailPopupComponent) cdNoteDetailPopupComponent: OpsCdNoteDetailPopupComponent;
    @ViewChild(OpsCdNoteAddPopupComponent) cdNoteAddPopupComponent: OpsCdNoteAddPopupComponent;
    @ViewChild(InjectViewContainerRefDirective) public viewContainerRef: InjectViewContainerRefDirective;

    headers: CommonInterface.IHeaderTable[];
    idMasterBill: string = '';
    cdNoteGroups: any[] = [];
    initGroup: any[] = [];
    deleteMessage: string = '';
    selectedCdNoteId: string = '';
    transactionType: TransactionTypeEnum = 0;
    cdNotePrint: AcctCDNote[] = [];

    isDesc = true;
    sortKey: string = '';

    constructor(
        private _documentRepo: DocumentationRepo,
        private _exportRepo: ExportRepo,
        private _sortService: SortService,
        private _activedRouter: ActivatedRoute,
        private _toastService: ToastrService,
    ) {
        super();
    }

    ngOnInit() {
        combineLatest([
            this._activedRouter.params,
            this._activedRouter.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
        ).subscribe(
            (params: any) => {
                if (!!params.id) {
                    this.idMasterBill = params.id;
                    const cdNo = params.view;
                    const currencyId = params.export;
                    if (!!cdNo && !!currencyId) {
                        this.getListCdNoteWithPreview(this.idMasterBill, cdNo, currencyId)
                    } else {
                        this.getListCdNote(this.idMasterBill);
                    }
                }
            }
        )

        this.headers = [
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Note No', field: 'code', sortable: true },
            { title: 'Charges Count', field: 'total_charge', sortable: true, },
            { title: 'Balance Amount', field: 'total', sortable: true, width: 220 },
            { title: 'Creator', field: 'userCreated', sortable: true },
            { title: 'Create Date', field: 'datetimeCreated', sortable: true },
            { title: 'SOA', field: 'soaNo', sortable: true },
            { title: 'Sync Status', field: 'syncStatus', sortable: true },
            { title: 'Last Sync', field: 'lastSyncDate', sortable: true },
        ];
    }

    getListCdNote(id: string) {
        this.isLoading = true;
        const isShipmentOperation = true;
        this._documentRepo.getListCDNote(id, isShipmentOperation)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.cdNoteGroups = res;
                    this.initGroup = res;
                    const selected = { isSelected: false };
                    this.cdNoteGroups.forEach(element => {
                        element.listCDNote.forEach((item: any[]) => {
                            Object.assign(item, selected);
                        });
                    });
                },
            );
    }

    getListCdNoteWithPreview(id: string, cdNo: string, currency: string) {
        this.isLoading = true;
        const isShipmentOperation = true;
        this._documentRepo.getListCDNote(id, isShipmentOperation)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.cdNoteGroups = res;
                    this.initGroup = res;
                    const selected = { isSelected: false };
                    this.cdNoteGroups.forEach(element => {
                        element.listCDNote.forEach((item: any[]) => {
                            Object.assign(item, selected);
                        });
                    });
                    let isExist = false;
                    this.cdNoteGroups.forEach(element => {
                        const item = element.listCDNote.filter(cdNote => cdNote.code === cdNo);
                        if (item.length > 0) {
                            isExist = true;
                            element.listCDNote.filter(cdNote => cdNote.code === cdNo).map(cdNote => cdNote.isSelected = true);
                            this.transactionType = item.transactionTypeEnum;
                            this.openPopupDetail(id, cdNo);
                            this.cdNoteDetailPopupComponent.previewCdNote(currency);
                        }
                    })
                    if (!isExist) {
                        this._toastService.error("CD Note " + cdNo + "does not existed!");
                    }
                }
            );
    }

    ngAfterViewInit() {
        this.cdNoteAddPopupComponent.getListSubjectPartner(this.idMasterBill);
        this.cdNoteDetailPopupComponent.cdNoteEditPopupComponent.getListSubjectPartner(this.idMasterBill);
    }

    openPopupAdd() {
        this.cdNoteAddPopupComponent.action = 'create';
        this.cdNoteAddPopupComponent.currentMBLId = this.idMasterBill;
        this.cdNoteAddPopupComponent.show();
    }

    openPopupDetail(jobId: string, cdNote: string) {
        this.cdNoteDetailPopupComponent.jobId = jobId;
        this.cdNoteDetailPopupComponent.cdNote = cdNote;
        this.cdNoteDetailPopupComponent.getDetailCdNote(jobId, cdNote);
        this.cdNoteDetailPopupComponent.show();
    }

    checkDeleteCdNote(id: string) {
        this._documentRepo.checkCdNoteAllowToDelete(id)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.selectedCdNoteId = id;
                        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: 'All related information will be lost? Are you sure you want to delete this Credit/Debit Note?',
                            labelConfirm: 'Ok',
                        }, () => {
                            this.onDeleteCdNote();
                        });
                    } else {
                        this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: 'You can not delete this C/D Note, because it was issued SOA/Voucher/VAT Invoice. Please recheck!'
                        });
                    }
                },
            );
    }

    onDeleteCdNote() {
        this._documentRepo.deleteCdNote(this.selectedCdNoteId)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.getListCdNote(this.idMasterBill);
                    }
                },
            );
    }

    sortCdNotes(property) {
        this.isDesc = !this.isDesc;
        this.sortKey = property;
        this.cdNoteGroups.forEach(element => {
            element.listCDNote = this._sortService.sort(element.listCDNote, property, this.isDesc);
        });
    }

    onRequestCdNoteChange($event) {
        this.getListCdNote(this.idMasterBill);
        // Show detail popup
        this.openPopupDetail($event.jobId, $event.code);
    }

    onDeletedCdNote() {
        this.getListCdNote(this.idMasterBill);
    }

    // Charge keyword search
    onChangeKeyWord(keyword: string) {
        this.cdNoteGroups = this.initGroup;
        // TODO improve search.
        if (!!keyword) {
            if (keyword.indexOf('\\') !== -1) { return this.cdNoteGroups = []; }
            keyword = keyword.toLowerCase();
            // Search group
            let dataGrp = this.cdNoteGroups.filter((item: any) => item.partnerNameEn.toLowerCase().toString().search(keyword) !== -1);
            // Không tìm thấy group thì search tiếp list con của group
            if (dataGrp.length === 0) {
                const arrayCharge = [];
                for (const group of this.cdNoteGroups) {
                    const data = group.listCDNote.filter((item: any) => item.type.toLowerCase().toString().search(keyword) !== -1 || item.code.toLowerCase().toString().search(keyword) !== -1);
                    if (data.length > 0) {
                        arrayCharge.push({ id: group.id, partnerNameEn: group.partnerNameEn, partnerNameVn: group.partnerNameVn, listCDNote: data });
                    }
                }
                dataGrp = arrayCharge;
            }
            return this.cdNoteGroups = dataGrp;
        } else {
            this.cdNoteGroups = this.initGroup;
        }
    }


    checkValidCDNote() {
        this.cdNotePrint = [];
        const listCheck = [];
        this.cdNoteGroups.forEach(element => {
            const item = element.listCDNote.filter(cdNote => cdNote.isSelected === true);
            if (item.length > 0) {
                listCheck.push(item);
                this.cdNotePrint = item;
            }
        }
        );

        if (listCheck.length === 0) {
            this._toastService.warning("Please select C/D Note to preview.");
            return false;
        }
        const type = [];
        listCheck.forEach(x => x.map(y => type.push(y.type)))
        if (listCheck.length > 1 || _uniq(type).length > 1) {
            this._toastService.warning("You can not print C/D Notes that are different type! Please check again");
            return false;
        }
        return true;
    }

    @delayTime(1000)
    showReport(): void {
        this.componentRef.instance.frm.nativeElement.submit();
        this.componentRef.instance.show();
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

    preview(isOrigin: boolean) {
        if (!this.checkValidCDNote()) {
            return;
        }

        this._documentRepo.previewCDNoteList(this.cdNotePrint, isOrigin)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: Crystal) => {
                    this.dataReport = res;
                    if (res.dataSource.length > 0) {
                        this.renderAndShowReport();
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    exportCDNote() {
        if (!this.checkValidCDNote()) {
            return;
        }
        this._exportRepo.exportCDNoteCombine(this.cdNotePrint)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('No data found');
                    }
                },
            );
    }
}
