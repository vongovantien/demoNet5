import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { SortService, DataService } from '@services';
import { ConfirmPopupComponent } from '@common';
import { delayTime } from '@decorators';
import { ChargeOfAccountingManagementModel } from '@models';
import { InjectViewContainerRefDirective } from '@directives';
import { AccountingRepo } from '@repositories';
import { AppList } from '@app';
import { IAccountingManagementState, getAccountingManagementPartnerChargeState, getAccoutingManagementPartnerState, IAccountingManagementPartnerState, getAccountingManagementGeneralExchangeRate } from '../../store';

import { switchMap, takeUntil, withLatestFrom, map, filter, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'list-charge-accounting-management',
    templateUrl: './list-charge-accounting-management.component.html',
})
export class AccountingManagementListChargeComponent extends AppList implements OnInit {
    @Input() set type(t: string) {
        this._type = t;
        if (this._type !== 'invoice') {
            this.headers = [
                { title: 'Code', field: 'chargeCode', sortable: true, },
                { title: 'Charge Name', field: 'chargeName', sortable: true, },
                { title: 'Job No', field: 'jobNo', sortable: true },
                { title: 'HBL', field: 'hbl', sortable: true },
                { title: 'Contra Account', field: 'contraAccount', sortable: true },
                { title: 'Org Amount', field: 'orgAmount', sortable: true },
                { title: 'VAT', field: 'vat', sortable: true },
                { title: 'Org VAT Amount', field: 'orgVatAmount', sortable: true },
                { title: 'VAT Account', field: 'vatAccount', sortable: true },
                { title: 'Currency', field: 'currency', sortable: true },
                { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
                { title: 'Amount(VND)', field: 'amountVnd', sortable: true },
                { title: 'VAT Amount(VND)', field: 'vatAmountVnd', sortable: true },
                { title: 'Invoice No', field: 'invoiceNo', sortable: true, width: 100 },
                { title: 'Serie', field: 'serie', sortable: true, width: 100 },
                { title: 'Invoice Date', field: 'invoiceDate', sortable: true, width: 150 },
                { title: 'OBH Partner', field: 'obhPartner', sortable: true },
                { title: 'VAT Partner ID', field: 'vatPartnerCode', sortable: true },
                { title: 'VAT Partner', field: 'vatPartnerName', sortable: true },
                { title: 'Debit Note', field: 'cdNoteNo', sortable: true },
                { title: 'SOA No', field: 'soaNo', sortable: true },
                { title: 'Settlement No', field: 'settlementCode', sortable: true },
                { title: 'Qty', field: 'qty', sortable: true },
                { title: 'Unit', field: 'unitName', sortable: true },
                { title: 'Unit Price', field: 'unitPrice', sortable: true },
                { title: 'MBL', field: 'mbl', sortable: true },
                { title: 'Synced From', field: 'syncedFromBy', sortable: true },
            ];
        }
    }

    get type() {
        return this._type;
    }

    private _type: string = 'invoice';

    @ViewChild(InjectViewContainerRefDirective) templateInject: InjectViewContainerRefDirective

    charges: ChargeOfAccountingManagementModel[] = [];

    // * totalAmountVatVnd = totalAmountVnd + vatAmountVnd
    totalAmountVnd: number;
    totalAmountVat: number;

    contentConfirmRemoveCharge: string;

    headers: CommonInterface.IHeaderTable[] = [
        { title: 'Code', field: 'chargeCode', sortable: true, },
        { title: 'Charge Name', field: 'chargeName', sortable: true, },
        { title: 'Job No', field: 'jobNo', sortable: true },
        { title: 'HBL', field: 'hbl', sortable: true },
        { title: 'Contra Account', field: 'contraAccount', sortable: true },
        { title: 'Org Amount', field: 'orgAmount', sortable: true },
        { title: 'VAT', field: 'vat', sortable: true },
        { title: 'Org VAT Amount', field: 'orgVatAmount', sortable: true },
        { title: 'VAT Account', field: 'vatAccount', sortable: true },
        { title: 'Currency', field: 'currency', sortable: true },
        { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
        { title: 'Amount(VND)', field: 'amountVnd', sortable: true, width: 150 },
        { title: 'VAT Amount(VND)', field: 'vatAmountVnd', sortable: true },
        { title: 'VAT Partner ID', field: 'vatPartnerCode', sortable: true },
        { title: 'VAT Partner', field: 'vatPartnerName', sortable: true },
        { title: 'Debit Note', field: 'cdNoteNo', sortable: true },
        { title: 'SOA No', field: 'soaNo', sortable: true },
        { title: 'Qty', field: 'qty', sortable: true },
        { title: 'Unit', field: 'unitName', sortable: true },
        { title: 'Unit Price', field: 'unitPrice', sortable: true },
        { title: 'MBL', field: 'mbl', sortable: true },
    ];

    isReadOnly: boolean = false;

    listAmountDefault: IListChargeAmountDefault[] = [];
    titleErrorRangeAmount: string = 'New value is grather than previous value over (+/-1000 VND)';

    currentVoucherPartnerInfo: IAccountingManagementPartnerState;
    currentListChargeFromNewState: ChargeOfAccountingManagementModel[];

    constructor(
        private _sortService: SortService,
        private _store: Store<IAccountingManagementState>,
        private _toastService: ToastrService,
        private _dataService: DataService,
        private _accountingRepo: AccountingRepo
    ) {
        super();
        this.requestSort = this.sortCharges;
    }

    ngOnInit(): void {
        // * Listen charge state from Store.
        this._store.select(getAccountingManagementPartnerChargeState)
            .pipe(
                withLatestFrom(this._store.select(getAccoutingManagementPartnerState)),
                map(([charges, partnerInfo]) => {
                    if (this.type === 'invoice') {
                        return charges;
                    }
                    if (!this.currentVoucherPartnerInfo?.partnerId) {
                        this.currentVoucherPartnerInfo = partnerInfo;
                    }
                    if (!!this.currentVoucherPartnerInfo.partnerId && partnerInfo.partnerId !== this.currentVoucherPartnerInfo.partnerId) {
                        this.currentListChargeFromNewState = charges;
                        return false;
                    }
                    return charges; // ? RETURN ERROR => WITH CASE VOUCHER HAD BEEN ISSUED ANOTHER PARTNER.
                }),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (charges: ChargeOfAccountingManagementModel[] | boolean | unknown) => {
                    if (charges === false) {
                        this.showPopupDynamicRender(ConfirmPopupComponent, this.templateInject.viewContainerRef, {
                            title: 'Warning',
                            body: `There exists another partner in your selected data. Please press "OK" if you want to continue.  <br/>
                                Tồn tại đối tượng thanh toán khác trong dữ liệu bạn vừa chọn. Vui lòng chọn <span class="font-weight-bold">OK</span> nếu bạn muốn tiếp tục.`,
                            labelConfirm: 'Ok'
                        }, () => {
                            if (!!this.currentListChargeFromNewState?.length) {
                                this.updateTableListCharge(this.currentListChargeFromNewState);
                            }
                        })
                    } else {
                        this.updateTableListCharge(charges);
                    }
                },
                (err) => {
                    console.log(err);
                }
            );

        // * Listen general Exchange rate 
        this.listenGeneralExchangeRateChange();
    }

    listenGeneralExchangeRateChange() {
        this._store.select(getAccountingManagementGeneralExchangeRate)
            .pipe(
                filter(x => x !== null),
                switchMap((res: any) => {
                    if (!!this.charges.length) {
                        const chargesCpyToModified = cloneDeep(this.charges);
                        chargesCpyToModified.forEach(c => {
                            // * From mask to model
                            if (!!c.invoiceDate) {
                                const [day, month, year]: string[] = c.invoiceDate.split("/");
                                c.invoiceDate = formatDate(new Date(+year, +month - 1, +day), 'yyyy-MM-dd', 'en');
                            } else {
                                c.invoiceDate = null;
                            }
                            // ? Chỉ Update ExcRate cho những charge có Currency != VND && Type != OBH
                            if (c.currency !== 'VND' && c.chargeType !== 'OBH') {
                                c.exchangeRate = res; // * for Display
                                c.finalExchangeRate = res; // * for Calculating
                            }
                        });
                        return this._accountingRepo.calculateListChargeAccountingMngt(chargesCpyToModified).pipe(
                            catchError(error => of(false))
                        );
                    }
                    return of(false);
                }),
                takeUntil(this.ngUnsubscribe),
            ).subscribe(
                (data: IChargeAccountingMngtTotal) => {
                    if (!!data) {
                        if (data?.charges?.length) {
                            data.charges.forEach(c => {
                                if (!!c.invoiceDate) {
                                    if (new Date(c.invoiceDate).toString() !== "Invalid Date") {
                                        c.invoiceDate = formatDate(new Date(c.invoiceDate), 'dd/MM/yyyy', 'en');
                                    }
                                }
                            })
                            this.charges = [...data.charges];
                            this.totalAmountVnd = data.totalAmountVnd;
                            this.totalAmountVat = data.totalAmountVat;
                            this._toastService.success("Exchange Rate synced successfully");
                        }
                    } else {
                        this._toastService.success("Exchange Rate synced fail, please check again!");
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
    }

    updateTableListCharge(charges: ChargeOfAccountingManagementModel[] | boolean | unknown | any) {
        if (!this.detectDuplicateCharge([...this.charges, ...charges])) {
            this.charges = [...this.charges, ...cloneDeep(charges)]; // * CloneDeep to avoid shadow copy after call fn => refreshListCharge()

            this.listAmountDefault = [...this.charges].map((item: ChargeOfAccountingManagementModel) => {
                return <IListChargeAmountDefault>{
                    id: item.surchargeId,
                    amountVnd: item.amountVnd,
                    vatAmountVnd: item.vatAmountVnd
                };
            });

            this.updateTotalAmount();

            if (this._type !== 'invoice') {
                this.charges.forEach(c => {
                    if (!!c.invoiceDate) {
                        if (new Date(c.invoiceDate).toString() !== "Invalid Date") {
                            c.invoiceDate = formatDate(new Date(c.invoiceDate), 'dd/MM/yyyy', 'en');
                        }
                    }
                });
            }

        } else {
            this._toastService.warning("Charge has existed in list");
            return;
        }
    }

    sortCharges(sort: string) {
        this.charges = this._sortService.sort(this.charges, sort, this.order);
    }

    calculateTotalAmountVND(charges: ChargeOfAccountingManagementModel[]): ITotalAmountVatVnd {
        const total: ITotalAmountVatVnd = {
            totalAmountVnd: 0,
            totalAmountVat: 0
        };
        if (charges.length) {
            total.totalAmountVnd = charges.reduce((acc, curr) => (acc += curr.amountVnd), 0);
            total.totalAmountVat = charges.reduce((acc, curr) => (acc += curr.vatAmountVnd), 0);
        }

        return total;
    }

    updateTotalAmount() {
        const totalData: ITotalAmountVatVnd = this.calculateTotalAmountVND(this.charges);
        this.totalAmountVnd = totalData.totalAmountVnd;
        this.totalAmountVat = totalData.totalAmountVat;
    }

    detectDuplicateCharge(charges: ChargeOfAccountingManagementModel[]) {
        if (!charges.length) {
            return false;
        }
        return this.utility.checkDuplicateInObject('surchargeId', charges);
    }

    checkUncheckAllCharge() {
        for (const charge of this.charges) {
            charge.isSelected = this.isCheckAll;
        }
    }

    onChangeCheckBoxCharge(e: any, selectedCharge: ChargeOfAccountingManagementModel) {
        this.isCheckAll = this.charges.every((item: ChargeOfAccountingManagementModel) => item.isSelected === true);
        if (this.type === 'invoice') {
            if (e.target.checked) {
                if (!!selectedCharge.soaNo) {
                    this.updateChargeOfAcc('soaNo', selectedCharge.soaNo);
                } else {
                    if (!!selectedCharge.cdNoteNo) {
                        this.updateChargeOfAcc('cdNoteNo', selectedCharge.cdNoteNo);
                    }
                }
            } else {
                if (!!selectedCharge.soaNo) {
                    this.updateChargeOfAcc('soaNo', selectedCharge.soaNo, false);
                } else {
                    if (!!selectedCharge.cdNoteNo) {
                        this.updateChargeOfAcc('cdNoteNo', selectedCharge.cdNoteNo, false);
                    }
                }
            }
        } else {
            if (e.target.checked) {
                if (!!selectedCharge.settlementCode) {
                    this.updateChargeOfAcc('settlementCode', selectedCharge.settlementCode);

                } else if (!!selectedCharge.soaNo) {
                    this.updateChargeOfAcc('soaNo', selectedCharge.soaNo);
                } else {
                    if (!!selectedCharge.cdNoteNo) {
                        this.updateChargeOfAcc('cdNoteNo', selectedCharge.cdNoteNo);
                    }
                }
            } else {
                if (!!selectedCharge.settlementCode) {
                    this.updateChargeOfAcc('settlementCode', selectedCharge.settlementCode, false);

                } else if (!!selectedCharge.soaNo) {
                    this.updateChargeOfAcc('soaNo', selectedCharge.soaNo, false);
                } else {
                    if (!!selectedCharge.cdNoteNo) {
                        this.updateChargeOfAcc('cdNoteNo', selectedCharge.cdNoteNo, false);
                    }
                }
            }
        }
    }

    updateChargeOfAcc(key: string, value: string, isCheck: boolean = true) {
        this.charges.forEach(c => {
            if (c[key] === value) {
                c.isSelected = isCheck;
            }
        });
    }

    @delayTime(500)
    removeCharge() {
        const chargeToDelete: ChargeOfAccountingManagementModel[] = this.charges.filter(x => x.isSelected);
        if (!!chargeToDelete.length) {
            this.contentConfirmRemoveCharge = `Are you sure you want to remove <span class="font-weight-bold">${this.getDataRemove(chargeToDelete, 'soaNo')} ${this.getDataRemove(chargeToDelete, 'cdNoteNo')} ? </span>`;
            this.showPopupDynamicRender(ConfirmPopupComponent, this.templateInject.viewContainerRef, {
                body: this.contentConfirmRemoveCharge,
                iconConfirm: 'la la-trash',
                classConfirmButton: 'btn-danger'
            }, () => {
                this.onRemoveCharge();
            })
        } else {
            return;
        }
    }

    onRemoveCharge() {
        this.charges = this.charges.filter((item: ChargeOfAccountingManagementModel) => !item.isSelected);

        this.isCheckAll = false;

        // * calculate total.
        const totalData: ITotalAmountVatVnd = this.calculateTotalAmountVND(this.charges);
        this.totalAmountVnd = totalData.totalAmountVnd;
        this.totalAmountVat = totalData.totalAmountVat;
    }

    getDataRemove(charges: ChargeOfAccountingManagementModel[], key: string): string {
        const data: string[] = charges.filter(x => Boolean(x[key])).map(i => i[key]);
        if (!data.length) {
            return '';
        }
        return data.join(",\n");
    }

    refreshListCharge() {
        this._store.select(getAccountingManagementPartnerChargeState)
            .pipe(takeUntil(this.ngUnsubscribe),
                switchMap(
                    (listChargeInStore: ChargeOfAccountingManagementModel[]) => {
                        if (!!listChargeInStore.length) {
                            return this._accountingRepo.calculateListChargeAccountingMngt(listChargeInStore);
                        }
                        return of(false);
                    }
                )
            ).subscribe(
                (data: IChargeAccountingMngtTotal | any) => {
                    if (!!data) {
                        this.charges = cloneDeep([...(data.charges)]);

                        this.totalAmountVnd = data.totalAmountVnd;
                        this.totalAmountVat = data.totalAmountVat;
                    }
                }
            );
    }

    onBlurAnyCharge(e: any) {
        this.updateForChargerByFieldName(e.target.name, e.target.value);
    }

    updateForChargerByFieldName(field: string, value: string) {
        this.charges.forEach(ele => {
            if (ele[field] === null || ele[field] === "") {
                ele[field] = value;
            }
        });
    }

    // TODO xác nhận lại với kế toán
    VatAmountChange(amount: number, charge: ChargeOfAccountingManagementModel, type: string = 'amount') {
        if (this.isReadOnly) {
            return;
        }
        if (type === 'vat') {
            charge.isValidVatAmount = this.checkValidAmountDataChange(+amount, charge.surchargeId, 'vat');
        } else {
            charge.isValidAmount = this.checkValidAmountDataChange(+amount, charge.surchargeId, 'amount');
        }
    }

    checkValidAmountDataChange(data: number, surchargeId: string, type: string): boolean {
        let valid: boolean = false;
        let validRangeAmountData: number[] = [];
        const vatAmountDataCharge = this.listAmountDefault.find((i: IListChargeAmountDefault) => i.id === surchargeId);

        if (!!vatAmountDataCharge) {
            if (type === 'vat') {
                validRangeAmountData = [
                    (vatAmountDataCharge.vatAmountVnd + 1000) as number,
                    (vatAmountDataCharge.vatAmountVnd - 1000) as number,
                ];
                if (data >= validRangeAmountData[1] && data <= validRangeAmountData[0]) {
                    valid = true;
                }
            } else {
                validRangeAmountData = [
                    (vatAmountDataCharge.amountVnd + 1000) as number,
                    (vatAmountDataCharge.amountVnd - 1000) as number,
                ];
                if (data >= validRangeAmountData[1] && data <= validRangeAmountData[0]) {
                    valid = true;
                }
            }

        }
        return valid;
    }

    onChangeExcRate(exc: number, charge: ChargeOfAccountingManagementModel) {
        if (charge.currency === 'VND') {
            return;
        }
        charge.amountVnd = Math.round(charge.orgAmount * exc);

        if (charge.vat > 0 && charge.vat <= 100) {
            charge.vatAmountVnd = Math.round(charge.amountVnd * (charge.vat / 100));
        } else {
            charge.vatAmountVnd = Math.round(Math.abs(charge.vat) * exc);
        }
    }
}

interface ITotalAmountVatVnd {
    totalAmountVnd: number;
    totalAmountVat: number;
}

interface IChargeAccountingMngtTotal extends ITotalAmountVatVnd {
    charges: ChargeOfAccountingManagementModel[];
    totalAmount: number;
}

interface IListChargeAmountDefault {
    id: string;
    amountVnd: number;
    vatAmountVnd: number;
}

