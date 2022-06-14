import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

import { CatalogueRepo, SystemRepo } from '@repositories';
import { Partner, Office } from '@models';
import { CommonEnum } from '@enums';
import { User } from 'src/app/shared/models';
import { AppForm } from 'src/app/app.form';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { SearchListAccountReceivable } from '../../../account-receivable/store/actions';
import { getAccountReceivableSearchState, IAccountReceivableState } from '../../../account-receivable/store/reducers';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { SystemConstants } from '@constants';
import { getCurrentUserState } from '@store';

const OverDueDaysValues = [
    { from: null, to: null },
    { from: 1, to: 15 },
    { from: 16, to: 30 },
    { from: 30, to: null },
];
const DebitRatesValues = [
    { from: null, to: null },
    { from: 0, to: 50 },
    { from: 50, to: 70 },
    { from: 70, to: 100 },
    { from: 100, to: 120 },
    { from: 120, to: null },
    { from: null, to: null },
];

@Component({
    selector: 'form-search-account-receivable',
    templateUrl: './form-search-account-receivable.component.html'
})
export class AccountReceivableFormSearchComponent extends AppForm implements OnInit {

    // tslint:disable-next-line:no-any
    @Output() onSearch: EventEmitter<Partial<any>> = new EventEmitter<Partial<any>>();

    isSubmitted: boolean = false;

    formSearch: FormGroup;

    arType: CommonEnum.TabTypeAccountReceivableEnum;

    partnerId: AbstractControl;

    overdueDays: AbstractControl;
    fromOverdueDays: AbstractControl;
    toOverdueDays: AbstractControl;

    debitRate: AbstractControl;
    fromDebitRate: AbstractControl;
    toDebitRate: AbstractControl;

    agreementStatus: AbstractControl;

    agreementExpiredDays: AbstractControl;


    salesManId: AbstractControl;
    officalId: AbstractControl;

