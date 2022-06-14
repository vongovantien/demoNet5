import { Component, Output, EventEmitter, Input } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { CommonEnum } from "@enums";
import { UnlockJobCriteria, SetUnlockRequestJobModel } from "@models";
import { SettingRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'input-search-settlement-advance-popup',
    templateUrl: './input-search-settlement-advance.popup.html'
})
export class UnlockRequestInputSearchSettlementAdvancePopupComponent extends PopupBase {
    @Output() onInputAdvanceOrSettlement: EventEmitter<SetUnlockRequestJobModel[]> = new EventEmitter<SetUnlockRequestJobModel[]>();
    @Input() unlockType: CommonEnum.UnlockTypeEnum;
    settlementAdvanceSearch: string = '';

    constructor(
        private _settingRepo: SettingRepo,
        private _toastService: ToastrService,
    ) {
        super();
    }

    ngOnInit() { }

    add() {
        const keyword = !!this.settlementAdvanceSearch ? this.settlementAdvanceSearch.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null;
        const body: UnlockJobCriteria = {
            jobIds: null,
            mbls: null,
            customNos: null,
            advances: this.unlockType === CommonEnum.UnlockTypeEnum.ADVANCE ? keyword : null,
            settlements: this.unlockType === CommonEnum.UnlockTypeEnum.SETTEMENT ? keyword : null,
            unlockTypeNum: this.unlockType
        };
        this._settingRepo.checkExistVoucherInvoiceOfSettlementAdvance(body).subscribe(
            (result: any) => {
                console.log(result);
                if (!result.success) {
                    this._toastService.warning(result.message);
                } else {
                    this._settingRepo.getJobToUnlockRequest(body)
                        .subscribe(
                            (res: SetUnlockRequestJobModel[]) => {
                                if (!!res && !!res.length) {
                                    this.onInputAdvanceOrSettlement.emit(res);
                                    // this.hide();
                                } else {
                                    this._toastService.warning("Not found data");
                                }
                            }
                        );
                }
            }
        );

    }

    closePopup() {
        this.hide();
    }
}