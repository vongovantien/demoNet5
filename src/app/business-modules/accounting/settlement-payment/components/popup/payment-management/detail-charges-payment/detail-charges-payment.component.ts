import { Component, OnInit } from '@angular/core';
import { AppList } from '@app';

@Component({
  selector: 'detail-charges-payment',
  templateUrl: './detail-charges-payment.component.html'
})
export class SettlementDetailChargesPaymentComponent extends AppList implements OnInit {
  headers: CommonInterface.IHeaderTable[];
  chargesSettlementPayment: any = [];
  
  constructor() {
    super();
  }

  ngOnInit() {
    this.headers = [
      { title: 'No', field: '', sortable: true },
      { title: 'Charge Code', field: 'chargeCode', sortable: true },
      { title: 'Charge Name', field: 'chargeName', sortable: true },
      { title: 'Amount', field: 'totalAmount', sortable: true },
      { title: 'Payer', field: 'payer', sortable: true },
      { title: 'OBH Partner', field: 'obhPartner', sortable: true },
      { title: 'Invoice No', field: 'invoiceNo', sortable: true },
      { title: 'Settlement No', field: 'settlementNo', sortable: true },
      { title: "Settlement Status", field: 'settlementStatus', sortable: true },
      { title: "Advance No", field: 'advanceNo', sortable: true },
      { title: 'Requester', field: 'requester', sortable: true },
    ];
  }

}