    partners: Observable<Partner[]>;
    salemans: Observable<User[]>;
    offices: any[] = [];
    partnerType: AbstractControl;
    officeIds: AbstractControl;


    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountNo', label: 'Partner ID' },
        { field: 'shortName', label: 'ABBR Name' },
        { field: 'partnerNameVn', label: 'Name Local' },
        { field: 'taxCode', label: 'Tax Code' },
    ];
    displayFieldsSalesMan: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameEn', label: 'Full Name' },
    ];
    displayFieldsOffice: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Abbr Name' },
        { field: 'branchNameEn', label: 'En Name' },
    ];

    overDueDays: CommonInterface.INg2Select[] = [
        { id: 0, text: 'All' },
        { id: 1, text: '01-15 days' },
        { id: 2, text: '16-30 days' },
        { id: 3, text: 'Over 30 days' },
    ];

    debitRates: CommonInterface.INg2Select[] = [
        { id: 0, text: 'All' },
        { id: 1, text: '0% - 50%' },
        { id: 2, text: '50% - 70%' },
        { id: 3, text: '70% - 100%' },
        { id: 4, text: '100% - 120%' },
        { id: 5, text: 'Over 120%' },
        { id: 6, text: 'Other' },
    ];
    agreementStatusList: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: 'Active', text: 'Active' },
        { id: 'Inactive', text: 'Inactive' },

    ];
    agreementExpiredDayList: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: 'Normal', text: 'Normal' },
        { id: '30Day', text: '< (-30) Days' },
        { id: '15Day', text: '< (-15) Days' },
        { id: 'Expried', text: 'Expired' },
    ];
    partnerTypes: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: 'Agent', text: 'Agent' },
        { id: 'Customer', text: 'Customer' },
    ];

    //partnerTypes:string[]=["All","Customer","Agent"]
    currentUser: SystemInterface.IClaimUser;
    staffList: any[] = [];
    staffsInit: any[] = [];
    staff: AbstractControl;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _store: Store<IAccountReceivableState>,
    ) {
        super();
        this.requestSearch = this.submitSearch;

    }

    ngOnInit(): void {
        this._store.select(getCurrentUserState)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
            (user: any) => {
                if (user && JSON.stringify(user) !== '{}') {
                    this.currentUser = user;
                    if(this.officeIds)
                        this.officeIds.setValue([this.currentUser.officeId]);
                    this.getOffices();
                    this.getAllStaff();

                    if(this.formSearch){
                        this.subscriptionSearchParamState();
                        //this.submitSearch();
                    }
                }
            }
        )
        this.initForm();
        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.salemans = this._systemRepo.getListSystemUser();
    }
    initForm() {
        this.formSearch = this._fb.group({
            partnerId: [],

            overdueDays: [this.overDueDays[0].id],
            fromOverdueDays: [],
            toOverdueDays: [],
            debitRate: [this.debitRates[0].id],
            fromDebitRate: [],
            toDebitRate: [],
            agreementStatus: [this.agreementStatusList[1].id],
            agreementExpiredDays: [this.agreementExpiredDayList[0].id],
            salesManId: [],
            officalId: [],
            partnerType: [this.partnerTypes[0].id],
            officeIds: [],
            staff:[]
        });

        this.partnerId = this.formSearch.controls["partnerId"];
        this.overdueDays = this.formSearch.controls["overdueDays"];
        this.fromOverdueDays = this.formSearch.controls["fromOverdueDays"];
        this.toOverdueDays = this.formSearch.controls["toOverdueDays"];
        this.debitRate = this.formSearch.controls["debitRate"];
        this.fromDebitRate = this.formSearch.controls["fromDebitRate"];
        this.toDebitRate = this.formSearch.controls["toDebitRate"];
        this.agreementStatus = this.formSearch.controls["agreementStatus"];
        this.agreementExpiredDays = this.formSearch.controls["agreementExpiredDays"];
        this.salesManId = this.formSearch.controls["salesManId"];
        this.officalId = this.formSearch.controls["officalId"];
        this.partnerType = this.formSearch.controls["partnerType"];
        this.officeIds = this.formSearch.controls["officeIds"];
        this.staff = this.formSearch.controls["staff"];

    }

    // tslint:disable-next-line:no-any
    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.partnerId.setValue(data.id);
                break;
            case 'salesMan':
                this.salesManId.setValue(data.id);
                break;
            case 'offical':
                this.officalId.setValue(data.id);
                break;
            case 'partnerType':
                this.partnerType.setValue(data.id);
                break;
            default:
                break;
        }
    }
    // tslint:disable-next-line:no-any
    onSelectBindingInput(item: any, fieldName: string) {
            switch (fieldName) {
                case 'OverDueDays':
                    if(item){
                        this.fromOverdueDays.setValue(item.id === 0 ? OverDueDaysValues[0].from : OverDueDaysValues[item.id].from);
                        this.toOverdueDays.setValue(item.id === 0 ? OverDueDaysValues[0].to : OverDueDaysValues[item.id].to);
                    }else{
                        this.fromOverdueDays.setValue("");
                        this.toOverdueDays.setValue("");
                    }
                    break;
                case 'DebitRates':
                    if(item){
                        this.fromDebitRate.setValue(item.id === 0 ? DebitRatesValues[0].from : DebitRatesValues[item.id].from);
                        this.toDebitRate.setValue(item.id === 0 ? DebitRatesValues[0].to : DebitRatesValues[item.id].to);
                    }else{
                        this.fromDebitRate.setValue("");
                        this.toDebitRate.setValue("");
                    }
                    break;
                default:
                    break;
            }
    }

    resetSearch() {
        this.formSearch.patchValue(Object.assign({}));
        this._store.dispatch(SearchListAccountReceivable(Object.assign({})));
        this.initForm();
        this.submitSearch();
    }

    submitSearch() {
        // tslint:disable-next-line:no-any
        const dataForm: { [key: string]: any } = this.formSearch.getRawValue();
        this.isSubmitted = true;
        // if (dataForm.toDebitRate < dataForm.fromDebitRate) {
        //     return;
        // }
        const body: AccountingInterface.IAccReceivableSearch = {
            arType: this.arType,
            acRefId: dataForm.partnerId,
            overDueDay: dataForm.overdueDays? dataForm.overdueDays : 0,
            debitRateFrom: dataForm.fromDebitRate,
            debitRateTo: dataForm.toDebitRate,
            agreementStatus: dataForm.agreementStatus?dataForm.agreementStatus:this.agreementStatusList[1].id,
            agreementExpiredDay: dataForm.agreementExpiredDays,
            salesmanId: dataForm.salesManId,
            officeId: dataForm.officalId,
            fromOverdueDays: dataForm.fromOverdueDays,
            toOverdueDays: dataForm.toOverdueDays,
            debitRate: dataForm.debitRate,
            partnerType:dataForm.partnerType,
            officeIds: !!dataForm.officeIds ? this.getOfficeSearch(dataForm.officeIds) : null,
            staffs:!!dataForm.staff ? dataForm.staff: null
        };

        this._store.dispatch(SearchListAccountReceivable(body));
        this.onSearch.emit(body);
    }

    subscriptionSearchParamState() {
        this._store.select(getAccountReceivableSearchState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (data: any) => {
                    if (data) {
                        let formData: any = {
                            partnerId: data.acRefId ? data.acRefId : null,
                            overdueDays: data.overDueDay ? data.overDueDay : this.overDueDays[0].id,
                            fromDebitRate: data.debitRateFrom ? data.debitRateFrom : null,
                            toDebitRate: data.debitRateTo ? data.debitRateTo : null,
                            agreementStatus: data.agreementStatus ? data.agreementStatus : this.agreementStatusList[1].id,
                            agreementExpiredDays: data.agreementExpiredDay ? data.agreementExpiredDay : this.agreementExpiredDayList[0].id,
                            salesManId: data.salesmanId ? data.salesmanId : null,
                            officalId: data.officeId ? data.officeId : null,
                            fromOverdueDays: data.fromOverdueDays ? data.fromOverdueDays : null,
                            toOverdueDays: data.toOverdueDays ? data.toOverdueDays : null,
                            debitRate: data.debitRate ? data.debitRate : this.debitRates[0].id,
                            partnerType: data.partnerType ? data.partnerType : this.partnerTypes[0].id,
                            officeIds:data.officeIds?data.officeIds:null,
                            staff:data.staffs?data.staffs:null
                        };
                        this.formSearch.patchValue(formData);
                    }
                }
            );
    }
    getAllStaff() {
        this._systemRepo.getUserLevelByType({ type: 'All' })
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (staff: any) => {
                    this.staffsInit = staff;
                    this.getStaff(staff);
                },
            );
    }
    getStaff(data: any) {
        this.staffList = data
            .map(item => ({ text: item.userName, id: item.userId }))
            .filter((g, i, arr) => arr.findIndex(t => t.id === g.id) === i); // Distinct user
    }
    getOfficeSearch(office: []){
        let strOffice = [];
        if (office.length > 0) {
            office.forEach(element => {
                strOffice.push(element);
            });
        }else{
            this.offices.forEach((item: Office)=> strOffice.push(item.id));
        }
        return strOffice;
    }
    getOffices() {
        this._systemRepo.getListOfficesByUserId(this.currentUser.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: Office[]) => {
                    this.offices = res;
                },
            );
    }

    collapsed() {
        this.resetFormControl(this.overdueDays)
        this.resetFormControl(this.fromOverdueDays)
        this.resetFormControl(this.toOverdueDays)
        this.resetFormControl(this.debitRate)
        this.resetFormControl(this.fromDebitRate)
        this.resetFormControl(this.toDebitRate)
        this.resetFormControl(this.agreementStatus)
        this.resetFormControl(this.agreementExpiredDays)
        this.resetFormControl(this.salesManId)
        this.resetFormControl(this.officalId)
        this.resetFormControl(this.partnerType)
    }

    expanded() {
        this.subscriptionSearchParamState();
    }
}

