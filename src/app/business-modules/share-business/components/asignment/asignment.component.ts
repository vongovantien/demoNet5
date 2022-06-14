import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { OperationRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { ActivatedRoute } from '@angular/router';
import { SortService } from 'src/app/shared/services';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Stage } from 'src/app/shared/models';
import { ShareBusinessAssignStagePopupComponent } from '../stage-management/assign-stage/assign-stage.popup';
import { ShareBusinessStageManagementDetailComponent } from '../stage-management/detail/detail-stage-popup.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';

@Component({
    selector: 'share-assignment',
    templateUrl: './assignment.component.html'
})

export class ShareBusinessAsignmentComponent extends AppList {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(ShareBusinessStageManagementDetailComponent) popupDetail: ShareBusinessStageManagementDetailComponent;
    @ViewChild(ShareBusinessAssignStagePopupComponent) assignStagePopup: ShareBusinessAssignStagePopupComponent;
    data: any = null;
    jobId: string = '';
    stages: Stage[] = [];
    stageAvailable: any[] = [];
    selectedStage: Stage = null;
    currentStages: Stage[] = [];


    timeOutSearch: any;
    headers: CommonInterface.IHeaderTable[];

    constructor(
        private _operation: OperationRepo,
        private _activedRouter: ActivatedRoute,
        private _sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _ngProgressService: NgProgress,
        private _toastService: ToastrService

    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
        this.headers = [
            { title: 'Action', field: 'status' },
            { title: 'No', field: 'orderNumberProcessed' },
            { title: 'Person Incharge', field: 'mainPersonInCharge', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'Code', field: 'stageCode', sortable: true },
            { title: 'Name', field: 'stageNameEN', sortable: true },
            { title: 'Description', field: 'description', sortable: true },
            { title: 'Role', field: 'departmentName', sortable: true },

            { title: 'Process Time', field: 'processTime', sortable: true },
            { title: 'Deadline Date', field: 'deadline', sortable: true },
            { title: 'Finish Date', field: 'doneDate', sortable: true },
        ];

        this.requestSort = this.sortStage;

    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: any) => {
            if (param.jobId) {
                this.jobId = param.jobId;
                this.getCSTransactionDetails(this.jobId);
                this.getListStageJob(this.jobId);
                this.getListStageAvailable(this.jobId);

            }
        });
    }


    getCSTransactionDetails(id: any) {
        this._progressRef.start();
        this._documentRepo.getDetailTransaction(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            ).subscribe(
                (response: any) => {
                    this.data = response;
                },
            );
    }

    openPopUpAssignStage() {
        this.assignStagePopup.jobId = this.jobId;
        this.assignStagePopup.isAsignment = true;
        this.assignStagePopup.show();
    }


    openPopupDetail() {
        this.popupDetail.show();
    }

    getListStageJob(id: string) {
        this._operation.getListStageOfJob(id).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
        ).subscribe(
            (res: any[]) => {
                if (res instanceof Error) {
                } else {
                    this.stages = this._sortService.sort(res.map((item: any) => new Stage(item)), 'orderNumberProcessed', true);
                    this.currentStages = this.stages;
                    console.log(this.currentStages);
                }
            },
        );
    }

    getListStageAvailable(id: string) {
        this._operation.getListStageNotAssigned(id).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
        ).subscribe(
            (res: any[]) => {
                if (res instanceof Error) {

                } else {
                    this.stageAvailable = res || [];
                }
            },
        );
    }

    showDeletePopup(data: any) {
        this.confirmDeletePopup.show();
        this.selectedStage = data;
    }

    onDeleteStage() {
        this.confirmDeletePopup.hide();
        this.deleteStageAssigned(this.selectedStage.id);
    }


    deleteStageAssigned(id: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._operation.deleteStageAssigned(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getListStageJob(this.jobId);
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    getDetail(id: string) {
        this._operation.getDetailStageOfJob(id).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
        ).subscribe(
            (res: any[]) => {
                if (res instanceof Error) {

                } else {
                    this.selectedStage = new Stage(res);
                    this.openPopupDetail();
                }
            },
        );
    }

    onSearching(keyword: string) {
        clearTimeout(this.timeOutSearch);
        this.timeOutSearch = setTimeout(() => {
            this.stages = this.currentStages;
            if (keyword.length >= 3) {
                this.stages = this.stages.filter((item: Stage) => {
                    if (!!item) {
                        return item.stageCode.toLowerCase().search(keyword.toLowerCase().trim()) !== -1
                            || (item.stageNameEN || '').toLowerCase().search(keyword.toLowerCase().trim()) !== -1
                            || (item.description || '').toLowerCase().search(keyword.toLowerCase().trim()) !== -1;
                    }
                });
            } else {
                this.stages = this.currentStages;
            }
        }, 500);
    }

    // when add success stage into job
    onAddSuccess() {
        this.getListStageJob(this.jobId);
        this.getListStageAvailable(this.jobId);
    }

    sortStage() {
        this.stages = this._sortService.sort(this.stages, this.sort, this.order);
    }

}