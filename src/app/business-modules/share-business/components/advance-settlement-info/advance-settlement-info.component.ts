import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { DocumentationRepo } from '@repositories';
import { AdvanceSettlementInfo } from '@models';

import { switchMap, takeUntil, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DestroyService } from '@services';

@Component({
    selector: 'advance-settlement-info',
    templateUrl: './advance-settlement-info.component.html',
    styleUrls: ['./advance-settlement-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})

export class ShareBusinessAdvanceSettlementInforComponent {

    adSetInfos: Observable<AdvanceSettlementInfo[]>;

    constructor(
        private _documentRepo: DocumentationRepo,
        private _activedRouter: ActivatedRoute,
        private readonly _destroy$: DestroyService
    ) { }

    ngOnInit() {
        this.adSetInfos = this._activedRouter.params.pipe(
            switchMap((param: Params) => this._documentRepo.getListAdvanceSettlement(!param.id ? param.jobId : param.id)),
            takeUntil(this._destroy$),
            shareReplay()
        ) as Observable<AdvanceSettlementInfo[]>;
    }
}