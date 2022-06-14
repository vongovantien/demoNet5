import { Component } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { AccountingRepo } from "@repositories";
import { catchError, finalize } from "rxjs/operators";
import { DeniedInfoResult } from "@models";
import { SortService } from "@services";

@Component({
    selector: 'history-denied-popup',
    templateUrl: './history-denied.popup.html'
})
export class HistoryDeniedPopupComponent extends PopupBase {
    infoDenieds: DeniedInfoResult[] = [];

    constructor(
        private _accountingRepo: AccountingRepo,
        private _sortService: SortService,
    ) {
        super();
        this.requestSort = this.sortHistoryDenied;
    }

    ngOnInit() {
        this.headers = [
            { title: 'No', field: 'no', sortable: true },
            { title: 'Name & Deny Time', field: 'nameAndTimeDeny', sortable: true },
            { title: 'Level Approval', field: 'levelApprove', sortable: true },
            { title: 'Comment', field: 'comment', sortable: true },
        ];
    }

    closePopup() {
        this.hide();
    }

    getDeniedComment(type: string, code: string) {
        if (type === 'Advance') {
            this._accountingRepo.getHistoryDeniedAdvancePayment(code)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        // this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res: any) => {
                        this.infoDenieds = res;
                    },
                );
        }

        if (type === 'Settlement') {
            this._accountingRepo.getHistoryDeniedSettlementPayment(code)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => {
                        // this._progressRef.complete();
                    })
                )
                .subscribe(
                    (res: any) => {
                        this.infoDenieds = res;
                    },
                );
        }
    }

    sortHistoryDenied(sort: string): void {
        this.infoDenieds = this._sortService.sort(this.infoDenieds, sort, this.order);
    }
}