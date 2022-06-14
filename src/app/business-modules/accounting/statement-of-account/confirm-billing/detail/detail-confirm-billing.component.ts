import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AccountingRepo, CatalogueRepo, ExportRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { AccAccountingManagementModel, Partner, ChartOfAccounts } from '@models';
import { RoutingConstants, AccountingConstants } from '@constants';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import isUUID from 'validator/lib/isUUID';
import { AppForm } from '@app';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { CommonEnum } from '@enums';
import { ConfirmBillingListChargeComponent } from '../../components/list-charge-confirm-billing/list-charge-confirm-billing.component';
import { Store } from '@ngrx/store';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';

@Component({
    selector: 'detail-confirm-billing',
    templateUrl: './detail-confirm-billing.component.html',
})
export class ConfirmBillingDetailComponent extends AppForm implements OnInit {
    @ViewChild(ConfirmBillingListChargeComponent, { static: false }) listChargeComponent: ConfirmBillingListChargeComponent;
    vatInvoiceId: string;
    accountingManagement: AccAccountingManagementModel = new AccAccountingManagementModel();

    formGroup: FormGroup;
    partnerId: AbstractControl;
    personalName: AbstractControl;
    partnerAddress: AbstractControl;
    totalExchangeRate: AbstractControl;
    voucherId: AbstractControl;
    date: AbstractControl;
    invoiceNoTempt: AbstractControl;
    invoiceNoReal: AbstractControl;
    serie: AbstractControl;
    accountNo: AbstractControl;
    status: AbstractControl;
    description: AbstractControl;
    paymentTerm: AbstractControl;
    totalAmount: AbstractControl;
    attachDocInfo: AbstractControl;
    paymentMethod: AbstractControl;
    currency: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameVn', label: 'Name Local' },
        { field: 'taxCode', label: 'Tax Code' },
    ];
    paymentMethods: string[] = AccountingConstants.PAYMENT_METHOD;

    displayFieldsChartAccount: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountCode', label: 'Account Code' },
        { field: 'accountNameLocal', label: 'Account Name Local' },
    ];

    partners: Observable<Partner[]>;
    listCurrency: any[] = [];
    chartOfAccounts: Observable<ChartOfAccounts[]>;

    isDisabled: boolean = true;

    constructor(
        protected _router: Router,
        protected _toastService: ToastrService,
        protected _accountingRepo: AccountingRepo,
        private _activedRoute: ActivatedRoute,
        private _ngProgressService: NgProgress,
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>,
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit(): void {
        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        this.initForm();
        this._activedRoute.params.pipe(
            tap((param: Params) => {
                this.vatInvoiceId = !!param.vatInvoiceId ? param.vatInvoiceId : '';
            }),
            switchMap(() => of(this.vatInvoiceId)),
        )
            .subscribe(
                (vatInvoiceId: string) => {
                    if (isUUID(vatInvoiceId)) {
                        this.getDetailVatInvoice(vatInvoiceId);
                    } else {
                        this.gotoList();
                    }
                }
            );
    }

    initForm() {
        this.formGroup = this._fb.group({
            partnerId: [],
            personalName: [],
            partnerAddress: [],
            description: [],
            totalExchangeRate: [],
            voucherId: [],
            date: [],
            invoiceNoTempt: [],
            invoiceNoReal: [{ value: null, disabled: true }],
            serie: [],
            accountNo: [],
            status: [],
            paymentTerm: [],
            totalAmount: [],
            attachDocInfo: [],
            paymentMethod: [],
            currency: []
        });

        this.partnerId = this.formGroup.controls['partnerId'];
        this.personalName = this.formGroup.controls['personalName'];
        this.partnerAddress = this.formGroup.controls['partnerAddress'];
        this.voucherId = this.formGroup.controls['voucherId'];
        this.invoiceNoTempt = this.formGroup.controls['invoiceNoTempt'];
        this.invoiceNoReal = this.formGroup.controls['invoiceNoReal'];
        this.date = this.formGroup.controls['date'];
        this.serie = this.formGroup.controls['serie'];
        this.accountNo = this.formGroup.controls['accountNo'];
        this.status = this.formGroup.controls['status'];
        this.totalExchangeRate = this.formGroup.controls['totalExchangeRate'];
        this.description = this.formGroup.controls['description'];
        this.paymentTerm = this.formGroup.controls['paymentTerm'];
        this.totalAmount = this.formGroup.controls['totalAmount'];
        this.attachDocInfo = this.formGroup.controls['attachDocInfo'];
        this.paymentMethod = this.formGroup.controls['paymentMethod'];
        this.currency = this.formGroup.controls['currency'];

        this.formGroup.disable({ onlySelf: true });

        this.partners = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.ALL);
        this.chartOfAccounts = this._catalogueRepo.getListChartOfAccounts();
        this.getCurrency();
    }

    getCurrency() {
        this._catalogueRepo.getListCurrency()
            .pipe(catchError(this.catchError))
            .subscribe(
                (dataCurrency: any) => {
                    this.getCurrencyData(dataCurrency);
                },
            );
    }

    getCurrencyData(data: any) {
        this.listCurrency = (data).map((item: any) => ({ id: item.id, text: item.id }));
    }

    getDetailVatInvoice(id: string) {
        this._accountingRepo.getDetailAcctMngt(id)
            .subscribe(
                (res: AccAccountingManagementModel) => {
                    if (!!res) {
                        this.accountingManagement = new AccAccountingManagementModel(res);
                        this.formGroup.patchValue(this.accountingManagement);

                        this.listChargeComponent.charges = this.accountingManagement.charges;
                        this.listChargeComponent.totalAmountVnd = this.accountingManagement.charges.reduce((sum, current) => sum + current.amountVnd + current.vatAmountVnd, 0);
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.ACCOUNTING.STATEMENT_OF_ACCOUNT}/confirm-billing`]);
    }

}
