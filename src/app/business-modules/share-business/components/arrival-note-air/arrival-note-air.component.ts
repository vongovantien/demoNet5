import { Component, OnInit, ViewChild, ViewChildren, ViewContainerRef, QueryList } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { CommonEnum } from '@enums';
import { ConfirmPopupComponent, AppComboGridComponent } from '@common';
import { CatalogueRepo, DocumentationRepo } from '@repositories';
import { SortService } from '@services';

import { ChargeConstants } from 'src/constants/charge.const';
import { AppList } from 'src/app/app.list';
import { SystemConstants } from 'src/constants/system.const';

import { ArrivalFreightCharge, User, Charge, Unit, Currency, CsTransactionDetail, Container, CsTransaction } from '@models';

import { getTransactionLocked, GetDetailHBLAction, getTransactionDetailCsTransactionState, getDetailHBlState } from '../../store';
import { IArrivalFreightChargeDefault, IArrivalDefault } from '../hbl/arrival-note/arrival-note.component';
import { HBLArrivalNote } from 'src/app/shared/models/document/arrival-note-hbl';

import { Observable, of } from 'rxjs';
import { catchError, takeUntil, switchMap, finalize, tap, skip, concatMap, map } from 'rxjs/operators';
import { InjectViewContainerRefDirective } from '@directives';
import * as fromShare from './../../store';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'arrival-note-air',
    templateUrl: './arrival-note-air.component.html',
    styleUrls: ['./arrival-note-air.component.scss'],
})
export class ShareBusinessArrivalNoteAirComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    // @ViewChildren('container', { read: ViewContainerRef }) public combogrids: QueryList<ViewContainerRef>;
    @ViewChildren(InjectViewContainerRefDirective, { read: ViewContainerRef }) public combogrids: QueryList<ViewContainerRef>;

    hblArrivalNote: HBLArrivalNote = new HBLArrivalNote();

    headers: CommonInterface.IHeaderTable[];

    userLogged: User = new User();
    hbl: CsTransactionDetail = new CsTransactionDetail();

    listCharges: Charge[] = [];
    listUnits: Observable<Unit[]>;
    listCurrency: Observable<Currency[]>;

    headerCharge: CommonInterface.IHeaderTable[];
    quantityTypes: CommonInterface.IValueDisplay[];

    defaultExchangeRate: number;
    selectedIndexFreightCharge: number = -1;

    isSubmitted: boolean = false;

    selectedFreightCharge: ArrivalFreightCharge;
    hblid: string;


    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<any>,
        private _documentRepo: DocumentationRepo,
        private _sortService: SortService,
        private _ngProgress: NgProgress,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute
    ) {
        super();

        this._progressRef = this._ngProgress.ref();

        this.requestSort = this.sortFreightCharge;

        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }


    ngOnInit() {
        this.configData();
        this.getCharge();
        this.getCurrency();
        this.getUnit();

        // * Get default exchange rate.
        this.getExchangeRate('USD', formatDate(new Date(), 'yyyy-MM-dd', 'en')).then(
            (exchangeRate: IExchangeRate) => {
                if (!!exchangeRate) {
                    this.defaultExchangeRate = exchangeRate.rate;
                }
            }
        );

        this.subscription = this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    if (p.hblId) {
                        this.hblid = p.hblId;
                    } else {
                        this.hblid = SystemConstants.EMPTY_GUID;
                    }
                    return of(this.hblid);
                }),
                switchMap(() => this._documentRepo.getArrivalInfo(this.hblid, CommonEnum.TransactionTypeEnum.AirImport)), // * Stream 1: Get arrival info.
                concatMap((data: HBLArrivalNote) => {
                    // * Update HBL ArrivalNote model from dataDefault.
                    this.hblArrivalNote.arrivalHeader = data.arrivalHeader;
                    this.hblArrivalNote.arrivalFooter = data.arrivalFooter;
                    this.hblArrivalNote.csArrivalFrieghtCharges = data.csArrivalFrieghtCharges || [];
                    this.hblArrivalNote.hblid = data.hblid;

                    if (!data.arrivalNo) {
                        return this._store.select(getTransactionDetailCsTransactionState).pipe(takeUntil(this.ngUnsubscribe));  // * Stream 2: get shipment detail
                    } else {
                        this.hblArrivalNote.arrivalNo = data.arrivalNo;
                        this.hblArrivalNote.arrivalFirstNotice = !!data.arrivalFirstNotice ? {
                            startDate: new Date(data.arrivalFirstNotice),
                            endDate: new Date(data.arrivalFirstNotice),
                        } : null;
                        this.hblArrivalNote.arrivalSecondNotice = !!data.arrivalSecondNotice ? {
                            startDate: new Date(data.arrivalSecondNotice),
                            endDate: new Date(data.arrivalSecondNotice),
                        } : null;

                        return of(this.hblArrivalNote);
                    }
                }),
                map((res: CsTransaction | HBLArrivalNote | any) => {
                    // * If res are DeliveryOrder object
                    if (res.hasOwnProperty("arrivalHeader")) {
                        return res;
                    }

                    // * Update field from shipment
                    this.hblArrivalNote.arrivalNo = res.jobNo + "-" + "A01";
                    this.hblArrivalNote.arrivalFirstNotice = {
                        startDate: new Date(),
                        endDate: new Date()
                    };

                    return new HBLArrivalNote(this.hblArrivalNote);
                })
            )
            .subscribe((res) => { console.log("subscribe", res); });

        this.isLocked = this._store.select(getTransactionLocked);

        this._store.select(getDetailHBlState)
            .pipe(
                skip(1),
                catchError(this.catchError),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: CsTransactionDetail) => {
                    if (!!res) {
                        this.hbl = res;
                        console.log(this.hbl);

                    }
                },
            );
    }


    configData() {
        this.headers = [
            { title: 'Charge', field: 'chargeId', sortable: true, width: 250 },
            { title: 'Quantity', field: 'quantity', sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total Amount', field: 'total', sortable: true },
            { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Show', field: 'isShow', sortable: true },
            { title: 'Full', field: 'isFull', sortable: true },
            { title: 'Tick', field: 'isTick', sortable: true },
        ];

        this.quantityTypes = [
            { displayName: 'G.W', value: CommonEnum.QUANTITY_TYPE.GW },
            { displayName: 'C.W', value: CommonEnum.QUANTITY_TYPE.CW },
            { displayName: 'CBM', value: CommonEnum.QUANTITY_TYPE.CBM },
            { displayName: 'P.K', value: CommonEnum.QUANTITY_TYPE.PACKAGE },
            { displayName: 'H.W', value: CommonEnum.QUANTITY_TYPE.HW },
        ];

        this.headerCharge = [
            { title: 'Name', field: 'chargeNameEn' },
            { title: 'Unit Price', field: 'unitPrice' },
            { title: 'Unit', field: 'unitId' },
            { title: 'Code', field: 'code' },
        ];
    }

    setDefaultArrivalNote() {
        // get JobNo and "Select Store chỗ nào thì takeUntil để tranh memoryLeak" a Thuong said:
        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: CsTransaction) => {
                if (!!res) {
                    this.hblArrivalNote.arrivalNo = res.jobNo + "-A01";
                    this.hblArrivalNote.arrivalFirstNotice = { startDate: new Date(), endDate: new Date() };
                }
            });
    }

    addCharge() {
        const newCharge: ArrivalFreightCharge = new ArrivalFreightCharge();
        newCharge.currencyId = "USD";

        // * Update field.
        newCharge.exchangeRate = this.defaultExchangeRate;
        newCharge.hblid = this.hblArrivalNote.hblid;

        this.hblArrivalNote.csArrivalFrieghtCharges.push(newCharge);
    }

    deleteFreightCharge(index: number, chargeItem: ArrivalFreightCharge) {
        this.selectedIndexFreightCharge = index;

        // * detect => Has Freight charge saved ?
        if (chargeItem.id === SystemConstants.EMPTY_GUID) {
            this.hblArrivalNote.csArrivalFrieghtCharges.splice(index, 1);
        } else {
            this.confirmDeletePopup.show();
        }
    }

    sortFreightCharge() {
        this.hblArrivalNote.csArrivalFrieghtCharges = this._sortService.sort(this.hblArrivalNote.csArrivalFrieghtCharges, this.sort, this.order);
    }

    onDeleteFreightCharge() {
        this.confirmDeletePopup.hide();
        this.hblArrivalNote.csArrivalFrieghtCharges.splice(this.selectedIndexFreightCharge, 1);
    }

    duplicateFreightCharge(indexFreightCharge: number) {
        const newCharge: ArrivalFreightCharge = new ArrivalFreightCharge(this.hblArrivalNote.csArrivalFrieghtCharges[indexFreightCharge]);
        this.hblArrivalNote.csArrivalFrieghtCharges.push(newCharge);
    }

    getCharge() {
        this._catalogueRepo.getCharges({ active: true, serviceTypeId: ChargeConstants.AI_CODE, type: CommonEnum.CHARGE_TYPE.DEBIT })
            .pipe(catchError(this.catchError))
            .subscribe(
                (charges: Charge[]) => {
                    this.listCharges = charges;
                }
            );
    }

    getCurrency() {
        this.listCurrency = this._catalogueRepo.getCurrencyBy({ active: true })
            .pipe(catchError(this.catchError));
    }

    getUnit() {
        this.listUnits = this._catalogueRepo.getUnit({ active: true })
            .pipe(catchError(this.catchError));
    }

    async getExchangeRate(currency: any, date: string) {
        try {
            this._progressRef.start();
            const exchangeRate: IExchangeRate = await this._catalogueRepo.convertExchangeRate(date, currency).toPromise();
            if (!!exchangeRate) {
                return exchangeRate;
            }
        } catch (error) {

        } finally {
            this._progressRef.complete();
        }
    }

    onChangeCurrency(currencyId: any, charge: ArrivalFreightCharge) {
        this.getExchangeRate(currencyId, formatDate(new Date(), 'yyyy-MM-dd', 'en')).then(
            (exchangeRate: IExchangeRate) => {
                if (!!exchangeRate) {
                    charge.exchangeRate = exchangeRate.rate;
                } else {
                    charge.exchangeRate = 0;
                }
            }
        );
    }

    validateFirst_SecondNotice(firstNote: any, secondNote: any) {
        if (!firstNote || !secondNote) {
            return false;
        }
        if (!secondNote.startDate) {
            return false;
        }
        const _firstNote = new Date(firstNote.startDate).getTime();
        const _secondNote = new Date(secondNote.startDate).getTime();
        return (_secondNote < _firstNote) ? true : false;
    }

    validateEta_FirstNotice(eta: any, firstNote: any) {
        console.log(eta);
        if (!eta || !firstNote) {
            return false;
        }
        const _eta = new Date(eta).getTime();
        const _firstNote = new Date(firstNote.startDate).getTime();
        return (_firstNote < _eta) ? true : false;
    }

    saveArrivalNote() {
        this.isSubmitted = true;
        const dateNotice = {
            arrivalFirstNotice: !!this.hblArrivalNote.arrivalFirstNotice && !!this.hblArrivalNote.arrivalFirstNotice.startDate ? formatDate(this.hblArrivalNote.arrivalFirstNotice.startDate, 'yyyy-MM-dd', 'en') : null,
            arrivalSecondNotice: !!this.hblArrivalNote.arrivalSecondNotice && <any>!!this.hblArrivalNote.arrivalSecondNotice.startDate ? formatDate(this.hblArrivalNote.arrivalSecondNotice.startDate, 'yyyy-MM-dd', 'en') : null,
        };

        this._progressRef.start();
        this._documentRepo.updateArrivalInfo(Object.assign({}, this.hblArrivalNote, dateNotice))
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * Dispatch for detail HBL to update HBL state.
                        this._store.dispatch(new GetDetailHBLAction(this.hblArrivalNote.hblid));
                    }
                }
            );
    }

    setDefaultHeadeFooter() {
        const body: IArrivalDefault = {
            transactionType: CommonEnum.TransactionTypeEnum.AirImport,
            userDefault: this.userLogged.id,
            arrivalFooter: this.hblArrivalNote.arrivalFooter,
            arrivalHeader: this.hblArrivalNote.arrivalHeader,
            type: CommonEnum.TransactionTypeEnum.AirImport,

        };

        this._progressRef.start();

        this._documentRepo.setArrivalHeaderFooterDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    setDefaultFreightCharge() {
        const body: IArrivalFreightChargeDefault = {
            userDefault: this.userLogged.id,
            transactionType: CommonEnum.TransactionTypeEnum.AirImport,
            csArrivalFrieghtChargeDefaults: this.hblArrivalNote.csArrivalFrieghtCharges,
            type: CommonEnum.TransactionTypeEnum.AirImport,
            hblId: this.hblid
        };

        this._progressRef.start();

        this._documentRepo.setArrivalFreightChargeDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onChangeQuantity(quantity: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, quantity, chargeItem.unitPrice);
    }

    onChangeVat(vat: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(vat, chargeItem.quantity, chargeItem.unitPrice);
    }

    onChangeUnitPrice(unitPrice: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, chargeItem.quantity, unitPrice);
    }

    onChangeQuantityType(type: string, chargeItem: ArrivalFreightCharge) {
        switch (type) {
            case CommonEnum.QUANTITY_TYPE.GW:
                chargeItem.quantity = this.hbl.grossWeight;
                break;
            case CommonEnum.QUANTITY_TYPE.NW:
                chargeItem.quantity = this.hbl.netWeight;
                break;
            case CommonEnum.QUANTITY_TYPE.CBM:
                chargeItem.quantity = this.hbl.cbm;
                break;
            case CommonEnum.QUANTITY_TYPE.CW:
                chargeItem.quantity = this.hbl.chargeWeight;
                break;
            case CommonEnum.QUANTITY_TYPE.PACKAGE:
                chargeItem.quantity = this.hbl.packageQty;
                break;
            default:
                break;
        }

        // * Update quantityType, total.
        chargeItem.quantityType = type;
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, chargeItem.quantity, chargeItem.unitPrice);
    }

    onSelectCharge(data: Charge, chargeItem: ArrivalFreightCharge | any) {
        chargeItem.chargeId = data.id;
        chargeItem.description = data.chargeNameEn;

        chargeItem.unitId = data.unitId;
        chargeItem.unitPrice = data.unitPrice;

        // * Hide combogrid.
        chargeItem.isShowCharge = false;

    }

    calculateContainer(containers: Container[], key: string): number {
        let total: number = 0;
        total = containers.reduce((acc: any, curr: Container) => acc += curr[key], 0);
        return total;
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.hblArrivalNote.csArrivalFrieghtCharges) {
            if (
                !charge.chargeId
                || charge.unitPrice < 0
                || charge.vatrate > 100
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }

    showCharge(charge: ArrivalFreightCharge, index: number) {
        this.selectedFreightCharge = charge;
        this.selectedIndexFreightCharge = index;

        const comboGridContainerRef: ViewContainerRef = this.combogrids.toArray()[index];
        this.componentRef = this.renderDynamicComponent(AppComboGridComponent, comboGridContainerRef);

        if (!!this.componentRef) {
            this.componentRef.instance.headers = this.headerCharge;
            this.componentRef.instance.data = this.listCharges;
            this.componentRef.instance.fields = ['chargeNameEn'];
            this.componentRef.instance.active = charge.chargeId;

            // * Listen Event.
            this.subscription = ((this.componentRef.instance) as AppComboGridComponent<Charge>).onClick.subscribe(
                (v: any) => {
                    this.onSelectCharge(v, this.selectedFreightCharge);

                    this.subscription.unsubscribe();
                    comboGridContainerRef.clear();
                });

            ((this.componentRef.instance) as AppComboGridComponent<Charge>).clickOutSide
                .pipe(skip(1))
                .subscribe(
                    () => {
                        comboGridContainerRef.clear();
                    }
                );
        }
    }
}

interface IExchangeRate {
    id: number;
    currencyFromID: string;
    rate: number;
    currencyToID: string;
}

