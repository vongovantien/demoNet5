import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { CommonEnum } from '@enums';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountReceivableListTrialOfficialComponent } from '../components/list-trial-official/list-trial-official-account-receivable.component';
import { AccountReceivableListGuaranteedComponent } from '../components/list-guaranteed/list-guaranteed-account-receivable.component';
import { AccountReceivableListOtherComponent } from '../components/list-other/list-other-account-receivable.component';
import { AccountReceivableFormSearchComponent } from '../components/form-search/account-receivable/form-search-account-receivable.component';
import { RoutingConstants } from '@constants';
import { getAccountReceivablePagingState, getAccountReceivableSearchState, IAccountReceivableState, getAccountReceivableListState } from './store/reducers';
import { Store } from '@ngrx/store';
import { getCurrentUserState, getMenuUserSpecialPermissionState } from '@store';
import { AccountReceivableNoAgreementComponent } from '../components/list-no-agreement/list-no-agreement-account-receivable.component';

@Component({
    selector: 'app-account-receivable',
    templateUrl: './account-receivable.component.html',
})
export class AccountReceivableTabComponent extends AppList implements OnInit {

    @ViewChild(AccountReceivableListTrialOfficialComponent) trialOfficalListComponent: AccountReceivableListTrialOfficialComponent;
    @ViewChild(AccountReceivableListGuaranteedComponent) guaranteedListComponent: AccountReceivableListGuaranteedComponent;
    @ViewChild(AccountReceivableListOtherComponent) otherListComponent: AccountReceivableListOtherComponent;

    @ViewChild(AccountReceivableFormSearchComponent) accountReceivableFormComponent: AccountReceivableFormSearchComponent;
    @ViewChild(AccountReceivableNoAgreementComponent) noAgreementListComponent: AccountReceivableNoAgreementComponent;


    selectedSubTab: string = null;

    activeTrialOffice: boolean = false;
    activeGuaranteed: boolean = false;
    activeOther: boolean = false;
    totalAr: any = 0;

    constructor(
        private _router: Router,
        private _activeRouter: ActivatedRoute,
        private _cd: ChangeDetectorRef,
        private _store: Store<IAccountReceivableState>
    ) {
        super();
    }

    ngOnInit() {
        this._store.select(getCurrentUserState).subscribe((c) => this.currentUser = c);
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
    }
    ngAfterViewInit() {
        this._activeRouter
            .queryParams
            .pipe(takeUntil(this.ngUnsubscribe))
            // tslint:disable-next-line:no-any
            .subscribe((param: { [key: string]: any }) => {
                // if (param.subTab) {
                //     this.selectedSubTab = param.subTab.toUpperCase();
                // } else {
                     //this.selectedSubTab = 'trial_official'.toUpperCase();
                //     this.setParameterToPagingTab(CommonEnum.TabTypeAccountReceivableEnum.TrialOrOffical, this.trialOfficalListComponent);
                // }
                if(this.selectedSubTab == null){
                    this.selectedSubTab = 'trial_official'.toUpperCase();
                }
            });
        this._cd.detectChanges();
    }

    onSearchReceivable(body: AccountingInterface.IAccReceivableSearch) {

        switch (body.arType) {
            case CommonEnum.TabTypeAccountReceivableEnum.TrialOrOffical:
                this.setParameterToSearch(body, this.trialOfficalListComponent);
                break;
            case CommonEnum.TabTypeAccountReceivableEnum.Guarantee:
                this.setParameterToSearch(body, this.guaranteedListComponent);
                break;
            case CommonEnum.TabTypeAccountReceivableEnum.Other:
                this.setParameterToSearch(body, this.otherListComponent);
                break;
            case CommonEnum.TabTypeAccountReceivableEnum.NoAgreement:
                    this.setParameterToSearch(body, this.noAgreementListComponent);
                break;
            default:
                break;
        }
    }

    changeTabAccount(tab: string) {
        if (tab === 'PAYMENT') {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}`]);
        }
        if (tab === 'HISTORY') {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/history-payment`]);
        }
    }

    // tslint:disable-next-line:no-any
    setParameterToSearch(dataSearch: AccountingInterface.IAccReceivableSearch, tabComponent: any) {
        tabComponent.dataSearch = dataSearch;
        tabComponent.getPagingList();
    }

    onSelectTabAccountReceivable(tabname: string) {
        this.selectedSubTab = tabname;

        if (tabname === 'TRIAL_OFFICIAL') {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`]);

            this.setParameterToPagingTab(CommonEnum.TabTypeAccountReceivableEnum.TrialOrOffical, this.trialOfficalListComponent);
        } else if (tabname === 'GUARANTEED') {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`], { queryParams: { subTab: 'guaranteed' } });

            this.setParameterToPagingTab(CommonEnum.TabTypeAccountReceivableEnum.Guarantee, this.guaranteedListComponent);
        } else if (tabname === 'NO_AGREEMENT') {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`], { queryParams: { subTab: 'noAgreement' } });

            this.setParameterToPagingTab(CommonEnum.TabTypeAccountReceivableEnum.NoAgreement, this.noAgreementListComponent);
        } else {
            this._router.navigate([`${RoutingConstants.ACCOUNTING.ACCOUNT_RECEIVABLE_PAYABLE}/summary`], { queryParams: { subTab: 'orther' } });

            this.setParameterToPagingTab(CommonEnum.TabTypeAccountReceivableEnum.Other, this.otherListComponent);

        }

        this.accountReceivableFormComponent.formSearch.patchValue(Object.assign({}));
        this.accountReceivableFormComponent.initForm();
    }

    // tslint:disable-next-line:no-any
    setParameterToPagingTab(tab: CommonEnum.TabTypeAccountReceivableEnum, tabComponent: any) {
        this.accountReceivableFormComponent.arType = tab;

        this._store.select(getAccountReceivableSearchState)
            .pipe(
                withLatestFrom(this._store.select(getAccountReceivablePagingState)),
                takeUntil(this.ngUnsubscribe),
                map(([dataSearch, pagingData]) => ({ page: pagingData.page, pageSize: pagingData.pageSize, dataSearch: dataSearch }))
            )
            .subscribe(
                (data) => {
                    if (data.dataSearch) {
                        this.dataSearch = data.dataSearch;
                        this.dataSearch.arType = tab;
                    } else {
                        let body: AccountingInterface.IAccReceivableSearch = {
                            arType: tab,
                            acRefId: null,
                            overDueDay: 0,
                            debitRateFrom: null,
                            debitRateTo: null,
                            agreementStatus: "Active",
                            agreementExpiredDay: 'All',
                            salesmanId: null,
                            officeId: null,
                            fromOverdueDays: null,
                            toOverdueDays: null,
                            debitRate: 0,
                            partnerType: "All",
                            staffs: null,
                            officeIds: null
                        };
                        this.dataSearch = body;
                    }
                });
        tabComponent.dataSearch = this.dataSearch;
        this.onSearchReceivable(this.dataSearch);

    }
    onTotalAr(total){
        if (this.selectedSubTab==='TRIAL_OFFICIAL')
            this.totalAr = total;
    }
}
