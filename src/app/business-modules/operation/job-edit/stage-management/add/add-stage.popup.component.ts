import { Component, Input, EventEmitter, Output } from "@angular/core";
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";

import { PopupBase } from "src/app/popup.base";
import { OperationRepo } from "src/app/shared/repositories";

import { takeUntil, catchError, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import _includes from "lodash/includes";
import { Stage } from "src/app/shared/models";

@Component({
    selector: "add-stage-popup",
    templateUrl: "./add-stage.popup.component.html",
    styleUrls: ["./add-stage.popup.component.scss"]
})
export class OpsModuleStageManagementAddStagePopupComponent extends PopupBase {

    @Input() stages: any[] = [];
    @Input() stageSelected: any[] = [];
    @Input() id: string = '';
    @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();

    selectedStages: any[] = [];
    tempStages1: any[] = [];
    tempStages2: any[] = [];

    keyword_stage: string = '';
    keyword_stageSelected: string = '';

    isAdd: boolean = false;
    isMasterStageSelected: boolean = false;
    isMasterStageNotAssigned: boolean = false;

    constructor(
        private _operationRepo: OperationRepo,
        private _spinner: NgxSpinnerService,
        private _toaster: ToastrService
    ) {
        super();
    }

    ngOnInit() {

    }

    ngOnChanges() {
        if (!!this.stageSelected.length) {
            this.selectedStages = this.stageSelected;
        }
    }


    onChangeCheckBoxStage() {
        this.isMasterStageNotAssigned = this.stages.every((item: any) => item.isSelected);
        this.tempStages1 = this.getStageSelected(this.stages);
    }

    onChangeCheckBoxStageSelected() {
        this.isMasterStageSelected = this.selectedStages.every((item: any) => item.isSelected);
        this.tempStages2 = this.getStageSelected(this.selectedStages);
    }

    onAddStage() {
        for (const stage of this.tempStages1) {
            stage.isSelected = false;
        }
        this.selectedStages.push(...this.tempStages1);

        this.stages = this.stages.filter(
            (stage: any) => !_includes(this.selectedStages, stage)
        );

        if (!this.stages.length) {
            this.isMasterStageNotAssigned = false;
        }
        this.tempStages1 = [];
    }

    onRemoveStage() {
        // map all stage was to not selected
        for (const stage of this.tempStages2) {
            stage.isSelected = false;
        }
        this.stages.push(...this.tempStages2);

        this.selectedStages = this.selectedStages.filter(
            (stage: any) => !_includes(this.stages, stage)
        );

        if (!this.selectedStages.length) {
            this.isMasterStageSelected = false;
        }

        this.tempStages2 = [];
    }

    onSaveStage() {
        const data: any[] = this.selectedStages.map((stage: any, index: number) => new Stage(stage));

        // assigne jobId, order
        for (const [index, value] of <any>data.entries()) {
            if (!value.jobId) {
                value.jobId = this.id;
            }
            value.orderNumberProcessed = index + 1;
        }

        this._spinner.show();
        this._operationRepo.addStageToJob(this.id, data).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
            finalize(() => { this._spinner.hide() }),
        ).subscribe(
            (res: any) => {
                if (!res.status) {
                    this._toaster.success(res.message, '');
                } else {
                    this.selectedStages = [];
                    this._toaster.success(res.message, '');
                    this.onSuccess.emit();
                    this.hide();
                }
            },
            (errs: any) => {
            },
            () => { }
        );
    }



    onCancel() {
        this.hide();
        this.onSuccess.emit();
        this.stages.push(...this.selectedStages);

        this.selectedStages = this.selectedStages.filter(
            (stage: any) => !_includes(this.stages, stage)
        );

        this.tempStages2 = [];
        this.isMasterStageSelected = false;
        this.isMasterStageNotAssigned = false;
    }

    checkUncheckAllStage(type: string) {
        switch (type) {
            case 'stageNotAsigned': {
                for (const stage of this.stages) {
                    stage.isSelected = this.isMasterStageNotAssigned;
                }

                this.tempStages1 = this.getStageSelected(this.stages);
                break;
            }
            case 'stageSelected': {
                for (const stage of this.selectedStages) {
                    stage.isSelected = this.isMasterStageSelected;
                }

                this.tempStages2 = this.getStageSelected(this.selectedStages);
                break;
            }
        }
    }

    // get stage with isSelected : true
    getStageSelected(stages: any[]): any[] {
        const stageIsSelected: any[] = [];
        for (const stage of stages) {
            if (stage.isSelected) {
                stageIsSelected.push(stage);
            }
        }
        return stageIsSelected;
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.selectedStages, event.previousIndex, event.currentIndex);
    }

}


