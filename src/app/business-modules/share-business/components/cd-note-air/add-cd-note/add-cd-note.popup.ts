import { PopupBase } from "src/app/popup.base";
import { Component, ViewChild, EventEmitter, Output } from "@angular/core";
import { DocumentationRepo } from "src/app/shared/repositories";
import { catchError, map } from "rxjs/operators";
import { ConfirmPopupComponent, InfoPopupComponent } from "src/app/shared/common/popup";
import { ShareBussinessCdNoteAddRemainingChargeAirPopupComponent } from "../add-remaining-charge/add-remaining-charge.popup";
import { SortService } from "src/app/shared/services";
import { ChargeCdNote } from "src/app/shared/models/document/chargeCdNote.model";
import { ToastrService } from "ngx-toastr";
import { AcctCDNote } from "src/app/shared/models/document/acctCDNote.model";
import { TransactionTypeEnum } from "src/app/shared/enums/transaction-type.enum";
import { AbstractControl, FormGroup, FormBuilder } from "@angular/forms";
@Component({
    selector: 'cd-note-add-air-popup',
    templateUrl: './add-cd-note.popup.html'
})
export class ShareBussinessCdNoteAddAirPopupComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('changePartnerPopup') changePartnerPopup: ConfirmPopupComponent;
    @ViewChild('notExistsChargePopup') notExistsChargePopup: InfoPopupComponent;
    @ViewChild(ShareBussinessCdNoteAddRemainingChargeAirPopupComponent) addRemainChargePopup: ShareBussinessCdNoteAddRemainingChargeAirPopupComponent;
    @ViewChild('confirmCloseAddPopup') confirmCloseAddPopup: ConfirmPopupComponent;
    @ViewChild('validateCDNotePopup') validateCDNotePopup: InfoPopupComponent;
    formCreate: FormGroup;

    headers: CommonInterface.IHeaderTable[];

    noteTypes = [
        { text: 'DEBIT', id: 'DEBIT' },
        { text: 'CREDIT', id: 'CREDIT' },
        { text: 'INVOICE', id: 'INVOICE' }
    ];

    action: string = 'create';
    cdNoteCode: string = '';
    cdNoteId: string = '';
    transactionType: TransactionTypeEnum = 0;

    currentMBLId: string = '';
    selectedNoteType: string = '';

    CDNote: AcctCDNote = new AcctCDNote();
    listChargePartner: ChargeCdNote[] = [];
    initGroup: ChargeCdNote[] = [];
    listCharges: any[] = [];

    selectedPartner: any = {};
    partnerCurrent: any = {};
    isHouseBillID: boolean = false;

    flexId: AbstractControl;
    note: AbstractControl;
    excRateUsdToLocal: AbstractControl;
    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    isCheckAllCharge: boolean = false;
    totalCredit: string = '';
    totalDebit: string = '';
    balanceAmount: string = '';

    isChangeCharge: boolean = false;
    messageValidate: string = '';

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _fb: FormBuilder,
    ) {
        super();
        this.selectedNoteType = "DEBIT";
        this.requestSort = this.sortCdNoteCharge;
    }

    ngOnInit() {
        this.formCreate = this._fb.group({
            flexId: [],
            note: [],
            excRateUsdToLocal: []
        });
        this.flexId = this.formCreate.controls["flexId"];
        this.note = this.formCreate.controls["note"];
        this.excRateUsdToLocal = this.formCreate.controls["excRateUsdToLocal"];
    }

    setHeader() {
        this.headers = [
            { title: 'HAWB No', field: 'hwbno', sortable: true },
            { title: 'Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'nameEn', sortable: true },
            { title: 'Quantity', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unit', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: "Credit Value", field: 'credit', sortable: true },
            { title: "Debit Value", field: 'debit', sortable: true },
            { title: 'Note', field: 'notes', sortable: true }
        ];
    }

    closePopup() {
        this.hide();
        // Reset popup về default
        this.selectedNoteType = "DEBIT";
        this.selectedPartner = {};
        this.partnerCurrent = {};
        this.listChargePartner = [];
        this.initGroup = [];
        this.isChangeCharge = false;
        this.isCheckAllCharge = false;
        this.formCreate.reset();
    }

    getListSubjectPartner(mblId: any) {
        const isHouseBillID = false;
        this._documentationRepo.getPartners(mblId, isHouseBillID)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (dataPartner: any) => {
                    this.getPartnerData(dataPartner);
                },
            );
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
        this.configPartner.displayFields = [
            { field: 'accountNo', label: 'Partner ID' },
            { field: 'shortName', label: 'Partner ABBR' },
            { field: 'partnerNameEn', label: 'Partner Name' },
            { field: 'taxCode', label: 'Tax Code' },
        ];
        this.configPartner.selectedDisplayFields = ['partnerNameEn'];
    }

    getListCharges(mblId: string, partnerId: string, isHouseBillID: boolean, cdNoteCode: string) {
        this._documentationRepo.getChargesByPartner(mblId, partnerId, isHouseBillID, cdNoteCode)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    // Set value Flex Id when create CD Note
                    this.setValueFlexId(data);
                    return data.map((item: any) => new ChargeCdNote(item));
                })
            ).subscribe(
                (dataCharges: any) => {
                    dataCharges.forEach(element => {
                        element.listCharges.forEach(ele => {
                            ele.debit = (ele.type === 'SELL' || (ele.type === 'OBH' && partnerId === ele.paymentObjectId)) ? ele.total : null;
                            ele.credit = (ele.type === 'BUY' || (ele.type === 'OBH' && partnerId === ele.payerId)) ? ele.total : null;
                            ele.canEdit = true;
                            const setEdit = ele.type === "OBH" ? (!!ele.creditNo && !!ele.debitNo) : (!!ele.creditNo || !!ele.debitNo);
                            if (setEdit) {
                                if (!!ele.creditNo && !!ele.paySoano) {
                                    ele.canEdit = false;
                                }
                                if ((!!ele.debitNo && !!ele.soano) || !!ele.acctManagementId) {
                                    ele.canEdit = false;
                                }
                            }
                        });
                    });
                    this.listChargePartner = dataCharges;
                    this.initGroup = dataCharges;
                    this.listCharges = [];
                    for (const charges of this.listChargePartner) {
                        for (const charge of charges.listCharges) {
                            this.listCharges.push(charge);
                        }
                    }
                    // Tính toán Amount Credit, Debit, Balance
                    this.calculatorAmount(this.listChargePartner);
                },
            );
    }

    setValueFlexId(data: any) {
        if (this.action === 'create') {
            let _flexId = '';
            data.forEach(element => {
                if (element.listCharges.length > 0 && element.flexId) {
                    _flexId += element.flexId + '; ';
                }
            });
            this.flexId.setValue(_flexId);
        }
    }

    onSelectDataFormInfo(data: any) {
        this.selectedPartner = { field: "id", value: data.id };
        this.getListCharges(this.currentMBLId, this.selectedPartner.value, this.isHouseBillID, "");
        this.partnerCurrent = Object.assign({}, this.selectedPartner);
        this.keyword = '';
        this.isCheckAllCharge = false;
        this.isChangeCharge = true;
    }

    onSubmitChangePartnerPopup() {
        this.keyword = '';
        this.isCheckAllCharge = false;
        // Gán this.selectedPartner cho this.partnerCurrent
        this.partnerCurrent = Object.assign({}, this.selectedPartner);
        this.getListCharges(this.currentMBLId, this.selectedPartner.value, this.isHouseBillID, "");
        this.changePartnerPopup.hide();
    }

    onCancelChangePartnerPopup() {
        // Gán this.partnerCurrent cho this.selectedPartner
        this.selectedPartner = Object.assign({}, this.partnerCurrent);
    }

    onSubmitNotExistsChargePopup() {
        this.notExistsChargePopup.hide();
    }

    checkUncheckAllCharge() {
        for (const group of this.listChargePartner) {
            group.isSelected = this.isCheckAllCharge;
            for (const item of group.listCharges) {
                if ((!item.creditNo && !item.debitNo) || item.canEdit) {
                    item.isSelected = this.isCheckAllCharge;
                }
            }
        }
    }

    onChangeCheckBoxGrpCharge(charges: any) {
        this.isCheckAllCharge = this.listChargePartner.every((item: any) => item.isSelected);
        for (const charge of charges.listCharges) {
            if ((!charge.creditNo && !charge.debitNo) || charge.canEdit) {
                charge.isSelected = charges.isSelected;
            }
        }
    }

    onChangeCheckBoxItemCharge(chargeGroup: any) {
        chargeGroup.isSelected = chargeGroup.listCharges.every((item: any) => item.isSelected);
        this.isCheckAllCharge = this.listChargePartner.every((item: any) => item.isSelected);
    }

    removeCharge() {
        this.isChangeCharge = true;
        if (this.listChargePartner.length > 0) {
            for (const charges of this.listChargePartner) {
                for (const charge of charges.listCharges.filter(group => group.isSelected)) {
                    charge.isDeleted = (!charge.creditNo || !charge.debitNo) ? true : charge.canEdit;
                }

                const chargeLen = charges.listCharges.length;
                const chargeDeletedLen = charges.listCharges.filter(group => group.isDeleted).length;
                if (chargeLen === chargeDeletedLen) {
                    charges.isDeleted = true;
                }
            }
        }
        // Tính toán Amount Credit, Debit, Balance
        const listCharge = this.getGroupChargeNotDelete(this.listChargePartner);
        this.calculatorAmount(listCharge);
    }

    getGroupChargeNotDelete(listCharge: ChargeCdNote[]) {
        let chargesNotDeleted = [];
        const grpChargesNotDeleted = [];

        if (listCharge.length > 0) {
            for (const charges of listCharge) {
                chargesNotDeleted = charges.listCharges.filter(group => !group.isDeleted);
                if (chargesNotDeleted.length > 0) {
                    grpChargesNotDeleted.push({ id: charges.id, hwbno: charges.hwbno, salemanId: charges.salemanId, isSelected: charges.isSelected, listCharges: chargesNotDeleted });
                } else {
                    grpChargesNotDeleted.push({ id: charges.id, hwbno: charges.hwbno, salemanId: charges.salemanId, isSelected: charges.isSelected, listCharges: [] });
                }
            }
        }
        return grpChargesNotDeleted;
    }

    validateChargeOfCdNote(listChargePartner: ChargeCdNote[]) {
        this.messageValidate = this.selectedNoteType + " Note existed Charge not match type, Please check again!";
        for (const charges of listChargePartner) {
            if (this.selectedNoteType === "DEBIT" || this.selectedNoteType === "INVOICE") {
                const existsCredit = charges.listCharges.filter(group => !!group.credit);
                if (existsCredit.length > 0) {
                    this.validateCDNotePopup.show();
                    return true;
                }
            } else {
                const existsDebit = charges.listCharges.filter(group => !!group.debit);
                if (existsDebit.length > 0) {
                    this.validateCDNotePopup.show();
                    return true;
                }
            }
        }

        if (this.selectedNoteType === "DEBIT" || this.selectedNoteType === "INVOICE") {
            const checkMultiSaleman = [...new Set(this.listChargePartner.filter((x: ChargeCdNote) => x.listCharges.length > 0).map(x => x.salemanId))];
            if (!!checkMultiSaleman && checkMultiSaleman.length > 1) {
                this._toastService.warning("You can't issue Debit Note/Invoice for multiple Salesman! Please check it now");
                return true;
            }
        }
        return false;
    }

    saveCDNote() {
        // Lấy danh sách group charge chưa delete
        this.listChargePartner = this.getGroupChargeNotDelete(this.listChargePartner);

        if (this.action !== "create") {
            if (this.excRateUsdToLocal.value) {
                if (Number(this.excRateUsdToLocal.value) <= 0) {
                    this._toastService.warning(`Required to enter Excel USD greater than 0`);
                    return;
                }
            } else {
                this._toastService.warning(`Required to enter Excel USD`);
                return;
            }
        }

        if (this.validateChargeOfCdNote(this.listChargePartner)) {
            return;
        }

        // Không được phép create khi chưa có charge
        if (this.listChargePartner.length === 0) {
            this.notExistsChargePopup.show();
        } else {
            this.CDNote.jobId = this.currentMBLId;
            this.CDNote.salemanId = this.listChargePartner.filter((x: ChargeCdNote) => x.listCharges.length > 0).map(x=>x.salemanId)[0];
            this.CDNote.partnerId = this.selectedPartner.value;
            this.CDNote.type = this.selectedNoteType;
            // this.CDNote.currencyId = "VND"; // in the future , this id must be local currency of each country
            this.CDNote.flexId = this.flexId.value;
            this.CDNote.transactionTypeEnum = this.transactionType;
            this.CDNote.note = this.note.value;
            this.CDNote.excRateUsdToLocal = this.excRateUsdToLocal.value;

            const arrayCharges = [];
            for (const charges of this.listChargePartner) {
                for (const charge of charges.listCharges) {
                    arrayCharges.push(charge);
                }
            }
            if (arrayCharges.length === 0) {
                this.notExistsChargePopup.show();
                return;
            }
            this.CDNote.listShipmentSurcharge = arrayCharges;
            const _totalCredit = arrayCharges.reduce((credit, charge) => credit + charge.credit * charge.exchangeRate, 0);
            const _totalDebit = arrayCharges.reduce((debit, charge) => debit + charge.debit * charge.exchangeRate, 0);
            const _balance = _totalDebit - _totalCredit;
            this.CDNote.total = _balance;
            if (Math.abs(_balance) > 99999999999999) {
                this._toastService.error('Balance amount field exceeds numeric storage size');
            } else {
                if (this.action === "create") {
                    this._documentationRepo.addCdNote(this.CDNote)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: CommonInterface.IResult) => {
                                if (res.status) {
                                    this._toastService.success(res.message);
                                    this.onRequest.emit(res.data);
                                    this.closePopup();
                                } else {
                                    this._toastService.error(res.message);
                                }
                            }
                        );
                } else {
                    this._documentationRepo.updateCdNote(this.CDNote)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: CommonInterface.IResult) => {
                                if (res.status) {
                                    this._toastService.success(res.message);
                                    let checkSoa = this.listCharges.find(x => x.soano !== "" && x.soano !== null);
                                    if (!checkSoa) { checkSoa = this.listCharges.find(x => x.paySoano !== "" && x.paySoano !== null); }
                                    if (checkSoa) {
                                        this._toastService.warning("Vui lòng cập nhật SOA");
                                    }
                                    this.onUpdate.emit();
                                    this.closePopup();
                                } else {
                                    this._toastService.error(res.message);
                                }
                            }
                        );
                }
            }
        }
    }

    calculatorAmount(listChargePartner: ChargeCdNote[]) {
        // List currency có trong listCharges
        const listCurrency = [];
        const listCharge = [];
        for (const charges of listChargePartner) {
            for (const currenct of charges.listCharges.map(m => m.currencyId)) {
                listCurrency.push(currenct);
            }
            for (const charge of charges.listCharges) {
                listCharge.push(charge);
            }
        }
        // List currency unique
        const uniqueCurrency = [...new Set(listCurrency)]; // Remove duplicate
        this.totalCredit = '';
        this.totalDebit = '';
        this.balanceAmount = '';
        for (const currency of uniqueCurrency) {
            const _credit = listCharge.filter(f => f.currencyId === currency).reduce((credit, charge) => credit + charge.credit, 0);
            const _debit = listCharge.filter(f => f.currencyId === currency).reduce((debit, charge) => debit + charge.debit, 0);
            const _balance = _debit - _credit;
            this.totalCredit += this.formatNumberCurrency(_credit) + ' ' + currency + ' | ';
            this.totalDebit += this.formatNumberCurrency(_debit) + ' ' + currency + ' | ';
            this.balanceAmount += (_balance > 0 ? this.formatNumberCurrency(_balance) : '(' + this.formatNumberCurrency(Math.abs(_balance)) + ')') + ' ' + currency + ' | ';
        }
        this.totalCredit += "]";
        this.totalDebit += "]";
        this.balanceAmount += "]";
        this.totalCredit = this.totalCredit.replace("| ]", "").replace("]", "");
        this.totalDebit = this.totalDebit.replace("| ]", "").replace("]", "");
        this.balanceAmount = this.balanceAmount.replace("| ]", "").replace("]", "");
    }

    formatNumberCurrency(input: number) {
        return input.toLocaleString(
            'en-US', // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
            { minimumFractionDigits: 3 }
        );
    }

    openPopupAddCharge() {
        this.isCheckAllCharge = false;

        this.listChargePartner = this.getGroupChargeNotDelete(this.listChargePartner);
        this.addRemainChargePopup.partner = this.selectedPartner.value;
        this.addRemainChargePopup.listChargePartner = this.listChargePartner;
        this.addRemainChargePopup.transactionType = this.transactionType;
        this.addRemainChargePopup.setHeader();
        this._documentationRepo.getChargesByPartnerNotExitstCdNote(this.currentMBLId, this.selectedPartner.value, this.isHouseBillID, this.listChargePartner)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (dataCharges: any) => {
                    dataCharges.forEach(element => {
                        element.listCharges.forEach(ele => {
                            ele.debit = (ele.type === 'SELL' || (ele.type === 'OBH' && this.selectedPartner.value === ele.paymentObjectId)) ? ele.total : null;
                            ele.credit = (ele.type === 'BUY' || (ele.type === 'OBH' && this.selectedPartner.value === ele.payerId)) ? ele.total : null;
                        });
                    });
                    this.addRemainChargePopup.listChargePartnerAddMore = dataCharges;
                    this.addRemainChargePopup.show();
                },
            );
    }

    onChangeNoteType(noteType: any) {
        this.selectedNoteType = noteType.id;
    }

    sortCdNoteCharge(sort: string): void {
        this.listChargePartner.forEach(element => {
            element.listCharges = this._sortService.sort(element.listCharges, sort, this.order);
        });
    }

    onAddMoreCharge(data: ChargeCdNote[]) {
        this.listChargePartner = [];
        this.listChargePartner = data;
        this.initGroup = data;
        // Tính toán giá trị amount, balance
        this.calculatorAmount(this.listChargePartner);
    }

    // Charge keyword search
    onChangeKeyWord(keyword: string) {
        this.listChargePartner = this.initGroup;
        // TODO improve search.
        if (!!keyword) {
            if (keyword.indexOf('\\') !== -1) { return this.listChargePartner = []; }
            keyword = keyword.toLowerCase();
            // Search group
            let dataGrp = this.listChargePartner.filter((item: any) => item.hwbno.toLowerCase().toString().search(keyword) !== -1);
            // Không tìm thấy group thì search tiếp list con của group
            if (dataGrp.length === 0) {
                const arrayCharge = [];
                for (const group of this.listChargePartner) {
                    const data = group.listCharges.filter((item: any) => item.chargeCode.toLowerCase().toString().search(keyword) !== -1 || item.nameEn.toLowerCase().toString().search(keyword) !== -1);
                    if (data.length > 0) {
                        arrayCharge.push({ id: group.id, hwbno: group.hwbno, isSelected: group.isSelected, isDeleted: group.isDeleted, listCharges: data });
                    }
                }
                dataGrp = arrayCharge;
            }
            return this.listChargePartner = dataGrp;
        } else {
            this.listChargePartner = this.initGroup;
        }
    }

    cancel() {
        if (this.isChangeCharge === false) {
            this.closePopup();
        } else {
            this.confirmCloseAddPopup.show();
        }
    }

    onSubmitConfirmCloseAdd() {
        this.confirmCloseAddPopup.hide();
        this.closePopup();
    }

    onCancelConfirmCloseAdd() {
        this.confirmCloseAddPopup.hide();
    }
}