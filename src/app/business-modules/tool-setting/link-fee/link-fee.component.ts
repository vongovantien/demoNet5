import { Component, OnInit, ViewChild } from '@angular/core';
import { RuleLinkFee } from 'src/app/shared/models/tool-setting/rule-link-fee';
import { SettingRepo } from 'src/app/shared/repositories';
import { map, catchError, finalize } from 'rxjs/operators';
import { NgProgress } from '@ngx-progressbar/core';
import { SortService } from 'src/app/shared/services';
import { ConfirmPopupComponent, Permission403PopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { AppList } from 'src/app/app.list';
import { FormRuleComponent } from './components/form-rule/form-rule.component';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';
import { I } from '@angular/cdk/keycodes';
@Component({
    selector: 'app-link-fee',
    templateUrl: './link-fee.component.html',
})
export class LinkFeeComponent extends AppList implements OnInit {
    @ViewChild(FormRuleComponent) formRule: FormRuleComponent;
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent) permission403Popup: Permission403PopupComponent;

    rules: RuleLinkFee[] = [];
    headers: CommonInterface.IHeaderTable[] = [];

    indexRuleToDelete: string = '';
    constructor(
        private _settingRepo: SettingRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchRule;
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {
        this.headers = [
            { field: 'ruleName', title: 'Rule Name', sortable: true },
            { field: 'serviceBuying', title: 'Service Buying', sortable: true },
            { field: 'chargeNameBuying', title: 'Charge Buying', sortable: true },
            { field: 'partnerNameBuying', title: 'Partner Buying', sortable: true },
            { field: 'serviceSelling', title: 'Service Selling', sortable: true },
            { field: 'chargeNameSelling', title: 'Charge Selling', sortable: true },
            { field: 'partnerSelling', title: 'Partner Selling', sortable: true },
            { field: 'userNameCreated', title: 'Creator', sortable: true },
            { field: 'modifiedDate', title: 'Modified Date', sortable: true },
            { field: 'status', title: 'Status', sortable: true },
            { field: 'effectiveDate', title: 'Effective Date', sortable: true },
            { field: 'expiredDate', title: 'Expiration Date', sortable: true },
        ];
        this.searchRule();
    }

    onSearchRule(data: any) {
        this.page = 1;
        this.dataSearch = data;
        this.searchRule();
    }

    searchRule() {
        this.isLoading = true;
        this._progressRef.start();
        this._settingRepo.getRule(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    return {
                        data: (data.data || []).map((item: RuleLinkFee) => new RuleLinkFee(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.rules = res.data.forEach(element => {
                        element.serviceBuying = this.convertServiceName(element.serviceBuying),
                            element.serviceSelling = this.convertServiceName(element.serviceSelling),
                            element.partnerNameSelling = element.partnerNameSelling != null ? element.partnerNameSelling : "All"
                    });
                    this.rules = res.data || [];
                },
            );
    }

    sortLocal(sort: string): void {
        this.rules = this._sortService.sort(this.rules, sort, this.order);
    }

    onDeleteRule(rule: RuleLinkFee) {
        this._progressRef.start();

        this.indexRuleToDelete = rule.id.toUpperCase();
        this.confirmDeletePopup.show();
    }

    deleteRule() {

        this._settingRepo.deleteRule(this.indexRuleToDelete)
            .pipe(
                finalize(() => { this._progressRef.complete(); this.confirmDeletePopup.hide(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.resetSearch();
                    } else {
                        this._toastService.error(res.message);
                    }
                });
    }

    convertServiceName(serviceCode: string) {
        switch (serviceCode) {
            case 'AI':
                return 'Air Import';
            case 'CL':
                return 'Custom Logistic';
            case 'AE':
                return 'Air Export';
            case 'SFE':
                return 'Sea FCL Export';
            case 'SFI':
                return 'Sea FCL Import';
            case 'SLE':
                return 'Sea LCL Export';
            case 'SLI':
                return 'Sea LCL Import';
            case 'IT':
                return 'Inland Trucking';
            case 'SCE':
                return 'Sea Consol Export';
            case 'SCI':
                return 'Sea Consol Import';
            default:
                break;
        }
    }

    getRuleDetail(id: string) {
        this.formRule.getChargeBuying();
        this.formRule.getChargeSelling();
        this._settingRepo.getDetailRule(id)
            .pipe()
            .subscribe(
                (res: RuleLinkFee) => {
                    if (!!res) {
                        this.formRule.formGroup.patchValue({
                            serviceBuying: this.getCurrentService(res.serviceBuying),
                            serviceSelling: this.getCurrentService(res.serviceSelling),
                            ruleName: res.ruleName,
                        }
                        );
                        this.formRule.title = 'Detail/Edit Rule';
                        this.formRule.rule.ruleName = res.ruleName;
                        this.formRule.rule.id = id;
                        this.formRule.datetimeCreated = res.datetimeCreated;
                        this.formRule.userNameCreated = res.userNameCreated;
                        this.formRule.datetimeModified = res.datetimeModified;
                        this.formRule.userNameModified = res.userNameModified;
                        this.formRule.minDateEffective = this.minDate;
                        this.formRule.rule.expiredDate = res.expiredDate;
                        this.formRule.rule.effectiveDate = res.effectiveDate;
                        this.formRule.rule.partnerBuying = res.partnerBuying;
                        this.formRule.rule.partnerSelling = res.partnerSelling;
                        this.formRule.rule.chargeBuying = res.chargeBuying;
                        this.formRule.rule.chargeSelling = res.chargeSelling;
                        this.formRule.status.setValue(res.status);
                        if (res.expiredDate != null) {
                            this.formRule.expiredDate.setValue({ startDate: new Date(res.expiredDate) });
                        }
                        this.formRule.effectiveDate.setValue({ startDate: new Date(res.effectiveDate) });
                        let chargeBuying = this.formRule.configChargeBuying.dataSource.find(
                            x => x.id === res.chargeBuying
                        );
                        let chargeSelling = this.formRule.configChargeSelling.dataSource.find(
                            x => x.id === res.chargeSelling
                        );
                        let partnerBuying = this.formRule.configPartner.dataSource.find(
                            x => x.id === res.partnerBuying
                        );
                        let partnerSelling = this.formRule.configPartner.dataSource.find(
                            x => x.id === res.partnerSelling
                        );
                        this.formRule.selectedChargeBuying =
                            { field: 'id', value: chargeBuying?.id, data: chargeBuying };
                        this.formRule.selectedChargeSelling =
                            { field: 'id', value: chargeSelling?.id, data: chargeSelling };
                        this.formRule.selectedPartnerBuying =
                            { field: 'shortName', value: partnerBuying?.shortName };
                        this.formRule.selectedPartnerSelling =
                            { field: 'shortName', value: partnerSelling?.shortName };
                        console.log(this.formRule.selectedChargeBuying);
                        this.formRule.isShowUpdate = true;
                        this.formRule.show();
                    }
                }
            );
    }

    getCurrentService(res: any) {
        let currService: any;
        currService = this.formRule.services.find(
            x => x.id === res
        );
        return currService;
    }

    showCreateRule() {
        this.formRule.title = 'Add new Rule Link Fee';
        this.formRule.formGroup.reset();
        this.formRule.selectedChargeBuying = { field: 'id', value: null };
        this.formRule.selectedChargeSelling = { field: 'id', value: null };
        this.formRule.selectedPartnerBuying = { field: 'shortName', value: null, data: null };
        this.formRule.selectedPartnerSelling = { field: 'shortName', value: null, data: null };
        this.formRule.isBuying = true;
        this.formRule.isSelling = true;
        this.formRule.isShowUpdate = false;
        this.formRule.minDateEffective = this.minDate;
        this.formRule.minDateExpired = this.minDate;
        this.formRule.show();
    }

    resetSearch() {
        this.dataSearch = {};
        this.page = 1;
        this.searchRule();
    }

}