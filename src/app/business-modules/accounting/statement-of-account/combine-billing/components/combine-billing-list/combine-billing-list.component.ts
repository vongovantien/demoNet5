import { Component, OnInit } from '@angular/core';
import { AppList } from '@app';

@Component({
  selector: 'combine-billing-list',
  templateUrl: './combine-billing-list.component.html',
})
export class CombineBillingListComponent extends AppList implements OnInit {

  originShipments: any = [];
  shipments: any = [];
  sumTotalObj = {
    totalAmountUsd: 0,
    totalAmountVnd: 0,
  };
  isCheckAllCharge: boolean = false;
  constructor() {
    super();
  }

  ngOnInit() {
    this.headers = [
      { title: 'SOA/CD Note', field: 'refno', sortable: true, width: 100 },
      { title: 'Job No', field: 'jobNo', width: 100 },
      { title: 'HBL - MBL', field: '', width: 200 },
      { title: 'Custom No', field: 'customNo', width: 50 },
      { title: 'Original Amount', field: '', width: 100, align: this.right },
      { title: 'Amount VND', field: 'amountVnd', width: 100, align: this.right },
      { title: 'Amount USD', field: 'amountUsd', width: 100, align: this.right },
      { title: 'Type', field: 'type' }
    ];
    this.calculateSumTotal();
  }

  calculateSumTotal() {
    if (!!this.shipments.length) {
      this.sumTotalObj = this.calculateTotal(this.shipments);
    }
  }

  calculateTotal(model: any[]) {
    const totalData = {
      totalAmountUsd: 0,
      totalAmountVnd: 0,
    };

    for (let index = 0; index < model.length; index++) {
      const item: any = model[index];
      totalData.totalAmountUsd += (+(item.amountUsd) ?? 0);
      totalData.totalAmountVnd += (+(item.amountVnd) ?? 0);
    }
    return totalData;
  }

  checkUncheckAllCharge() {
    for (const shipment of this.shipments) {
      shipment.isSelected = this.isCheckAllCharge;
    }
  }

  onChangeCheckBoxCharge($event: Event) {
    this.isCheckAllCharge = this.shipments.every((item: any) => item.isSelected);
  }

  removeItem() {
    this.shipments = this.shipments.filter((item: any) => !item.isSelected);
    this.originShipments = this.shipments;
    this.calculateSumTotal();
  }
}
