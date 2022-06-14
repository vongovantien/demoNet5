import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter, Input } from "@angular/core";
import { SetUnlockRequestJobModel, UnlockJobCriteria } from "@models";
import { SettingRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";
import { CommonEnum } from "@enums";

@Component({
    selector: 'input-search-job-popup',
    templateUrl: './input-search-job.popup.html'
})
export class UnlockRequestInputSearchJobPopupComponent extends PopupBase {
    @Output() onInputJob: EventEmitter<SetUnlockRequestJobModel[]> = new EventEmitter<SetUnlockRequestJobModel[]>();
    @Input() unlockType: CommonEnum.UnlockTypeEnum;

    shipmentTypes = [
        { text: 'JOB ID', id: 'JOBID' },
        { text: 'MBL', id: 'MBL' },
        { text: 'Custom No', id: 'CUSTOMNO' }
    ];
    selectedShipmentType: string = '';
    shipmentSearch: string = '';
    dataJobs: SetUnlockRequestJobModel[] = [];

    constructor(
        private _settingRepo: SettingRepo,
        private _toastService: ToastrService,
    ) {
        super();
        this.selectedShipmentType = "JOBID";
    }

    ngOnInit() { }

    onChangeShipmentType(shipmentType: any) {
        this.selectedShipmentType = shipmentType.id;
    }

    add() {
        const keyword = !!this.shipmentSearch ? this.shipmentSearch.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null;
        const body: UnlockJobCriteria = {
            jobIds: this.selectedShipmentType === "JOBID" ? keyword : null,
            mbls: this.selectedShipmentType === "MBL" ? keyword : null,
            customNos: this.selectedShipmentType === "CUSTOMNO" ? keyword : null,
            advances: null,
            settlements: null,
            unlockTypeNum: this.unlockType
        };
        this._settingRepo.getJobToUnlockRequest(body)
            .subscribe(
                (res: SetUnlockRequestJobModel[]) => {
                    if (!!res && !!res.length) {
                        this.dataJobs = res;
                        this.onInputJob.emit(res);
                        // this.hide();
                    } else {
                        this._toastService.warning("Not found data");
                    }
                }
            );
    }

    closePopup() {
        this.hide();
    }
}