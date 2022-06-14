import { AppList } from "@app";
import { OnInit, Component } from "@angular/core";
import { SortService } from "@services";
import { ChargeOfAccountingManagementModel } from "@models";

@Component({
    selector: 'list-charge-confirm-billing',
    templateUrl: './list-charge-confirm-billing.component.html',
})
export class ConfirmBillingListChargeComponent extends AppList implements OnInit {
    charges: ChargeOfAccountingManagementModel[] = [];
    totalAmountVnd: number = 0;
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

    constructor(
        private _sortService: SortService,
    ) {
        super();
        this.requestSort = this.sortCharges;
    }

    ngOnInit(): void {

    }

    sortCharges(sort: string) {
        this.charges = this._sortService.sort(this.charges, sort, this.order);
    }
}