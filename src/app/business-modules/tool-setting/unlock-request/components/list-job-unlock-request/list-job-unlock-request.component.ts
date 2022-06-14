import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AppList } from "src/app/app.list";
import { SortService } from "@services";
import { ToastrService } from "ngx-toastr";
import { UnlockRequestInputSearchJobPopupComponent } from "../popup/input-search-job/input-search-job.popup";
import { UnlockRequestInputSearchSettlementAdvancePopupComponent } from "../popup/input-search-settlement-advance/input-search-settlement-advance.popup";
import { CommonEnum } from "@enums";
import { SetUnlockRequestJobModel } from "@models";

@Component({
    selector: 'list-job-unlock-request',
    templateUrl: './list-job-unlock-request.component.html',
})
export class UnlockRequestListJobComponent extends AppList implements OnInit {
    @ViewChild(UnlockRequestInputSearchJobPopupComponent) inputSearchJobPopup: UnlockRequestInputSearchJobPopupComponent;
    @ViewChild(UnlockRequestInputSearchSettlementAdvancePopupComponent) inputSearchSettlementAdvancePopup: UnlockRequestInputSearchSettlementAdvancePopupComponent;
    @Input() unlockType: CommonEnum.UnlockTypeEnum;
    @Input() state: string = 'update';

    dataJobs: SetUnlockRequestJobModel[] = [];

    constructor(
        private _sortService: SortService,
        private _toastService: ToastrService
    ) {
        super();

    }

    ngOnInit(): void {
        this.headers = [
            { title: 'Unlock Name', field: 'unlockName', sortable: true },
            { title: 'Reason', field: 'reason', sortable: true }
        ];
    }

    addDetail() {
        console.log(this.unlockType);
        if (this.unlockType === CommonEnum.UnlockTypeEnum.ADVANCE || this.unlockType === CommonEnum.UnlockTypeEnum.SETTEMENT) {
            this.inputSearchSettlementAdvancePopup.unlockType = this.unlockType;
            this.inputSearchSettlementAdvancePopup.show();
        }
        if (this.unlockType === CommonEnum.UnlockTypeEnum.SHIPMENT || this.unlockType === CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE) {
            this.inputSearchJobPopup.show();
        }
    }

    onAddDetail(jobs: SetUnlockRequestJobModel[]) {
        console.log(jobs);
        if (!this.dataJobs.length) {
            this.dataJobs = [...jobs];
            this.inputSearchSettlementAdvancePopup.hide();
            this.inputSearchJobPopup.hide();
            return;
        }
        // if (!this.detectDuplicateCharge([...this.dataJobs, ...jobs])) {
        //     this.dataJobs = [...this.dataJobs, ...jobs];
        //     this.inputSearchSettlementAdvancePopup.hide();
        //     this.inputSearchJobPopup.hide();
        // } else {
        //     const jobArray = [...this.dataJobs, ...jobs].map(m => m.job);
        //     const jobDuplicate = this.utility.findDuplicates(jobArray);
        //     this._toastService.warning("Job/Advance/Settlement " + jobDuplicate.toString() + " has existed in list");
        //     return;
        // }
        var dataJobsTmp = this.dataJobs;
        var _dataJobsMerge = [...dataJobsTmp, ...jobs];
        const jobArray = _dataJobsMerge.map(m => m.job);
        const jobDuplicate = this.utility.findDuplicates(jobArray).filter((o, i, arr) => arr.findIndex(t => t === o) === i);;
        console.log(jobDuplicate);
        console.log(dataJobsTmp);
        if (!jobDuplicate.length) {
            this.dataJobs = [...dataJobsTmp, ...jobs];
            console.log(this.dataJobs);
            this.inputSearchSettlementAdvancePopup.hide();
            this.inputSearchJobPopup.hide();
        } else {
            dataJobsTmp = [];
            this._toastService.warning("Job/Advance/Settlement " + jobDuplicate.toString() + " has existed in list");
            return;
        }
    }

    detectDuplicateCharge(jobs: SetUnlockRequestJobModel[]) {
        if (!jobs.length) {
            return false;
        }
        return this.utility.checkDuplicateInObject('unlockName', jobs);
    }

    checkUncheckAllCharge() {
        for (const job of this.dataJobs) {
            job.isSelected = this.isCheckAll;
        }
    }

    onChangeCheckBoxCharge() {
        this.isCheckAll = this.dataJobs.every((item: SetUnlockRequestJobModel) => item.isSelected);
    }

    removeJob() {
        this.dataJobs = this.dataJobs.filter((item: SetUnlockRequestJobModel) => !item.isSelected);
        this.isCheckAll = false;
    }
}