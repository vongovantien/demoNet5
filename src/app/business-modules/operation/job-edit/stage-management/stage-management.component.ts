import { Component, ViewChild } from "@angular/core";
import { OpsModuleStageManagementAddStagePopupComponent } from "./add/add-stage.popup.component";
import { OpsModuleStageManagementDetailComponent } from "./detail/detail-stage-popup.component";
import { OperationRepo, DocumentationRepo } from "src/app/shared/repositories";
import { ActivatedRoute } from "@angular/router";
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Stage } from "src/app/shared/models/operation/stage";
import { SortService } from "src/app/shared/services";
import { NgProgress } from "@ngx-progressbar/core";
import { AssignStagePopupComponent } from "./assign-stage/assign-stage.popup";
import { AppList } from "src/app/app.list";
import { ConfirmPopupComponent } from "@common";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: "app-ops-module-stage-management",
    templateUrl: "./stage-management.component.html",
})
export class OpsModuleStageManagementComponent extends AppList {

    data: any = null;
    @ViewChild(OpsModuleStageManagementAddStagePopupComponent) popupCreate: OpsModuleStageManagementAddStagePopupComponent;
    @ViewChild(OpsModuleStageManagementDetailComponent) popupDetail: OpsModuleStageManagementDetailComponent;
    @ViewChild(AssignStagePopupComponent) assignStagePopup: AssignStagePopupComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;

    stages: Stage[] = [];
    stageAvailable: any[] = [];
    selectedStage: Stage = null;
    currentStages: Stage[] = [];

    jobId: string = '';

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
            { title: 'Action', field: 'status', width: 10 },
            { title: 'No', field: 'status', sortable: true, width: 20 },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'Code', field: 'stageCode', sortable: true },
            { title: 'Name', field: 'stageNameEN', sortable: true },
            { title: 'Description', field: 'description', sortable: true },
            { title: 'Role', field: 'departmentName', sortable: true },
            { title: 'OPS Incharge', field: 'mainPersonInCharge', sortable: true },
            { title: 'Process Time', field: 'processTime', sortable: true },
            { title: 'Deadline', field: 'deadline', sortable: true },
            { title: 'Done Date', field: 'doneDate', sortable: true },
        ];

        this.requestSort = this.sortStage;
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: any) => {
            if (param.id) {
                this.jobId = param.id;
                this.getShipmentDetails(this.jobId);
                this.getListStageJob(this.jobId);
                this.getListStageAvailable(this.jobId);
            }
        });
    }

    getShipmentDetails(id: any) {
        this._progressRef.start();
        this._documentRepo.getDetailShipment(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            ).subscribe(
                (response: any) => {
                    this.data = response;
                    console.log(this.data);
                },
            );
    }

    openPopUpCreateStage() {
        this.popupCreate.show();
    }

    openPopUpAssignStage() {
        this.assignStagePopup.job = this.data;
        this.assignStagePopup.isAssignReplicateJob = this.assignStagePopup.isShowReplicate = !!this.data.replicatedId;
        this.assignStagePopup.isAsignment = false;

        if (!!this.data.fieldOpsId) {
            const defaultAssign = this.assignStagePopup.users.find(x => x.id === this.data.fieldOpsId);
            if (!!defaultAssign) {
                this.assignStagePopup.activeUser = [defaultAssign];
                this.assignStagePopup.selectedUser = defaultAssign;
            } else {
                this.assignStagePopup.activeUser = [];
            }
        }
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
}
