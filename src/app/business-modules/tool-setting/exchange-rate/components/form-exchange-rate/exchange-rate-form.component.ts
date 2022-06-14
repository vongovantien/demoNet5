import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from '@repositories';
import { CatCurrencyExchange, User } from '@models';
import { ToastrService } from 'ngx-toastr';
import { SystemConstants } from 'src/constants/system.const';
import { ConfirmPopupComponent } from '@common';

@Component({
    selector: 'exchange-rate-form',
    templateUrl: './exchange-rate-form.component.html',
})

export class ExchangeRateFormComponent extends AppForm implements OnInit {
    @Output() onUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('confirmDeletePopup') confirmDeletePopup: ConfirmPopupComponent;

    exchangeRateNewest: any = {};
    exchangeRateToAdd: any = {
        currencyToId: 'VND',
        CatCurrencyExchangeRates: new Array<CatCurrencyExchange>(),
        userModified: ''
    };

    isAllowUpdateRate: boolean = false;
    inValid: boolean = false;

    userLogged: User;
    catCurrencies: any[];
    localCurrency: string = 'VND';

    currencyRateToDelete: any;


    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,

    ) {
        super();
    }

    ngOnInit(): void {
        this.getExchangeNewest();
        this.getUserLogged();

    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    getCatCurrencies() {
        this._catalogueRepo.getListCurrency()
            .subscribe((response: any) => {
                this.catCurrencies = [];
                console.log(this.catCurrencies);
                if (response != null) {
                    response.forEach(element => {
                        if (element.id === this.localCurrency) { return; } else {
                            if (this.exchangeRateNewest != null) {
                                const indexCurrency = this.exchangeRateNewest.exchangeRates.findIndex(x => x.currencyFromID === element.id);
                                if (indexCurrency === -1) {
                                    this.catCurrencies.push({ "text": element.id, "id": element.id });
                                }
                            } else {
                                this.catCurrencies.push({ "text": element.id, "id": element.id });
                            }
                        }
                    });
                }
            });
    }

    getExchangeNewest() {
        this._catalogueRepo.getNewestExchangeRate()
            .pipe()
            .subscribe(
                (responses) => {
                    this.exchangeRateNewest = responses;
                    this.getCatCurrencies();
                }
            );
    }

    updateRate() {
        this.exchangeRateToAdd = {
            currencyToId: this.localCurrency,
            CatCurrencyExchangeRates: new Array<CatCurrencyExchange>(),
            userModified: this.userLogged.id
        };
        this.exchangeRateNewest.exchangeRates.forEach(element => {
            if (element.newRate !== undefined) {
                this.exchangeRateToAdd.CatCurrencyExchangeRates.push({ currencyFromId: element.currencyFromID, rate: element.newRate, isUpdate: true });
            } else {

                this.exchangeRateToAdd.CatCurrencyExchangeRates.push({ currencyFromId: element.currencyFromID, rate: element.rate });
            }
        });
        this._catalogueRepo.updateExchangeRate(this.exchangeRateToAdd)
            .pipe()
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onUpdate.emit(true);
                        this.isAllowUpdateRate = false;
                        this.getExchangeNewest();
                        return;
                    }
                    this._toastService.error(res.message);
                }
            );
    }

    valueChange(value: any) {
        if (value != null) {
            this.isAllowUpdateRate = true;
        } else {
            this.isAllowUpdateRate = false;
            for (const element of this.exchangeRateNewest.exchangeRates) {
                if (element.newRate != null) {
                    this.isAllowUpdateRate = true;
                    break;
                }
            }
        }
    }

    resetForm(form) {
        this.exchangeRateToAdd = {
            currencyToId: this.localCurrency,
            CatCurrencyExchangeRates: new Array<CatCurrencyExchange>(),
            userModified: ''
        };
        form.onReset();
    }

    addNewRate() {
        if (this.catCurrencies.length === 0) {
            this._toastService.warning("All currencies have added.");
        } else {
            if (this.exchangeRateToAdd.CatCurrencyExchangeRates.length > 0) {
                if (this.exchangeRateToAdd.CatCurrencyExchangeRates[this.exchangeRateToAdd.CatCurrencyExchangeRates.length - 1].currencyFromId == null) {

                    this._toastService.warning("Please select currency to add new Rate");
                } else {
                    this.exchangeRateToAdd.CatCurrencyExchangeRates.push({ currencyFromId: null, rate: 0 });
                }
            } else {
                this.exchangeRateToAdd.CatCurrencyExchangeRates.push({ currencyFromId: null, rate: 0 });
            }
        }
    }

    showSetting() {
        this.exchangeRateToAdd = {
            currencyToId: this.localCurrency,
            CatCurrencyExchangeRates: new Array<CatCurrencyExchange>(),
            userModified: ''
        };
        this.getCatCurrencies();
    }

    removeNewRate(index) {
        const currency = this.exchangeRateToAdd.CatCurrencyExchangeRates[index];
        this.exchangeRateToAdd.CatCurrencyExchangeRates.splice(index, 1);
        this.catCurrencies.push({ "text": currency.currencyFromId, "id": currency.currencyFromId });
    }

    saveNewRate() {
        this.isSubmitted = true;
        const index = this.exchangeRateToAdd.CatCurrencyExchangeRates.findIndex(x => x.currencyFromId == null);
        if (index < 0) {
            this.inValid = false;
            if (this.exchangeRateToAdd.CatCurrencyExchangeRates.length > 0) {
                let isExist = false;
                this.exchangeRateToAdd.CatCurrencyExchangeRates.forEach(element => {
                    if (this.exchangeRateNewest != null) {
                        const indexExchangeRate: number = this.exchangeRateNewest.exchangeRates.findIndex(x => x.currencyFromID === element.currencyFromId);
                        if (indexExchangeRate > -1) {
                            isExist = true;
                            return;
                        }
                    }
                });
                if (isExist) {
                    this._toastService.warning("This currency has been added");
                } else {
                    this._catalogueRepo.updateExchangeRate(this.exchangeRateToAdd)
                        .pipe()
                        .subscribe(
                            (res: CommonInterface.IResult) => {
                                if (res.status) {
                                    this.exchangeRateToAdd = {
                                        currencyToId: this.localCurrency,
                                        CatCurrencyExchangeRates: new Array<CatCurrencyExchange>(),
                                        userModified: ''
                                    };
                                    this.getExchangeNewest();
                                    this.onUpdate.emit(true);
                                    return;
                                }
                                this._toastService.error(res.message);
                            }
                        );
                }
            }
            this._toastService.success('Data has been updated');
        } else {
            this.inValid = true;
            this._toastService.warning("Please select currency to add new Rate");
        }
    }

    public removedCurrency(value: any): void {
        const index = this.exchangeRateToAdd.CatCurrencyExchangeRates.findIndex(x => x.currencyFromId == value.id);
        this.exchangeRateToAdd.CatCurrencyExchangeRates.splice(index, 1);
    }

    public selectedCurrencyToAddRate(value: any): void {
        if (this.exchangeRateNewest != null) {
            const checkCurrencyFrom = obj => obj.currencyFromId === value.id;
            const isExist = this.exchangeRateNewest.exchangeRates.some(checkCurrencyFrom);
            if (!isExist) {
                this.exchangeRateToAdd.CatCurrencyExchangeRates[this.exchangeRateToAdd.CatCurrencyExchangeRates.length - 1].currencyFromId = value.id;
                this.catCurrencies.splice(this.catCurrencies.findIndex(x => x.id === value.id), 1);
            }
        } else {
            this.exchangeRateToAdd.CatCurrencyExchangeRates[this.exchangeRateToAdd.CatCurrencyExchangeRates.length - 1].currencyFromId = value.id;
            this.catCurrencies.splice(this.catCurrencies.findIndex(x => x.id === value.id), 1);
        }
    }

    confirmDeleteRate(item) {
        this.currencyRateToDelete = item;
        this.isSubmitted = true;
        const index = this.exchangeRateToAdd.CatCurrencyExchangeRates.findIndex(x => x.currencyFromID == null);
        if (index < 0) {
            this.confirmDeletePopup.show();
        } else {
            this._toastService.warning("Please save current exchange rate");
        }
    }

    onDelete(event) {
        this.confirmDeletePopup.hide();
        this.isSubmitted = true;
        if (event === true) {
            this._catalogueRepo.removeCurrencyExchangeRate(this.currencyRateToDelete.currencyFromID).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.catCurrencies.push({ "text": this.currencyRateToDelete.currencyFromID, "id": this.currencyRateToDelete.currencyFromID });

                        this.getExchangeNewest();
                    }
                }
            );

        }
    }

    cancelAddRate() {
        this.getCatCurrencies();
    }



}
