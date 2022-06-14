import { Component, OnInit } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { SortService } from '@services';

@Component({
  selector: 'bill-instruction-housebills-sea-export',
  templateUrl: './bill-instruction-housebills-sea-export.component.html'
})
export class ShareBussinessBillInstructionHousebillsSeaExportComponent extends AppList implements OnInit {

  housebills: any[] = [];
  headers: CommonInterface.IHeaderTable[];

  constructor(private _sortService: SortService) {
    super();
    this.requestSort = this.sortLocal;
  }

  ngOnInit() {
    this.headers = [
      { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
      { title: 'Description', field: 'desOfGoods', sortable: true },
      { title: 'Shipping Marks', field: 'shippingMark', sortable: true },
      { title: 'Containers', field: 'contSealNo', sortable: true },
      { title: 'Packages', field: 'packageContainer', sortable: true },
      { title: 'G.W', field: 'gw', sortable: true },
      { title: 'CBM', field: 'cbm', sortable: true }
    ];
  }
  sortLocal(sort: string): void {
    this.housebills = this._sortService.sort(this.housebills, sort, this.order);
  }
}
